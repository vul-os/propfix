package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

	"cloud.google.com/go/bigquery"
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

	columnsData := make(map[string]Column)
	var orderedColumns []string
	for {
		var col Column
		err := columnsIterator.Next(&col)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read columns data", http.StatusInternalServerError)
			return
		}

		// Construct the Column object
		columnData := Column{
			ID:     col.ID,
			Name:   col.Name,
			JobIDs: col.JobIDs,
		}
		columnsData[col.ID] = columnData
		orderedColumns = append(orderedColumns, col.ID)
	}

	// Sort the ordered columns to ensure consistent order
	sort.Strings(orderedColumns)

	// Query the jobs table
	jobsQuery := h.client.Query("SELECT * FROM propfix.main.jobs")
	jobsIterator, err := jobsQuery.Read(ctx)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	jobsData := make(map[string]Job)
	for {
		var job Job
		err := jobsIterator.Next(&job)
		if err == iterator.Done {
			break
		}
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}

		// Assuming the job ID is present in the task, use it as the key
		jobsData[job.ID] = job
	}

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
