package board

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

	"cloud.google.com/go/bigquery"
	fAuth "firebase.google.com/go/v4/auth"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	pUser "github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
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

	// Retrieve the user from the request context
	user, ok := r.Context().Value("user").(pUser.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Retrieve the boardId from the route variables using Gorilla Mux
	vars := mux.Vars(r)
	boardId := vars["boardId"]

	// Check if the user has the permission to update events for the specified board
	if hasPermission, err := h.authz.CheckPermission(user.ID, "board", "get"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update events", http.StatusForbidden)
		return
	}

	// Query the columns table to fetch columns associated with the boardId
	columnsQuery := h.client.Query(fmt.Sprintf("SELECT id, name, jobids FROM propfix.main.columns WHERE boardId = '%s'", boardId))
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
			ID:      col.ID,
			Name:    col.Name,
			JobIDs:  col.JobIDs,
			BoardID: col.BoardID,
		}
		columnsData[col.ID] = columnData
		orderedColumns = append(orderedColumns, col.ID)
	}

	// Sort the ordered columns to ensure consistent order
	sort.Strings(orderedColumns)

	// Query the jobs table to fetch jobs associated with the boardId
	jobsQuery := h.client.Query(fmt.Sprintf("SELECT * FROM propfix.main.jobs WHERE boardId = '%s'", boardId))
	jobsIterator, err := jobsQuery.Read(ctx)
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

func getKeysFromMap(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

func (h *BoardHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(pUser.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "board", "create"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to create boards", http.StatusForbidden)
		return
	}

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	board.ID = uuid.New().String()

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Boards").Inserter()
	err = inserter.Put(ctx, &board)
	if err != nil {
		http.Error(w, "Failed to create board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BoardHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(pUser.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "board", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update boards", http.StatusForbidden)
		return
	}

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Boards
		SET name = @name
		WHERE id = @boardID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "name", Value: board.Name},
		{Name: "boardID", Value: board.ID},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *BoardHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(pUser.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to delete boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "board", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete boards", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	boardID := vars["boardId"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Boards
		WHERE id = @boardID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "boardID", Value: boardID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
