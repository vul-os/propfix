// handlers/jobs.go

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"strings"
	// "github.com/teris-io/shortid"
	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type JobsHandler struct {
	client *bigquery.Client
}

func NewJobsHandler(client *bigquery.Client) *JobsHandler {
	return &JobsHandler{
		client: client,
	}
}

type Job struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	DueDate        time.Time `json:"dueDate"`
	Priority       string    `json:"priority"`
	Description    string    `json:"description"`
	ReporterID     string    `json:"reporterId"`
	AssigneeIDs    []string  `json:"assigneeIds"`
	UnitIdentifier string    `json:"unitIdentifier"`
	BuildingID     string    `json:"buildingId"`
	Labels         []string  `json:"labels"`
	AttachmentURLs []string  `json:"attachmentUrls"`
	Cost           float64   `json:"cost"`
	CreatedAt      time.Time `json:"createdAt"`
}

func (h *JobsHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var jobReq Job
	err := json.NewDecoder(r.Body).Decode(&jobReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Parse DueDate from the JSON string (format: "02-02-2023")
	dueDate, err := time.Parse("02-01-2006", jobReq.DueDate.String())
	if err != nil {
		http.Error(w, "Invalid DueDate format. Use dd-mm-yyyy", http.StatusBadRequest)
		return
	}

	// Parse CreatedAt from the JSON string (format: "02-02-2023")
	createdAt, err := time.Parse("02-01-2006", jobReq.CreatedAt.String())
	if err != nil {
		http.Error(w, "Invalid CreatedAt format. Use dd-mm-yyyy", http.StatusBadRequest)
		return
	}

	// Format DueDate in RFC 3339 format for BigQuery
	dueDateStr := dueDate.Format(time.RFC3339)

	// Format CreatedAt in RFC 3339 format for BigQuery
	createdAtStr := createdAt.Format(time.RFC3339)

	// Create the SQL query for insertion
	sqlQuery := fmt.Sprintf(`
		INSERT INTO main.jobs (id, dueDate, priority, description, reporterId, assigneeIds, unitIdentifier, buildingId, labels, attachmentUrls, cost, createdAt)
		VALUES ('%s', '%s', '%s', '%s', '%s', ARRAY%s, '%s', '%s', ARRAY%s, ARRAY%s, %f, '%s')
	`, jobReq.ID, dueDateStr, jobReq.Priority, jobReq.Description, jobReq.ReporterID, convertStringArrayToBQArray(jobReq.AssigneeIDs),
		jobReq.UnitIdentifier, jobReq.BuildingID, convertStringArrayToBQArray(jobReq.Labels), convertStringArrayToBQArray(jobReq.AttachmentURLs), jobReq.Cost, createdAtStr)

	// Execute the query
	q := h.client.Query(sqlQuery)
	_, err = q.Run(ctx)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to create job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// Utility function to convert a slice of strings to a string representation suitable for BigQuery array
func convertStringArrayToBQArray(strArray []string) string {
	var builder strings.Builder
	builder.WriteString("['")
	builder.WriteString(strings.Join(strArray, "','"))
	builder.WriteString("']")
	return builder.String()
}

func (h *JobsHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, dueDate, priority, description, reporterId, assigneeIds, unitIdentifier, buildingId, labels, attachmentUrls, cost, createdAt
		FROM main.jobs
		WHERE id = @jobID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "jobID", Value: jobID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	var job Job
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
	vars := mux.Vars(r)
	jobID := vars["id"]

	var job Job
	err := json.NewDecoder(r.Body).Decode(&job)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Jobs
		SET dueDate = @dueDate, priority = @priority, description = @description, reporterId = @reporterId, assigneeIds = @assigneeIds, 
		unitIdentifier = @unitIdentifier, buildingId = @buildingId, labels = @labels, attachmentUrls = @attachmentUrls, 
		cost = @cost, createdAt = @createdAt
		WHERE id = @jobID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "jobID", Value: jobID},
		{Name: "dueDate", Value: job.DueDate},
		{Name: "priority", Value: job.Priority},
		{Name: "description", Value: job.Description},
		{Name: "reporterId", Value: job.ReporterID},
		{Name: "assigneeIds", Value: job.AssigneeIDs},
		{Name: "unitIdentifier", Value: job.UnitIdentifier},
		{Name: "buildingId", Value: job.BuildingID},
		{Name: "labels", Value: job.Labels},
		{Name: "attachmentUrls", Value: job.AttachmentURLs},
		{Name: "cost", Value: job.Cost},
		{Name: "createdAt", Value: job.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update job", http.StatusInternalServerError)
		return
	}
}

func (h *JobsHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Jobs
		WHERE id = @jobID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "jobID", Value: jobID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
