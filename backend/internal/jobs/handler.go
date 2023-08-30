package jobs

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

type Job struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	OrganizationID   string    `json:"organizationId"`
	Priority         string    `json:"priority"`
	Description      string    `json:"description"`
	TenantIdentifier string    `json:"tenantIdentifier"`
	AssigneeIDs      []string  `json:"assigneeIds"`
	UnitIdentifier   string    `json:"unitIdentifier"`
	BuildingID       string    `json:"buildingId"`
	Labels           []string  `json:"labels"`
	Attachments      []string  `json:"attachments"`
	Cost             float64   `json:"cost"`
	Hours            int       `json:"hours"`
	DueDate          time.Time `json:"dueDate"`
	CreatedAt        time.Time `json:"createdAt"`
}

type adaptor struct {
	dbpool       *pgxpool.Pool
	authz        *authz.Authz
	columnsStore *columns.ColumnsStore
}

const Name = "Jobs"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
	cs *columns.ColumnsStore,
) *adaptor {
	return &adaptor{
		dbpool:       dbpool,
		authz:        authz,
		columnsStore: cs,
	}
}

// JSON-RPC request for getting a job
type GetJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for getting a job
type GetJobResponse struct {
	Job Job `json:"job"`
}

func (a *adaptor) GetJob(r *http.Request, args *GetJobRequest, result *GetJobResponse) error {
	ctx := context.Background()

	// Check permission logic here

	sqlQuery := `
		SELECT id, name, organization_id, priority, description, tenant_identifier,
		assignee_ids, unit_identifier, building_id, labels, attachments,
		cost, hours, due_date, created_at
		FROM jobs
		WHERE id = $1
	`

	row := a.dbpool.QueryRow(ctx, sqlQuery, args.ID)

	var job Job
	err := row.Scan(
		&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
		&job.DueDate, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return errors.New("Job not found")
	} else if err != nil {
		return err
	}

	result.Job = job
	return nil
}

// JSON-RPC request for creating a job
type CreateJobRequest struct {
	Job Job `json:"job"`
}

