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

type Job struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	OrganizationID       string    `json:"organizationId"`
	UnitIdentifier       string    `json:"unitIdentifier"`
	BuildingID           string    `json:"buildingId"`
	ReporterID           string    `json:"reporterId"`
	AssigneeIDs          []string  `json:"assigneeIds"`
	TennantIds           []string  `json:"tennantIds"`
	PendingTennantEmails []string  `json:"pendingTennantEmails"`
	Priority             string    `json:"priority"`
	Description          string    `json:"description"`
	LabelIDs             []string  `json:"labelIds"`
	Attachments          []string  `json:"attachments"`
	Cost                 float64   `json:"cost"`
	Hours                int       `json:"hours"`
	RentPaid             bool      `json:"rentPaid"`
	DueDate              time.Time `json:"dueDate"`
	CreatedAt            time.Time `json:"createdAt"`
	ClosedAt             time.Time `json:"closedAt"`
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
		rent_paid, due_date, created_at, closed_at, tennant_ids, pending_tennant_emails)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
	`

	_, err = s.dbpool.Exec(ctx, sqlQuery,
		job.ID, job.Name, job.OrganizationID, job.Priority,
		job.Description, job.ReporterID, job.AssigneeIDs,
		job.UnitIdentifier, job.BuildingID, job.LabelIDs,
		job.Attachments, job.Cost, job.Hours, job.RentPaid,
		job.DueDate, job.CreatedAt, job.ClosedAt, job.TennantIds, job.PendingTennantEmails)

	return err
}

func (s *Store) UpdateJob(job *Job) error {
	ctx := context.Background()

	sqlQuery := `
        UPDATE jobs
        SET name = $1, organization_id = $2, priority = $3, description = $4,
        assignee_ids = $5, unit_identifier = $6, building_id = $7, 
        label_ids = $8, attachments = $9, cost = $10, hours = $11,
		rent_paid = $12, due_date = $13, closed_at = $14, 
		tennant_ids = $15, pending_tennant_emails = $16
        WHERE id = $17
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery,
		job.Name, job.OrganizationID, job.Priority, job.Description,
		job.AssigneeIDs, job.UnitIdentifier, job.BuildingID, job.LabelIDs,
		job.Attachments, job.Cost, job.Hours, job.RentPaid, job.DueDate,
		job.ClosedAt, job.TennantIds, job.PendingTennantEmails, job.ID)

	return err
}

func (s *Store) GetJobByID(jobID string) (*Job, error) {
	ctx := context.Background()

	sqlQuery := `
        SELECT id, name, organization_id, priority, description, reporter_id,
        assignee_ids, unit_identifier, building_id, label_ids, attachments, 
        cost, hours, rent_paid, due_date, created_at, closed_at, 
        tennant_ids, pending_tennant_emails
        FROM jobs
        WHERE id = $1
    `

	row := s.dbpool.QueryRow(ctx, sqlQuery, jobID)

	var job Job
	err := row.Scan(
		&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
		&job.ReporterID, &job.AssigneeIDs, &job.UnitIdentifier, &job.BuildingID,
		&job.LabelIDs, &job.Attachments, &job.Cost, &job.Hours, &job.RentPaid,
		&job.DueDate, &job.CreatedAt, &job.ClosedAt, &job.TennantIds, &job.PendingTennantEmails,
	)
	if err != nil {
		return nil, err
	}

	return &job, nil
}

func (s *Store) DeleteJob(jobID string) error {
	ctx := context.Background()

	sqlQuery := `
        DELETE FROM jobs
        WHERE id = $1
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery, jobID)
	return err
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

	var zeroTime time.Time
	// Note: Setting closed_at to null. If your database design doesn't support null values
	// for this field, you'll have to adjust the query accordingly.
	sqlQuery := `
        UPDATE jobs
        SET closed_at = $2
        WHERE id = $1
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery, jobID, zeroTime)
	if err != nil {
		return err
	}

	return nil
}

func (a *Store) GetJobsByOrganization(identifier string, permitted bool) ([]Job, error) {
	ctx := context.Background()
	fmt.Println(identifier, permitted)

	// Base fields
	fields := "id, name, organization_id, rent_paid, priority, description, reporter_id, assignee_ids, unit_identifier, building_id, label_ids, attachments, cost, hours, due_date, created_at, closed_at, tennant_ids, pending_tennant_emails"

	// Initialize query based on permissions
	var query string
	if permitted {
		query = `SELECT ` + fields + ` FROM jobs WHERE organization_id = $1`
	} else {
		query = `SELECT ` + fields + ` FROM jobs WHERE reporter_id = $1`
	}

	rows, err := a.dbpool.Query(ctx, query, identifier)
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
			&job.DueDate, &job.CreatedAt, &job.ClosedAt, &job.TennantIds, &job.PendingTennantEmails,
		)
		if err != nil {
			return nil, err
		}

		// Clear cost, hours, and priority if permitted is false
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

