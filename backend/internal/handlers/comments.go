// handlers/comments.go

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

type CommentsHandler struct {
	client *bigquery.Client
}

func NewCommentsHandler(client *bigquery.Client) *CommentsHandler {
	return &CommentsHandler{
		client: client,
	}
}

type Comment struct {
	ID        int64     `json:"id"`
	MemberID  string    `json:"memberId"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

func (h *CommentsHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Comments").Inserter()
	err = inserter.Put(ctx, &comment)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *CommentsHandler) GetComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, memberId, text, createdAt
		FROM main.Comments
		WHERE id = @commentID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "commentID", Value: commentID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return
	}

	var comment Comment
	err = it.Next(&comment)
	if err == iterator.Done {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read comment data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(comment)
}

func (h *CommentsHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	var comment Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Comments
		SET memberId = @memberId, text = @text, createdAt = @createdAt
		WHERE id = @commentID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "commentID", Value: commentID},
		{Name: "memberId", Value: comment.MemberID},
		{Name: "text", Value: comment.Text},
		{Name: "createdAt", Value: comment.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update comment", http.StatusInternalServerError)
		return
	}
}

func (h *CommentsHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Comments
		WHERE id = @commentID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "commentID", Value: commentID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
