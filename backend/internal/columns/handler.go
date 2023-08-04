package columns

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type ColumnsHandler struct {
	client *bigquery.Client
}

func NewColumnsHandler(client *bigquery.Client) *ColumnsHandler {
	return &ColumnsHandler{
		client: client,
	}
}

type Column struct {
	ID     string   `bigquery:"id" json:"id"`
	Name   string   `bigquery:"name" json:"name"`
	JobIDs []string `bigquery:"jobids" json:"jobids"`
}

func (h *ColumnsHandler) CreateColumn(w http.ResponseWriter, r *http.Request) {
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
	vars := mux.Vars(r)
	columnID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, jobids
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
	var column Column
	err := json.NewDecoder(r.Body).Decode(&column)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Columns
		SET name = @name, jobids = @jobids
		WHERE id = @columnID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "columnID", Value: column.ID},
		{Name: "name", Value: column.Name},
		{Name: "jobids", Value: column.JobIDs},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update column", http.StatusInternalServerError)
		return
	}
}

func (h *ColumnsHandler) DeleteColumn(w http.ResponseWriter, r *http.Request) {
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
	// ... (existing MoveJob function)
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
	ctx := context.Background()
	q := h.client.Query(`
		SELECT id, name, jobids
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
