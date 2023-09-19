package jobs

import (
	"context"
	"fmt"
	"strings"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

type Job struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	OrganizationID string    `json:"organizationId"`
	Priority       string    `json:"priority"`
	Description    string    `json:"description"`
	ReporterID     string    `json:"reporterId"`
	AssigneeIDs    []string  `json:"assigneeIds"`
	UnitIdentifier string    `json:"unitIdentifier"`
	BuildingID     string    `json:"buildingId"`
	LabelIDs       []string  `json:"labelIds"`
	Attachments    []string  `json:"attachments"`
	Cost           float64   `json:"cost"`
	Hours          int       `json:"hours"`
	RentPaid       bool      `json:"rentPaid"`
	DueDate        time.Time `json:"dueDate"`
	CreatedAt      time.Time `json:"createdAt"`
	ClosedAt       time.Time `json:"closedAt"`
}

type Store struct {
	dbpool *pgxpool.Pool
}

func NewJobStore(dbpool *pgxpool.Pool) *Store {
	return &Store{
		dbpool: dbpool,
	}
}

func (s *Store) CreateJob(job *Job) error {
	ctx := context.Background()
	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	job.ID = id
	job.CreatedAt = time.Now()

	sqlQuery := `
		INSERT INTO jobs (id, name, organization_id, priority, description, reporter_id,
		assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours,
		rent_paid, due_date, created_at, closed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`

	_, err = s.dbpool.Exec(ctx, sqlQuery,
		job.ID, job.Name, job.OrganizationID, job.Priority,
		job.Description, job.ReporterID, job.AssigneeIDs,
		job.UnitIdentifier, job.BuildingID, job.LabelIDs,
		job.Attachments, job.Cost, job.Hours, job.RentPaid,
		job.DueDate, job.CreatedAt, job.ClosedAt)

	if err != nil {
		return err
	}

	return nil
}

func (s *Store) UpdateJob(job *Job) error {
	ctx := context.Background()

	sqlQuery := `
        UPDATE jobs
        SET name = $1, organization_id = $2, priority = $3, description = $4,
        reporter_id = $5, assignee_ids = $6, unit_identifier = $7,
        building_id = $8, label_ids = $9, attachments = $10, cost = $11, hours = $12,
		rent_paid = $13, due_date = $14, closed_at = $15
        WHERE id = $16
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery,
		job.Name, job.OrganizationID, job.Priority, job.Description, job.ReporterID,
		job.AssigneeIDs, job.UnitIdentifier, job.BuildingID, job.LabelIDs, job.Attachments,
		job.Cost, job.Hours, job.RentPaid, job.DueDate, job.ClosedAt, job.ID)

	if err != nil {
		return err
	}

	return nil
}

func (s *Store) DeleteJob(jobID string) error {
	ctx := context.Background()

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err := s.dbpool.Exec(ctx, sqlQuery, jobID)
	if err != nil {
		return err
	}

	return nil
}

func (s *Store) GetJobByID(jobID string) (*Job, error) {
	ctx := context.Background()

	sqlQuery := `
        SELECT id, name, organization_id, priority, description, reporter_id,
        assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours,
		rent_paid, due_date, created_at, closed_at
        FROM jobs
        WHERE id = $1
    `

	row := s.dbpool.QueryRow(ctx, sqlQuery, jobID)

	var job Job
	err := row.Scan(
		&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
		&job.ReporterID, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.LabelIDs, &job.Attachments, &job.Cost, &job.Hours,
		&job.RentPaid, &job.DueDate, &job.CreatedAt, &job.ClosedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("job not found")
		}
		return nil, err
	}

	return &job, nil
}

// closeJob sets the ClosedAt time to the current timestamp for a given job ID.
func (s *Store) CloseJob(jobID string) error {
	ctx := context.Background()

	sqlQuery := `
        UPDATE jobs
        SET closed_at = $1
        WHERE id = $2
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery, time.Now(), jobID)
	if err != nil {
		return err
	}

	return nil
}

// reopenJob sets the ClosedAt time to zero value (or null) for a given job ID.
func (s *Store) ReOpenJob(jobID string) error {
	ctx := context.Background()

	// Note: Setting closed_at to null. If your database design doesn't support null values
	// for this field, you'll have to adjust the query accordingly.
	sqlQuery := `
        UPDATE jobs
        SET closed_at = NULL
        WHERE id = $1
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery, jobID)
	if err != nil {
		return err
	}

	return nil
}

func (a *Store) GetJobsByOrganization(identifier string, permitted bool) ([]Job, error) {
	ctx := context.Background()
	fmt.Println(identifier, permitted)
	// Initialize query based on permissions
	query := ""
	if permitted {
		query = fmt.Sprintf(`SELECT id, name, organization_id, rent_paid, priority, description, reporter_id, assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours, due_date, created_at, closed_at FROM jobs WHERE organization_id = '%s'`, identifier)
	} else {
		query = fmt.Sprintf(`SELECT id, name, organization_id, rent_paid, priority, description, reporter_id, assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours, due_date, created_at, closed_at FROM jobs WHERE tenant_identifier = '%s'`, identifier)
	}
	rows, err := a.dbpool.Query(ctx, query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.OrganizationID, &job.RentPaid, &job.Priority, &job.Description,
			&job.ReporterID, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.LabelIDs, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt, &job.ClosedAt,
		)
		if err != nil {
			return nil, err
		}

		// Clear cost and hours if hasPermissions is false
		if !permitted {
			job.Cost = 0
			job.Hours = 0
			job.Priority = ""
		}

		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return jobs, nil
}

// TODO: Move somewhere else
func (s *Store) GetAllMemberIDs(organizationID string, authClient *auth.Client) (map[string]user.User, error) {
	ctx := context.Background()
	query := `
		SELECT DISTINCT unnest(members) AS unique_member_id
		FROM organizations
		WHERE id = $1
	`
	rows, err := s.dbpool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	var memberIDs []string
	for rows.Next() {
		var memberID string
		if err := rows.Scan(&memberID); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		memberIDs = append(memberIDs, memberID)
	}
	fmt.Println(memberIDs)

	users := make(map[string]user.User) // Initialize the map
	for _, userID := range memberIDs {
		u, err := authClient.GetUser(ctx, userID)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		name := u.DisplayName
		if name == "" {
			name = ExtractEmailUsername(u.Email)
		}
		newU := user.User{
			ID:          u.UID,
			DisplayName: name,
			Email:       u.Email,
			PhotoURL:    u.PhotoURL,
		}
		users[u.UID] = newU
	}

	return users, nil
}

// ExtractEmailUsername extracts the username from an email address
func ExtractEmailUsername(email string) string {
	if email == "" {
		return ""
	}
	// Split the email by '@' and take the first part
	splitEmail := strings.Split(email, "@")
	if len(splitEmail) == 0 {
		return ""
	}
	username := splitEmail[0]

	// Trim the spaces
	return strings.TrimSpace(username)
}
