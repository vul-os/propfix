package labels

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

// Label represents a label entity in the application.
type Label struct {
	ID    string `bigquery:"id" json:"id"`
	Name  string `bigquery:"name" json:"name"`
	Color string `bigquery:"color" json:"color"`
	// Add more fields as needed
}

// LabelsHandler represents the HTTP handler for label CRUD operations.
type LabelsHandler struct {
	client *bigquery.Client
}

// NewLabelsHandler creates a new instance of the LabelsHandler.
func NewLabelsHandler(client *bigquery.Client) *LabelsHandler {
	return &LabelsHandler{
		client: client,
	}
}

func (h *LabelsHandler) CreateLabel(w http.ResponseWriter, r *http.Request) {
	var label Label
	err := json.NewDecoder(r.Body).Decode(&label)
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
	q := h.client.Query(fmt.Sprintf(`
		INSERT INTO main.labels (id, name, color)
		VALUES (@id, @name, @color)
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: label.ID},
		{Name: "name", Value: label.Name},
		{Name: "color", Value: label.Color},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to create label", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(label)
}

func (h *LabelsHandler) GetLabel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	labelID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, color
		FROM main.labels
		WHERE id = @labelID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "labelID", Value: labelID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Label not found", http.StatusNotFound)
		return
	}

	var label Label
	err = it.Next(&label)
	if err == iterator.Done {
		http.Error(w, "Label not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read label data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(label)
}

func (h *LabelsHandler) UpdateLabel(w http.ResponseWriter, r *http.Request) {
	var label Label
	err := json.NewDecoder(r.Body).Decode(&label)
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
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.labels
		SET name = @name, color = @color
		WHERE id = @labelID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "labelID", Value: label.ID},
		{Name: "name", Value: label.Name},
		{Name: "color", Value: label.Color},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *LabelsHandler) DeleteLabel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	labelID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.labels
		WHERE id = @labelID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "labelID", Value: labelID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *LabelsHandler) GetAllLabels(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	q := h.client.Query(`
		SELECT id, name, color
		FROM main.labels
	`)

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch labels", http.StatusInternalServerError)
		return
	}

	var labels []Label
	for {
		var label Label
		err := it.Next(&label)
		if err == iterator.Done {
			break
		} else if err != nil {
			http.Error(w, "Failed to read label data", http.StatusInternalServerError)
			return
		}
		labels = append(labels, label)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(labels)
}
