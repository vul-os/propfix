package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/gorilla/mux"
	"github.com/teris-io/shortid"
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

func (h *JobsHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "jobs", "create")
	if err != nil || !ok {
		return
	}

	var jobReq Job
	err = json.NewDecoder(r.Body).Decode(&jobReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	id, err := shortid.Generate()
	if err != nil {
		http.Error(w, "Failed to generate ID", http.StatusInternalServerError)
		return
	}

	jobReq.ID = id

	dueDate := jobReq.DueDate
	createdAt := jobReq.CreatedAt

	sqlQuery := `
		INSERT INTO jobs (id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = h.pool.Exec(ctx, sqlQuery,
		jobReq.ID, jobReq.Name, dueDate, jobReq.Priority, jobReq.Description, jobReq.TenantIdentifier,
		jobReq.AssigneeIDs, jobReq.UnitIdentifier, jobReq.BuildingID, jobReq.BoardID, jobReq.Labels,
		jobReq.Attachments, jobReq.Cost, jobReq.Hours, createdAt)

	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to create job", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"id": jobReq.ID, "name": jobReq.Name})
}

func (h *JobsHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()

	sqlQuery := `
		SELECT id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at
		FROM jobs
		WHERE id = $1
	`

	row := h.pool.QueryRow(ctx, sqlQuery, jobID)

	var job Job
	err := row.Scan(
		&job.ID, &job.Name, &job.DueDate, &job.Priority, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.BoardID, &job.Labels, &job.Attachments,
		&job.Cost, &job.Hours, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	} else if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to fetch job", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(job)
}

func (h *JobsHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "jobs", "update")
	if err != nil || !ok {
		return
	}
	var jobReq Job
	err = json.NewDecoder(r.Body).Decode(&jobReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// if hasPermission, err := h.authz.CheckPermission(user.ID, "jobs", "update"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to update jobs", http.StatusForbidden)
	// 	return
	// }

	ctx := context.Background()

	sqlQuery := `
        UPDATE jobs
        SET name = $1, due_date = $2, priority = $3, description = $4, tenant_identifier = $5,
        assignee_ids = $6, unit_identifier = $7, building_id = $8, board_id = $9,
        labels = $10, attachments = $11, cost = $12, hours = $13, created_at = $14
        WHERE id = $15
    `

	_, err = h.pool.Exec(ctx, sqlQuery,
		jobReq.Name, jobReq.DueDate, jobReq.Priority, jobReq.Description,
		jobReq.TenantIdentifier, jobReq.AssigneeIDs, jobReq.UnitIdentifier,
		jobReq.BuildingID, jobReq.BoardID, jobReq.Labels, jobReq.Attachments,
		jobReq.Cost, jobReq.Hours, jobReq.CreatedAt, jobReq.ID,
	)

	if err != nil {
		http.Error(w, "Failed to update job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *JobsHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "jobs", "delete")
	if err != nil || !ok {
		return
	}
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()

	// // Delete all events associated with the job ID
	// err := h.events.DeleteAllEventsForJobID(jobID)
	// if err != nil {
	// 	http.Error(w, "Failed to delete events for job", http.StatusInternalServerError)
	// 	return
	// }

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err = h.pool.Exec(ctx, sqlQuery, jobID)
	if err != nil {
		http.Error(w, "Failed to delete job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *JobsHandler) GetAllJobs(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	sqlQuery := `
        SELECT id, name, due_date, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, board_id, labels, attachments, cost, hours, created_at
        FROM jobs
    `

	rows, err := h.pool.Query(ctx, sqlQuery)
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
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
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}
		jobs = append(jobs, job)
	}

	json.NewEncoder(w).Encode(jobs)
}
