package jobs

import (
	"context"
	"fmt"
	"strings"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

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

	// Generate a unique ID for the job
	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	// Set the job ID and creation timestamp
	job.ID = id
	job.CreatedAt = time.Now()

	sqlQuery := `
		INSERT INTO jobs (id, name, organization_id, priority, description, reporter_id,
		assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours,
		due_date, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = s.dbpool.Exec(ctx, sqlQuery,
		job.ID, job.Name, job.OrganizationID, job.Priority,
		job.Description, job.ReporterID, job.AssigneeIDs,
		job.UnitIdentifier, job.BuildingID, job.LabelIDs,
		job.Attachments, job.Cost, job.Hours, job.DueDate,
		job.CreatedAt)

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
        due_date = $13
        WHERE id = $14
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery,
		job.Name, job.OrganizationID, job.Priority, job.Description, job.ReporterID,
		job.AssigneeIDs, job.UnitIdentifier, job.BuildingID, job.LabelIDs, job.Attachments,
		job.Cost, job.Hours, job.DueDate, job.ID)

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

func (a *adaptor) GetJobsByOrganization(identifier string, permitted bool) ([]Job, error) {
	ctx := context.Background()
	fmt.Println(identifier, permitted)
	// Initialize query based on permissions
	query := ""
	if permitted {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, reporter_id, assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours, due_date, created_at FROM jobs WHERE organization_id = '%s'`, identifier)
	} else {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, reporter_id, assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours, due_date, created_at FROM jobs WHERE tenant_identifier = '%s'`, identifier)
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
			&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
			&job.ReporterID, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.LabelIDs, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt,
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
func (s *adaptor) GetAllMemberIDs(organizationID string, authClient *auth.Client) (map[string]user.User, error) {
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
