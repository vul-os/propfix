package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/gorilla/mux"
	"github.com/teris-io/shortid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type JobsHandler struct {
	pool   *pgxpool.Pool
	events *events.EventsStore
	authz  *authz.Authz
}

func NewJobsHandler(pool *pgxpool.Pool, events *events.EventsStore, authz *authz.Authz) *JobsHandler {
	return &JobsHandler{
		pool:   pool,
		events: events,
		authz:  authz,
	}
}

type Job struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Priority         string    `json:"priority"`
	Description      string    `json:"description"`
	TenantIdentifier string    `json:"tenantIdentifier"`
	AssigneeIDs      []string  `json:"assigneeIds"`
	UnitIdentifier   string    `json:"unitIdentifier"`
	BuildingID       string    `json:"buildingId"`
	BoardID          string    `json:"boardId"`
	Labels           []string  `json:"labels"`
	Attachments      []string  `json:"attachments"`
	Cost             float64   `json:"cost"`
	Hours            int       `json:"hours"`
	DueDate          time.Time `json:"dueDate"`
	CreatedAt        time.Time `json:"createdAt"`
}

// JSON-RPC request for creating a job
type CreateJobRequest struct {
	Job Job `json:"job"`
	OrganizationID string `json:"organizationId"`
}

// JSON-RPC response for creating a job
type CreateJobResponse struct {
	ID string `json:"id"`
	Name string `json:"name"`
}

func (h *JobsHandler) CreateJob(r *http.Request, args *CreateJobRequest, result *CreateJobResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponseWithOrgID(r, h.authz, args.OrganizationID, "jobs", "create")
	if err != nil || !ok {
		return err
	}

	ctx := r.Context()

	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	args.Job.ID = id

	dueDate := args.Job.DueDate
	createdAt := args.Job.CreatedAt

	sqlQuery := `
		INSERT INTO jobs (id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = h.pool.Exec(ctx, sqlQuery,
		args.Job.ID, args.Job.Name, dueDate, args.Job.Priority, args.Job.Description, args.Job.TenantIdentifier,
		args.Job.AssigneeIDs, args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.BoardID, args.Job.Labels,
		args.Job.Attachments, args.Job.Cost, args.Job.Hours, createdAt)

	if err != nil {
		return err
	}

	result.ID = args.Job.ID
	result.Name = args.Job.Name
	return nil
}

// JSON-RPC request for getting a job
type GetJobRequest struct {
	ID            string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

// JSON-RPC response for getting a job
type GetJobResponse struct {
	Job Job `json:"job"`
}

func (h *JobsHandler) GetJob(r *http.Request, args *GetJobRequest, result *GetJobResponse) error {
	ctx := context.Background()

	ok, err := utils.CheckPermissionAndExecuteResponseWithOrgID(r, h.authz, args.OrganizationID, "jobs", "get")
	if err != nil || !ok {
		return err
	}

	sqlQuery := `
		SELECT id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at
		FROM jobs
		WHERE id = $1
	`

	row := h.pool.QueryRow(ctx, sqlQuery, args.ID)

	var job Job
	err = row.Scan(
		&job.ID, &job.Name, &job.DueDate, &job.Priority, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.BoardID, &job.Labels, &job.Attachments,
		&job.Cost, &job.Hours, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return err
	} else if err != nil {
		return err
	}

	result.Job = job
	return nil
}

// JSON-RPC request for updating a job
type UpdateJobRequest struct {
	Job Job `json:"job"`
	OrganizationID string `json:"organizationId"`
}

func (h *JobsHandler) UpdateJob(r *http.Request, args *UpdateJobRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponseWithOrgID(r, h.authz, args.OrganizationID, "jobs", "update")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()

	sqlQuery := `
		UPDATE jobs
		SET name = $1, due_date = $2, priority = $3, description = $4, tenant_identifier = $5,
		assignee_ids = $6, unit_identifier = $7, building_id = $8, board_id = $9,
		labels = $10, attachments = $11, cost = $12, hours = $13, created_at = $14
		WHERE id = $15
	`

	_, err = h.pool.Exec(ctx, sqlQuery,
		args.Job.Name, args.Job.DueDate, args.Job.Priority, args.Job.Description,
		args.Job.TenantIdentifier, args.Job.AssigneeIDs, args.Job.UnitIdentifier,
		args.Job.BuildingID, args.Job.BoardID, args.Job.Labels, args.Job.Attachments,
		args.Job.Cost, args.Job.Hours, args.Job.CreatedAt, args.Job.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for deleting a job
type DeleteJobRequest struct {
	ID            string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

func (h *JobsHandler) DeleteJob(r *http.Request, args *DeleteJobRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponseWithOrgID(r, h.authz, args.OrganizationID, "jobs", "delete")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err = h.pool.Exec(ctx, sqlQuery, args.ID)
	if err != nil {
		return err
	}

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

func (h *JobsHandler) GetAllJobs(r *http.Request, args *GetAllJobsRequest, result *GetAllJobsResponse) error {
	ctx := context.Background()

	ok, err := utils.CheckPermissionAndExecuteResponseWithOrgID(r, h.authz, args.OrganizationID, "jobs", "getall")
	if err != nil || !ok {
		return err
	}

	sqlQuery := `
		SELECT id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at
		FROM jobs
	`

	rows, err := h.pool.Query(ctx, sqlQuery)
	if err != nil {
		return err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.DueDate, &job.Priority, &job.Description,
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.BoardID, &job.Labels, &job.Attachments,
			&job.Cost, &job.Hours, &job.CreatedAt,
		)
		if err != nil {
			return err
		}
		jobs = append(jobs, job)
	}

	result.Jobs = jobs
	return nil
}
