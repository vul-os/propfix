package columns

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type ColumnsHandler struct {
	client *bigquery.Client
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewColumnsHandler(client *bigquery.Client, authz *authz.Authz) *ColumnsHandler {
	return &ColumnsHandler{
		client: client,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Column struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	JobIDs  []string `json:"jobids"`
	BoardID string   `json:"boardId"`
}

func (h *ColumnsHandler) CreateColumn(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "create"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update columns", http.StatusForbidden)
		return
	}

	var column Column
	err := json.NewDecoder(r.Body).Decode(&column)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Columns").Inserter()
	err = inserter.Put(ctx, &column)
	if err != nil {
		http.Error(w, "Failed to create column", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *ColumnsHandler) GetColumn(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to get columns
	if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "read"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to get columns", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	columnID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, jobids, boardId
		FROM main.Columns
		WHERE id = @columnID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "columnID", Value: columnID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	var column Column
	err = it.Next(&column)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(column)
}

func (h *ColumnsHandler) UpdateColumn(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update columns
	if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update columns", http.StatusForbidden)
		return
	}

	var column Column
	err := json.NewDecoder(r.Body).Decode(&column)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Columns
		SET name = @name, jobids = @jobids, boardId = @boardId
		WHERE id = @columnID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "columnID", Value: column.ID},
		{Name: "name", Value: column.Name},
		{Name: "jobids", Value: column.JobIDs},
		{Name: "boardId", Value: column.BoardID},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update column", http.StatusInternalServerError)
		return
	}
}

func (h *ColumnsHandler) DeleteColumn(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to delete columns
	if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete columns", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	columnID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Columns
		WHERE id = @columnID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "columnID", Value: columnID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete column", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ColumnsHandler) MoveJob(w http.ResponseWriter, r *http.Request) {
	// Permission check for MoveJob endpoint is not necessary as it's based on specific source and target columns
	// and the user's permissions on those columns are already checked in GetColumn and UpdateColumn endpoints.

	var moveData struct {
		JobId    string `json:"jobId"`
		SourceID string `json:"sourceId"`
		TargetID string `json:"targetId"`
	}
	err := json.NewDecoder(r.Body).Decode(&moveData)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Retrieve the current column
	currentQuery := h.client.Query(fmt.Sprintf(`
		SELECT id, name, jobids, boardId
		FROM main.columns
		WHERE id = @sourceID
	`))
	currentQuery.Parameters = []bigquery.QueryParameter{{Name: "sourceID", Value: moveData.SourceID}}
	currentIterator, err := currentQuery.Read(ctx)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}
	var currentColumn Column
	err = currentIterator.Next(&currentColumn)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	// Retrieve the target column
	targetQuery := h.client.Query(fmt.Sprintf(`
		SELECT id, name, jobids, boardId
		FROM main.columns
		WHERE id = @targetID
	`))
	targetQuery.Parameters = []bigquery.QueryParameter{{Name: "targetID", Value: moveData.TargetID}}
	targetIterator, err := targetQuery.Read(ctx)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}
	var targetColumn Column
	err = targetIterator.Next(&targetColumn)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	// Move the job from the current column to the target column
	currentColumn.JobIDs = removeString(currentColumn.JobIDs, moveData.JobId)
	targetColumn.JobIDs = append(targetColumn.JobIDs, moveData.JobId)

	// Update the current column in the database
	updateCurrentQuery := h.client.Query(fmt.Sprintf(`
		UPDATE main.columns
		SET jobids = @jobIDs
		WHERE id = @sourceID
	`))
	updateCurrentQuery.Parameters = []bigquery.QueryParameter{
		{Name: "jobIDs", Value: currentColumn.JobIDs},
		{Name: "sourceID", Value: currentColumn.ID},
	}
	_, err = updateCurrentQuery.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to move job", http.StatusInternalServerError)
		return
	}

	// Update the target column in the database
	updateTargetQuery := h.client.Query(fmt.Sprintf(`
		UPDATE main.columns
		SET jobids = @jobIDs
		WHERE id = @targetID
	`))
	updateTargetQuery.Parameters = []bigquery.QueryParameter{
		{Name: "jobIDs", Value: targetColumn.JobIDs},
		{Name: "targetID", Value: targetColumn.ID},
	}
	_, err = updateTargetQuery.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to move job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// removeString removes the given string from the slice.
func removeString(slice []string, target string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != target {
			result = append(result, s)
		}
	}
	return result
}

func (h *ColumnsHandler) GetAllColumns(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to get columns
	if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "read"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to get columns", http.StatusForbidden)
		return
	}

	ctx := context.Background()
	q := h.client.Query(`
		SELECT id, name, jobids, boardId
		FROM main.Columns
	`)

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch columns", http.StatusInternalServerError)
		return
	}

	var columns []Column
	for {
		var column Column
		err := it.Next(&column)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read columns data", http.StatusInternalServerError)
			return
		}
		columns = append(columns, column)
	}

	json.NewEncoder(w).Encode(columns)
}
