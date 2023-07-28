// handlers/history.go

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type HistoryHandler struct {
	client *bigquery.Client
}

func NewHistoryHandler(client *bigquery.Client) *HistoryHandler {
	return &HistoryHandler{
		client: client,
	}
}

type History struct {
	ID        int64     `json:"id"`
	MemberID  string    `json:"memberId"`
	Action    string    `json:"action"`
	CreatedAt time.Time `json:"createdAt"`
}

func (h *HistoryHandler) CreateHistory(w http.ResponseWriter, r *http.Request) {
	var history History
	err := json.NewDecoder(r.Body).Decode(&history)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("History").Inserter()
	err = inserter.Put(ctx, &history)
	if err != nil {
		http.Error(w, "Failed to create history", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *HistoryHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	historyID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, memberId, action, createdAt
		FROM main.History
		WHERE id = @historyID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "historyID", Value: historyID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "History not found", http.StatusNotFound)
		return
	}

	var history History
	err = it.Next(&history)
	if err == iterator.Done {
		http.Error(w, "History not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read history data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(history)
}

func (h *HistoryHandler) UpdateHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	historyID := vars["id"]

	var history History
	err := json.NewDecoder(r.Body).Decode(&history)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.History
		SET memberId = @memberId, action = @action, createdAt = @createdAt
		WHERE id = @historyID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "historyID", Value: historyID},
		{Name: "memberId", Value: history.MemberID},
		{Name: "action", Value: history.Action},
		{Name: "createdAt", Value: history.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update history", http.StatusInternalServerError)
		return
	}
}

func (h *HistoryHandler) DeleteHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	historyID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.History
		WHERE id = @historyID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "historyID", Value: historyID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete history", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
