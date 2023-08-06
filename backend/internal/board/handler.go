package board

import (
	"context"
	"encoding/json"
	"net/http"
	"sort"

	"cloud.google.com/go/bigquery"
	fAuth "firebase.google.com/go/v4/auth"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	pUser "github.com/exolutionza/propfix-backend-go/internal/user"

	"google.golang.org/api/iterator"
)

type BoardHandler struct {
	client     *bigquery.Client
	authz      *authz.Authz
	authClient *fAuth.Client
}

func NewBoardHandler(client *bigquery.Client, authClient *fAuth.Client, authz *authz.Authz) *BoardHandler {
	return &BoardHandler{
		client:     client,
		authz:      authz,
		authClient: authClient,
	}
}

func (h *BoardHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	user, ok := r.Context().Value("user").(pUser.User) // Replace "user.User" with the actual user type from your authentication mechanism
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update events
	if hasPermission, err := h.authz.CheckPermission(user.ID, "board", "get"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update events", http.StatusForbidden)
		return
	}

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
	assignees, err := auth.GetUsersFromIDs(ctx, getKeysFromMap(assigneeIDs), h.authClient)
	if err != nil {
		http.Error(w, "Failed to fetch assignees", http.StatusInternalServerError)
		return
	}
	// Convert the assignees slice into a map with assigneeID as the key
	assigneeMap := make(map[string]pUser.User)
	for _, assignee := range assignees {
		assigneeMap[assignee.ID] = *assignee
	}

	// Update the jobs with the reporter and assignee data
	for jobID, job := range jobMap {
		for _, assigneeID := range job.AssigneeIDs {
			assignee, ok := assigneeMap[assigneeID]
			if !ok {
				http.Error(w, "Assignee not found", http.StatusNotFound)
				return
			}
			job.Assignees = append(job.Assignees, assignee)
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

// Helper function to get keys from a map[string]bool and return them as a slice.
func getKeysFromMap(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