// JSON-RPC response for creating a job
type CreateJobResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateJob(r *http.Request, args *CreateJobRequest, result *CreateJobResponse) error {
	ctx := r.Context()

	// Check permission logic here

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}

	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	args.Job.ID = id
	args.Job.CreatedAt = time.Now()
	args.Job.TenantIdentifier = user.ID

	sqlQuery := `
		INSERT INTO jobs (id, name, organization_id, priority, description, tenant_identifier,
		assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours,
		due_date, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = a.dbpool.Exec(ctx, sqlQuery,
		args.Job.ID, args.Job.Name, args.Job.OrganizationID, args.Job.Priority,
		args.Job.Description, args.Job.TenantIdentifier, args.Job.AssigneeIDs,
		args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.Labels,
		args.Job.Attachments, args.Job.Cost, args.Job.Hours, args.Job.DueDate,
		args.Job.CreatedAt)

	if err != nil {
		return err
	}

	result.ID = args.Job.ID
	return nil
}

// JSON-RPC request for updating a job
type UpdateJobRequest struct {
	Job Job `json:"job"`
}

// JSON-RPC response for updating a job
type UpdateJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateJob(r *http.Request, args *UpdateJobRequest, result *UpdateJobResponse) error {
	ctx := context.Background()

	// Check permission logic here

	sqlQuery := `
		UPDATE jobs
		SET name = $1, organization_id = $2, priority = $3, description = $4,
		tenant_identifier = $5, assignee_ids = $6, unit_identifier = $7,
		building_id = $8, labels = $9, attachments = $10, cost = $11, hours = $12,
		due_date = $13
		WHERE id = $14
	`

	_, err := a.dbpool.Exec(ctx, sqlQuery,
		args.Job.Name, args.Job.OrganizationID, args.Job.Priority,
		args.Job.Description, args.Job.TenantIdentifier, args.Job.AssigneeIDs,
		args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.Labels,
		args.Job.Attachments, args.Job.Cost, args.Job.Hours, args.Job.DueDate,
		args.Job.ID)

	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// JSON-RPC request for deleting a job
type DeleteJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for deleting a job
type DeleteJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteJob(r *http.Request, args *DeleteJobRequest, result *DeleteJobResponse) error {
	ctx := context.Background()

	// Check permission logic here

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err := a.dbpool.Exec(ctx, sqlQuery, args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// JSON-RPC request for getting all jobs
type GetAllJobsRequest struct {
	OrganizationID string `json:"organizationId"`
}

// JSON-RPC response for getting all jobs
type GetAllJobsResponse struct {
	Jobs []Job `json:"jobs"`
}

func (a *adaptor) GetAllJobs(r *http.Request, args *GetAllJobsRequest, result *GetAllJobsResponse) error {
	ctx := context.Background()

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}
	permissionStatus := "private"
	// permissionStatus, err := a.authz.CheckJobPermission(user.ID, "jobs", "getall")
	// if err != nil {
	// 	return err
	// }

	var rows pgx.Rows
	var sqlQuery string
	var queryParams []interface{}

	if args.OrganizationID != "" { // If organization ID is provided in the request
		sqlQuery = `
			SELECT id, name, organization_id, priority, description, tenant_identifier,
			assignee_ids, unit_identifier, building_id, labels, attachments,
			cost, hours, due_date, created_at
			FROM jobs
			WHERE organization_id = $1
		`
		queryParams = append(queryParams, args.OrganizationID)
	} else {
		sqlQuery = `
			SELECT id, name, organization_id, priority, description, tenant_identifier,
			assignee_ids, unit_identifier, building_id, labels, attachments,
			cost, hours, due_date, created_at
			FROM jobs
		`
	}

	if permissionStatus == "public" {
		sqlQuery += " AND tenant_identifier = $2"
		queryParams = append(queryParams, user.ID)
	}

	rows, err := a.dbpool.Query(ctx, sqlQuery, queryParams...)
	if err != nil {
		return err
	}

	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt,
		)
		if err != nil {
			return err
		}
		if permissionStatus == "public" {
			job.Cost = 0
			job.Hours = 0
			job.Priority = ""
		}
		jobs = append(jobs, job)
	}

	result.Jobs = jobs
	return nil
}

// Define the KanbanBoard struct for the response
type KanbanBoard struct {
	Columns map[string]columns.Column `json:"columns"`
	Jobs    map[string]Job            `json:"jobs"`
	Ordered []string                  `json:"ordered"`
}

// Define the GetKanbanBoardRequest struct
type GetKanbanBoardRequest struct {
	OrganizationID string `json:"organizationId"`
}

// Define the GetKanbanBoardResponse struct
type GetKanbanBoardResponse struct {
	Board KanbanBoard `json:"board"`
}

func (a *adaptor) GetKanbanBoard(r *http.Request, args *GetKanbanBoardRequest, result *GetKanbanBoardResponse) error {
	// Fetch columns using the ColumnsStore
	cols, err := a.columnsStore.GetAllColumns(args.OrganizationID)
	if err != nil {
		fmt.Println(err)
		return err
	}
	fmt.Println(cols)

	// Fetch jobs using the organization ID (simplified example)
	jobs, err := a.GetJobsByOrganization(args.OrganizationID)
	if err != nil {
		fmt.Println(err)
		return err
	}
	// Create a map to store jobs by their IDs
	jobsMap := make(map[string]Job)
	for _, job := range jobs {
		jobsMap[job.ID] = job
	}

	// Create a map to store columns by their IDs
	columnsMap := make(map[string]columns.Column)
	for _, col := range cols {
		columnsMap[col.ID] = columns.Column{
			ID:     col.ID,
			Name:   col.Name,
			JobIDs: col.JobIDs,
		}
	}

	// Create an ordered list of column IDs
	var orderedColumns []string
	for _, col := range cols {
		orderedColumns = append(orderedColumns, col.ID)
	}

	// Build the response structure
	response := GetKanbanBoardResponse{
		Board: KanbanBoard{
			Columns: columnsMap,
			Jobs:    jobsMap,
			Ordered: orderedColumns,
		},
	}

	// Set the response
	*result = response
	return nil
}

// todo: move into store.go
func (a *adaptor) GetJobsByOrganization(orgID string) ([]Job, error) {
	ctx := context.Background()

	// Query to fetch jobs based on organization ID
	query := fmt.Sprintf("SELECT * FROM jobs WHERE organization_id = '%s'", orgID)

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
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return jobs, nil
}
