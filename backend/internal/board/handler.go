package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"sort"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"

	"google.golang.org/api/iterator"
)

type BoardHandler struct {
	client *bigquery.Client
}

func NewBoardHandler(client *bigquery.Client) *BoardHandler {
	return &BoardHandler{
		client: client,
	}
}

func (h *BoardHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Query the columns table
	columnsQuery := h.client.Query("SELECT id, name, jobids FROM propfix.main.columns")
	columnsIterator, err := columnsQuery.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch columns", http.StatusInternalServerError)
		return
	}

	columnsData := make(map[string]columns.Column)
	var orderedColumns []string
	for {
		var col columns.Column
		err := columnsIterator.Next(&col)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read columns data", http.StatusInternalServerError)
			return
		}

		// Construct the Column object
		columnData := columns.Column{
			ID:     col.ID,
			Name:   col.Name,
			JobIDs: col.JobIDs,
		}
		columnsData[col.ID] = columnData
		orderedColumns = append(orderedColumns, col.ID)
	}

	// Sort the ordered columns to ensure consistent order
	sort.Strings(orderedColumns)

	// Fetch the jobs
	query := h.client.Query("SELECT * FROM propfix.main.jobs")
	jobsIterator, err := query.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	// Process the jobs and store them in a map by job ID
	jobMap := make(map[string]jobs.JobJson)
	assigneeIDs := make(map[string]bool)
	for {
		var job jobs.JobJson

		err := jobsIterator.Next(&job)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}

		for _, assigneeID := range job.AssigneeIDs {
			assigneeIDs[assigneeID] = true
		}

		jobMap[job.ID] = job
	}

	// Fetch the assignees
	assignees := members.FetchMembers(ctx, h.client, assigneeIDs)
	if assignees == nil {
		http.Error(w, "Failed to fetch assignees", http.StatusInternalServerError)
		return
	}

	// Update the jobs with the reporter and assignee data
	for jobID, job := range jobMap {
		for _, assigneeID := range job.AssigneeIDs {
			job.Assignees = append(job.Assignees, assignees[assigneeID])
		}
		jobMap[jobID] = job
	}

	// Convert the job map to a slice
	var jobsData []jobs.JobJson
	for _, job := range jobMap {
		jobsData = append(jobsData, job)
	}

	// Marshal jobsData to JSON and send the response
	response := map[string]interface{}{
		"board": map[string]interface{}{
			"columns": columnsData,
			"jobs":    jobsData,
			"ordered": orderedColumns,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
