package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/members"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"github.com/teris-io/shortid"
	"google.golang.org/api/iterator"
)

type JobsHandler struct {
	client *bigquery.Client
	events *events.EventsStore
}

func NewJobsHandler(client *bigquery.Client, events *events.EventsStore) *JobsHandler {
	return &JobsHandler{
		client: client,
		events: events,
	}
}

type Job struct {
	ID               string    `bigquery:"id" json:"id"`
	Name             string    `bigquery:"name" json:"name"`
	Priority         string    `bigquery:"priority" json:"priority"`
	Description      string    `bigquery:"description" json:"description"`
	TenantIdentifier string    `bigquery:"tenantIdentifier" json:"tenantIdentifier"`
	AssigneeIDs      []string  `bigquery:"assigneeIds" json:"assigneeIds"`
	UnitIdentifier   string    `bigquery:"unitIdentifier" json:"unitIdentifier"`
	BuildingID       string    `bigquery:"buildingId" json:"buildingId"`
	Labels           []string  `bigquery:"labels" json:"labels"`
	Attachments      []string  `bigquery:"attachments" json:"attachments"`
	Cost             float64   `bigquery:"cost" json:"cost"`
	Hours            int       `bigquery:"hours" json:"hours"`
	DueDate          time.Time `bigquery:"dueDate" json:"dueDate"`
	CreatedAt        time.Time `bigquery:"createdAt" json:"createdAt"`
}

type JobJson struct {
	ID               string           `json:"id"`
	Name             string           `json:"name"`
	DueDate          time.Time        `json:"dueDate"`
	Priority         string           `json:"priority"`
	Description      string           `json:"description"`
	TenantIdentifier string           `json:"tenantIdentifier"`
	AssigneeIDs      []string         `json:"assigneeIds"`
	UnitIdentifier   string           `json:"unitIdentifier"`
	BuildingID       string           `json:"buildingId"`
	Labels           []string         `json:"labels"`
	Attachments      []string         `json:"attachments"`
	Cost             float64          `json:"cost"`
	Hours            int              `json:"hours"`
	CreatedAt        time.Time        `json:"createdAt"`
	Assignees        []members.Member `json:"assignees"`
}

func (h *JobsHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var jobReq Job
	err := json.NewDecoder(r.Body).Decode(&jobReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Generate a unique ID and Name for the job using shortid
	id, err := shortid.Generate()
	if err != nil {
		http.Error(w, "Failed to generate ID", http.StatusInternalServerError)
		return
	}

	// Set the generated ID and Name to the job
	jobReq.ID = id

	dueDate := jobReq.DueDate
	createdAt := jobReq.CreatedAt

	// Create the SQL query for insertion using query parameters
	sqlQuery := `
		INSERT INTO main.jobs (id, name, dueDate, priority, description, tenantIdentifier, assigneeIds, unitIdentifier, buildingId, labels, attachments, cost, hours, createdAt)
		VALUES (@id, @name, @dueDate, @priority, @description, @tenantIdentifier, @assigneeIds, @unitIdentifier, @buildingId, @labels, @attachments, @cost, @hours, @createdAt)
	`

	// Execute the query with query parameters
	q := h.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: jobReq.ID},
		{Name: "name", Value: jobReq.Name},
		{Name: "dueDate", Value: dueDate},
		{Name: "priority", Value: jobReq.Priority},
		{Name: "description", Value: jobReq.Description},
		{Name: "tenantIdentifier", Value: jobReq.TenantIdentifier},
		{Name: "assigneeIds", Value: jobReq.AssigneeIDs},
		{Name: "unitIdentifier", Value: jobReq.UnitIdentifier},
		{Name: "buildingId", Value: jobReq.BuildingID},
		{Name: "labels", Value: jobReq.Labels},
		{Name: "attachments", Value: jobReq.Attachments},
		{Name: "cost", Value: jobReq.Cost},
		{Name: "hours", Value: jobReq.Hours},
		{Name: "createdAt", Value: createdAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to create job", http.StatusInternalServerError)
		return
	}

	// Return the created ID in the response
	json.NewEncoder(w).Encode(map[string]string{"id": jobReq.ID, "name": jobReq.Name})
}

func (h *JobsHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, dueDate, priority, description, tenantIdentifier, assigneeIds, unitIdentifier, buildingId, labels, attachments, cost, hours, createdAt
		FROM main.jobs
		WHERE id = @jobID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "jobID", Value: jobID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	var job JobJson
	err = it.Next(&job)
	if err == iterator.Done {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read job data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(job)
}

func (h *JobsHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var job Job
	err := json.NewDecoder(r.Body).Decode(&job)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Create the SQL query for updating the job
	sqlQuery := `UPDATE main.jobs
	SET name = @name, dueDate = @dueDate, priority = @priority, description = @description, tenantIdentifier = @tenantIdentifier, 
	assigneeIds = @assigneeIds, unitIdentifier = @unitIdentifier, buildingId = @buildingId, labels = @labels, 
	attachments = @attachments, cost = @cost, hours = @hours, createdAt = @createdAt
	WHERE id = @id`

	// Execute the query with query parameters
	q := h.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: job.ID},
		{Name: "name", Value: job.Name},
		{Name: "dueDate", Value: job.DueDate},
		{Name: "priority", Value: job.Priority},
		{Name: "description", Value: job.Description},
		{Name: "tenantIdentifier", Value: job.TenantIdentifier},
		{Name: "assigneeIds", Value: job.AssigneeIDs},
		{Name: "unitIdentifier", Value: job.UnitIdentifier},
		{Name: "buildingId", Value: job.BuildingID},
		{Name: "labels", Value: job.Labels},
		{Name: "attachments", Value: job.Attachments},
		{Name: "cost", Value: job.Cost},
		{Name: "hours", Value: job.Hours},
		{Name: "createdAt", Value: job.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *JobsHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()

	// Delete all events associated with the job ID
	err := h.events.DeleteAllEventsForJobID(jobID)
	if err != nil {
		http.Error(w, "Failed to delete events for job", http.StatusInternalServerError)
		return
	}

	// Create the SQL query for deleting the job
	sqlQuery := `DELETE FROM main.jobs WHERE id = @id`

	// Execute the query with query parameters
	q := h.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{{Name: "id", Value: jobID}}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *JobsHandler) GetAllJobs(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	q := h.client.Query(`
		SELECT id, name, dueDate, priority, description, tenantIdentifier, assigneeIds, unitIdentifier, buildingId, labels, attachments, cost, hours, createdAt
		FROM main.jobs
	`)

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	var jobs []JobJson
	for {
		var job JobJson
		err := it.Next(&job)
		if err == iterator.Done {
			break
		} else if err != nil {
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}
		jobs = append(jobs, job)
	}

	json.NewEncoder(w).Encode(jobs)
}