func (s *Store) GetAllMemberIDs(organizationID string, authClient *auth.Client) (map[string]user.User, error) {
	ctx := context.Background()

	// Query from organizations table
	orgQuery := `
		SELECT DISTINCT unnest(members) AS unique_member_id
		FROM organizations
		WHERE id = $1
	`
	orgRows, err := s.dbpool.Query(ctx, orgQuery, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute orgQuery: %v", err)
	}
	defer orgRows.Close()

	var memberIDs []string
	for orgRows.Next() {
		var memberID string
		if err := orgRows.Scan(&memberID); err != nil {
			return nil, fmt.Errorf("failed to scan org row: %v", err)
		}
		memberIDs = append(memberIDs, memberID)
	}

	// Query from jobs table
	jobQuery := `
		WITH expanded AS (
			SELECT unnest(assignee_ids || ARRAY[reporter_id] || tennant_ids) AS job_member_id
			FROM jobs
			WHERE organization_id = $1
		)
		SELECT DISTINCT job_member_id
		FROM expanded
		WHERE job_member_id IS NOT NULL AND job_member_id <> ''
	`
	jobRows, err := s.dbpool.Query(ctx, jobQuery, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute jobQuery: %v", err)
	}
	defer jobRows.Close()

	for jobRows.Next() {
		var jobMemberID string
		if err := jobRows.Scan(&jobMemberID); err != nil {
			return nil, fmt.Errorf("failed to scan job row: %v", err)
		}
		memberIDs = append(memberIDs, jobMemberID)
	}

	// Get unique member IDs
	uniqueMemberIDs := make(map[string]struct{})
	for _, id := range memberIDs {
		uniqueMemberIDs[id] = struct{}{}
	}

	users := make(map[string]user.User) // Initialize the map
	for userID := range uniqueMemberIDs {
		u, err := authClient.GetUser(ctx, userID)
		if err != nil {
			fmt.Println(err)
			continue
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

func (s *Store) AddTenant(jobID, tenantID string) error {
	ctx := context.Background()

	sqlQuery := `
		UPDATE jobs
		SET tennant_ids = array_append(tennant_ids, $1)
		WHERE id = $2
	`

	_, err := s.dbpool.Exec(ctx, sqlQuery, tenantID, jobID)
	return err
}

func (s *Store) RemoveTenant(jobID, tenantID string) error {
	ctx := context.Background()

	sqlQuery := `
		UPDATE jobs
		SET tennant_ids = array_remove(tennant_ids, $1)
		WHERE id = $2
	`

	_, err := s.dbpool.Exec(ctx, sqlQuery, tenantID, jobID)
	return err
}

func (s *Store) AddPendingTenantEmail(jobID, email string) error {
	ctx := context.Background()

	sqlQuery := `
		UPDATE jobs
		SET pending_tennant_emails = array_append(pending_tennant_emails, $1)
		WHERE id = $2
	`

	_, err := s.dbpool.Exec(ctx, sqlQuery, email, jobID)
	return err
}

func (s *Store) RemovePendingTenantEmail(jobID, email string) error {
	ctx := context.Background()

	sqlQuery := `
		UPDATE jobs
		SET pending_tennant_emails = array_remove(pending_tennant_emails, $1)
		WHERE id = $2
	`

	_, err := s.dbpool.Exec(ctx, sqlQuery, email, jobID)
	return err
}

func (s *Store) CheckAndAccept(email, userID string) error {
	ctx := context.Background()

	// Step 1: Search for jobs that have the provided email in `pending_tennant_emails`
	sqlQuery := `
		SELECT id
		FROM jobs
		WHERE $1 = ANY(pending_tennant_emails)
	`
	rows, err := s.dbpool.Query(ctx, sqlQuery, email)
	if err != nil {
		return err
	}
	defer rows.Close()

	var jobIDs []string
	for rows.Next() {
		var jobID string
		if err := rows.Scan(&jobID); err != nil {
			return err
		}
		jobIDs = append(jobIDs, jobID)
	}

	// Step 2: For each job found, update `tennant_ids` and `pending_tennant_emails`
	for _, jobID := range jobIDs {
		// a. Add the user ID to `tennant_ids`
		addTenantErr := s.AddTenant(jobID, userID)
		if addTenantErr != nil {
			return addTenantErr
		}

		// b. Remove the email from `pending_tennant_emails`
		removeEmailErr := s.RemovePendingTenantEmail(jobID, email)
		if removeEmailErr != nil {
			return removeEmailErr
		}
	}

	return nil
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
