package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"strings"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"github.com/teris-io/shortid"
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

	// Generate a unique ID and Name for the job using shortid
	id, err := shortid.Generate()
	if err != nil {
		http.Error(w, "Failed to generate ID", http.StatusInternalServerError)
		return
	}

	// Set the generated ID and Name to the job
	jobReq.ID = id
	jobReq.Name = "Job-" + id // You can modify the prefix as needed

	dueDate := jobReq.DueDate
	createdAt := jobReq.CreatedAt

	// Create the SQL query for insertion using query parameters
	sqlQuery := `
		INSERT INTO main.jobs (id, name, dueDate, priority, description, reporterId, assigneeIds, unitIdentifier, buildingId, labels, attachmentUrls, cost, createdAt)
		VALUES (@id, @name, @dueDate, @priority, @description, @reporterId, @assigneeIds, @unitIdentifier, @buildingId, @labels, @attachmentUrls, @cost, @createdAt)
	`

	// Execute the query with query parameters
	q := h.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: jobReq.ID},
		{Name: "name", Value: jobReq.Name},
		{Name: "dueDate", Value: dueDate},
		{Name: "priority", Value: jobReq.Priority},
		{Name: "description", Value: jobReq.Description},
		{Name: "reporterId", Value: jobReq.ReporterID},
		{Name: "assigneeIds", Value: jobReq.AssigneeIDs},
		{Name: "unitIdentifier", Value: jobReq.UnitIdentifier},
		{Name: "buildingId", Value: jobReq.BuildingID},
		{Name: "labels", Value: jobReq.Labels},
		{Name: "attachmentUrls", Value: jobReq.AttachmentURLs},
		{Name: "cost", Value: jobReq.Cost},
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

// Utility function to convert a slice of strings to a string representation suitable for BigQuery array
func convertStringArrayToBQArray(strArray []string) string {
	return "['" + strings.Join(strArray, "','") + "']"
}

func (h *JobsHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, dueDate, priority, description, reporterId, assigneeIds, unitIdentifier, buildingId, labels, attachmentUrls, cost, createdAt
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
	var job Job
	err := json.NewDecoder(r.Body).Decode(&job)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Create the SQL query for updating the job
	sqlQuery := `UPDATE main.jobs
	SET dueDate = @dueDate, priority = @priority, description = @description, reporterId = @reporterId, assigneeIds = @assigneeIds, 
	unitIdentifier = @unitIdentifier, buildingId = @buildingId, labels = @labels, attachmentUrls = @attachmentUrls, 
	cost = @cost, createdAt = @createdAt, name = @name
	WHERE id = @id`

	// Execute the query with query parameters
	q := h.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: job.ID},
		{Name: "name", Value: job.Name},
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

func (h *JobsHandler) GetAllJobs(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	// Fetch the jobs
	query := h.client.Query("SELECT * FROM propfix.main.jobs")
	jobsIterator, err := query.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	// Process the jobs and store them in a map by job ID
	jobMap := make(map[string]JobJson)
	reporterIDs := make(map[string]bool)
	assigneeIDs := make(map[string]bool)
	for {
		var job JobJson

		err := jobsIterator.Next(&job)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}

		reporterIDs[job.ReporterID] = true
		for _, assigneeID := range job.AssigneeIDs {
			assigneeIDs[assigneeID] = true
		}

		jobMap[job.ID] = job
	}

	// Fetch the reporters
	reporters := fetchMembers(ctx, h.client, reporterIDs)
	if reporters == nil {
		http.Error(w, "Failed to fetch reporters", http.StatusInternalServerError)
		return
	}

	// Fetch the assignees
	assignees := fetchMembers(ctx, h.client, assigneeIDs)
	if assignees == nil {
		http.Error(w, "Failed to fetch assignees", http.StatusInternalServerError)
		return
	}

	// Update the jobs with the reporter and assignee data
	for jobID, job := range jobMap {
		job.Reporter = reporters[job.ReporterID]
		for _, assigneeID := range job.AssigneeIDs {
			job.Assignees = append(job.Assignees, assignees[assigneeID])
		}
		jobMap[jobID] = job
	}

	// Convert the job map to a slice
	var jobsData []JobJson
	for _, job := range jobMap {
		jobsData = append(jobsData, job)
	}

	json.NewEncoder(w).Encode(jobsData)
}
