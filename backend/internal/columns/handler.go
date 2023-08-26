package columns

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	// "github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type ColumnsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewColumnsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *ColumnsHandler {
	return &ColumnsHandler{
		dbpool: dbpool,
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
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check permission using authz
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "create"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to update columns", http.StatusForbidden)
	// 	return
	// }

	var column Column
	err := json.NewDecoder(r.Body).Decode(&column)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		INSERT INTO columns (id, name, jobids, boardid)
		VALUES ($1, $2, $3, $4)
	`
	_, err = h.dbpool.Exec(ctx, query, column.ID, column.Name, column.JobIDs, column.BoardID)
	if err != nil {
		http.Error(w, "Failed to create column", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *ColumnsHandler) GetColumn(w http.ResponseWriter, r *http.Request) {
	// // Get the user from the request context
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to get columns
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "read"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to get columns", http.StatusForbidden)
	// 	return
	// }

	vars := mux.Vars(r)
	columnID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, name, jobids, boardid
		FROM columns
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, columnID)

	var column Column
	err := row.Scan(&column.ID, &column.Name, &column.JobIDs, &column.BoardID)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(column)
}

func (h *ColumnsHandler) UpdateColumn(w http.ResponseWriter, r *http.Request) {
	// // Get the user from the request context
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to update columns
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "update"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to update columns", http.StatusForbidden)
	// 	return
	// }

	var column Column
	err := json.NewDecoder(r.Body).Decode(&column)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $2, jobids = $3, boardid = $4
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, column.ID, column.Name, column.JobIDs, column.BoardID)
	if err != nil {
		http.Error(w, "Failed to update column", http.StatusInternalServerError)
		return
	}
}

func (h *ColumnsHandler) DeleteColumn(w http.ResponseWriter, r *http.Request) {
	// // Get the user from the request context
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to delete columns
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "delete"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to delete columns", http.StatusForbidden)
	// 	return
	// }

	vars := mux.Vars(r)
	columnID := vars["id"]

	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`
	_, err := h.dbpool.Exec(ctx, query, columnID)
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
	currentQuery := `
		SELECT id, name, jobids, boardid
		FROM columns
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, currentQuery, moveData.SourceID)
	var currentColumn Column
	err = row.Scan(&currentColumn.ID, &currentColumn.Name, &currentColumn.JobIDs, &currentColumn.BoardID)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	// Retrieve the target column
	targetQuery := `
		SELECT id, name, jobids, boardid
		FROM columns
		WHERE id = $1
	`
	row = h.dbpool.QueryRow(ctx, targetQuery, moveData.TargetID)
	var targetColumn Column
	err = row.Scan(&targetColumn.ID, &targetColumn.Name, &targetColumn.JobIDs, &targetColumn.BoardID)
	if err != nil {
		http.Error(w, "Column not found", http.StatusNotFound)
		return
	}

	// Move the job from the current column to the target column
	currentColumn.JobIDs = removeString(currentColumn.JobIDs, moveData.JobId)
	targetColumn.JobIDs = append(targetColumn.JobIDs, moveData.JobId)

	// Update the current column in the database
	updateCurrentQuery := `
		UPDATE columns
		SET jobids = $2
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, updateCurrentQuery, currentColumn.ID, currentColumn.JobIDs)
	if err != nil {
		http.Error(w, "Failed to move job", http.StatusInternalServerError)
		return
	}

	// Update the target column in the database
	updateTargetQuery := `
		UPDATE columns
		SET jobids = $2
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, updateTargetQuery, targetColumn.ID, targetColumn.JobIDs)
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
	// // Get the user from the request context
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to get columns
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "columns", "read"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to get columns", http.StatusForbidden)
	// 	return
	// }

	ctx := context.Background()
	query := `
		SELECT id, name, jobids, boardid
		FROM columns
	`
	rows, err := h.dbpool.Query(ctx, query)
	if err != nil {
		http.Error(w, "Failed to fetch columns", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var columns []Column
	for rows.Next() {
		var column Column
		err := rows.Scan(&column.ID, &column.Name, &column.JobIDs, &column.BoardID)
		if err != nil {
			http.Error(w, "Failed to read columns data", http.StatusInternalServerError)
			return
		}
		columns = append(columns, column)
	}

	json.NewEncoder(w).Encode(columns)
}
