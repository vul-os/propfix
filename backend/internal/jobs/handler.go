package jobs

import (
	"context"
	"errors"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/exolutionza/propfix-backend-go/internal/utils"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

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

type JobsHandler struct {
	pool   *pgxpool.Pool
	events *events.EventsStore
	authz  *authz.Authz
}

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Jobs"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		dbpool: dbpool,
		authz:  authz,
	}
}

// ... (other struct definitions and initialization code)

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
	permissionStatus, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "read")
	if err != nil {
		return err
	}

	sqlQuery := `
		SELECT id, name, due_date, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, created_at
		FROM jobs
		WHERE id = $1
	`

	row := a.dbpool.QueryRow(ctx, sqlQuery, args.ID)

	var job Job
	err = row.Scan(
		&job.ID, &job.Name, &job.DueDate, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.Labels, &job.Attachments, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return err
	} else if err != nil {
		return err
	}

	// Conditionally remove fields not allowed
	if permissionStatus == "public" {
		job.AssigneeIDs = nil
		job.UnitIdentifier = ""
		job.BuildingID = ""
	}

	result.Job = job
	return nil
}

// ... (previous code)

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
	permissionStatus, err := a.authz.CheckJobPermission(r, args.Job.ID, "jobs", "create")
	if err != nil {
		return err
	}

	if permissionStatus != "public" {
		return errors.New("not permitted")
	}

	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	args.Job.ID = id
	args.Job.CreatedAt = time.Now()

	sqlQuery := `
		INSERT INTO jobs (id, name, due_date, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err = a.dbpool.Exec(ctx, sqlQuery,
		args.Job.ID, args.Job.Name, args.Job.DueDate, args.Job.Description, args.Job.TenantIdentifier,
		args.Job.AssigneeIDs, args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.Labels,
		args.Job.Attachments, args.Job.CreatedAt)

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

func (a *adaptor) UpdateJob(r *http.Request, args *UpdateJobRequest, result *utils.EmptyResponse) error {
	ctx := context.Background()
	permissionStatus, err := a.authz.CheckJobPermission(r, args.Job.ID, "jobs", "update")
	if err != nil {
		return err
	}

	if permissionStatus != "public" {
		return errors.New("not permitted")
	}

	sqlQuery := `
		UPDATE jobs
		SET name = $1, due_date = $2, description = $3, tenant_identifier = $4,
		assignee_ids = $5, unit_identifier = $6, building_id = $7, labels = $8, attachments = $9
		WHERE id = $10
	`

	_, err = a.dbpool.Exec(ctx, sqlQuery,
		args.Job.Name, args.Job.DueDate, args.Job.Description,
		args.Job.TenantIdentifier, args.Job.AssigneeIDs, args.Job.UnitIdentifier,
		args.Job.BuildingID, args.Job.Labels, args.Job.Attachments, args.Job.ID)

	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for deleting a job
type DeleteJobRequest struct {
	ID string `json:"id"`
}

func (a *adaptor) DeleteJob(r *http.Request, args *DeleteJobRequest, result *utils.EmptyResponse) error {
	ctx := context.Background()
	permissionStatus, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "delete")
	if err != nil {
		return err
	}

	if permissionStatus != "public" {
		return errors.New("not permitted")
	}

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err = a.dbpool.Exec(ctx, sqlQuery, args.ID)
	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for getting all jobs
type GetAllJobsRequest struct {
}

// JSON-RPC response for getting all jobs
type GetAllJobsResponse struct {
	Jobs []Job `json:"jobs"`
}

func (a *adaptor) GetAllJobs(r *http.Request, args *GetAllJobsRequest, result *GetAllJobsResponse) error {
	ctx := context.Background()
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return nil
	}

	permissionStatus, err := a.authz.CheckPermission(user.ID, "jobs", "getall")
	if err != nil {
		return err
	}

	var rows pgx.Rows
	if !permissionStatus { // public
		sqlQuery := `
			SELECT id, name, due_date, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, created_at
			FROM jobs
			WHERE tenant_identifier = $1
		`
		rows, err = a.dbpool.Query(ctx, sqlQuery, user.ID)
		if err != nil {
			return err
		}

	} else { // private
		sqlQuery := `
			SELECT id, name, due_date, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, created_at
			FROM jobs
		`

		rows, err = a.dbpool.Query(ctx, sqlQuery)
		if err != nil {
			return err
		}
	}

	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.DueDate, &job.Description,
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.Labels, &job.Attachments, &job.CreatedAt,
		)
		if err != nil {
			return err
		}
		if !permissionStatus {
			job.Cost = 0
			job.Hours = 0
			job.Priority = ""
		}
		jobs = append(jobs, job)
	}

	result.Jobs = jobs
	return nil
}
