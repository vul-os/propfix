package labels

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

// Label represents a label entity in the application.
type Label struct {
	ID      string `json:"id"`
	BoardID string `json:"boardId"`
	Name    string `json:"name"`
	Color   string `json:"color"`
	// Add more fields as needed
}

// LabelsHandler represents the HTTP handler for label CRUD operations.
type LabelsHandler struct {
	pool  *pgxpool.Pool
	authz *authz.Authz
}

// NewLabelsHandler creates a new instance of the LabelsHandler.
func NewLabelsHandler(pool *pgxpool.Pool, authz *authz.Authz) *LabelsHandler {
	return &LabelsHandler{
		pool:  pool,
		authz: authz,
	}
}

func (h *LabelsHandler) CreateLabel(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "labels", "create")
	if err != nil || !ok {
		return
	}

	var label Label
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the label data before insertion
	if label.Name == "" {
		http.Error(w, "Label name is required", http.StatusBadRequest)
		return
	}

	label.ID = uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO labels (id, name, color, board_id)
		VALUES ($1, $2, $3, $4)
	`

	_, err = h.pool.Exec(ctx, query, label.ID, label.Name, label.Color, label.BoardID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to create label", http.StatusInternalServerError)
		return
	}

	// Return the created ID in the response
	response := map[string]string{"id": label.ID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *LabelsHandler) GetLabel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	labelID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, name, color, board_id
		FROM labels
		WHERE id = $1
	`

	var label Label
	err := h.pool.QueryRow(ctx, query, labelID).Scan(&label.ID, &label.Name, &label.Color, &label.BoardID)
	if err != nil {
		http.Error(w, "Label not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(label)
}

func (h *LabelsHandler) UpdateLabel(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "labels", "update")
	if err != nil || !ok {
		return
	}

	var label Label
	err = json.NewDecoder(r.Body).Decode(&label)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the label data before update
	if label.Name == "" {
		http.Error(w, "Label name is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE labels
		SET name = $1, color = $2
		WHERE id = $3
	`

	_, err = h.pool.Exec(ctx, query, label.Name, label.Color, label.ID)
	if err != nil {
		http.Error(w, "Failed to update label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *LabelsHandler) DeleteLabel(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "labels", "delete")
	if err != nil || !ok {
		return
	}

	vars := mux.Vars(r)
	labelID := vars["id"]

	ctx := context.Background()
	query := `
		DELETE FROM labels
		WHERE id = $1
	`

	_, err = h.pool.Exec(ctx, query, labelID)
	if err != nil {
		http.Error(w, "Failed to delete label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *LabelsHandler) GetAllLabels(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	query := `
		SELECT id, name, color
		FROM labels
	`

	rows, err := h.pool.Query(ctx, query)
	if err != nil {
		http.Error(w, "Failed to fetch labels", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var labels []Label
	for rows.Next() {
		var label Label
		err := rows.Scan(&label.ID, &label.Name, &label.Color)
		if err != nil {
			http.Error(w, "Failed to read label data", http.StatusInternalServerError)
			return
		}
		labels = append(labels, label)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(labels)
}
