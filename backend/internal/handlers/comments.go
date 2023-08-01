package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
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
	ID        string    `bigquery:"id"`
	MemberID  string    `bigquery:"memberId"`
	Text      string    `bigquery:"text"`
	CreatedAt time.Time `bigquery:"createdAt"`
	JobID     string    `bigquery:"jobid"`
}

func (h *CommentsHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the comment data before insertion
	if comment.MemberID == "" || comment.Text == "" || comment.JobID == "" {
		http.Error(w, "MemberID, Text, and JobID are required fields", http.StatusBadRequest)
		return
	}

	// Generate a UUID and set it as the ID field
	comment.ID = uuid.New().String()

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		INSERT INTO main.comments (id, memberId, text, createdAt, jobid)
		VALUES (@id, @memberId, @text, @createdAt, @jobid)
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: comment.ID},
		{Name: "memberId", Value: comment.MemberID},
		{Name: "text", Value: comment.Text},
		{Name: "createdAt", Value: comment.CreatedAt},
		{Name: "jobid", Value: comment.JobID},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	// Create a response with the generated ID
	response := struct {
		ID string `json:"id"`
	}{
		ID: comment.ID,
	}

	// Encode the response to JSON and send it as the HTTP response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *CommentsHandler) GetComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, memberId, text, createdAt, jobid
		FROM main.comments
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

	// Perform basic validation on the comment data before update
	if comment.MemberID == "" || comment.Text == "" || comment.JobID == "" {
		http.Error(w, "MemberID, Text, and JobID are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.comments
		SET memberId = @memberId, text = @text, createdAt = @createdAt, jobid = @jobid
		WHERE id = @commentID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "commentID", Value: commentID},
		{Name: "memberId", Value: comment.MemberID},
		{Name: "text", Value: comment.Text},
		{Name: "createdAt", Value: comment.CreatedAt},
		{Name: "jobid", Value: comment.JobID},
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
		DELETE FROM main.comments
		WHERE id = @commentID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "commentID", Value: commentID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete comment", http.StatusInternalServerError)
		return
	}
}
