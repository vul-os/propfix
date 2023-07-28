// handlers/members.go

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type MembersHandler struct {
	client *bigquery.Client
}

func NewMembersHandler(client *bigquery.Client) *MembersHandler {
	return &MembersHandler{
		client: client,
	}
}

type Member struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
	Email  string `json:"email"`
}

func (h *MembersHandler) CreateMember(w http.ResponseWriter, r *http.Request) {
	var member Member
	err := json.NewDecoder(r.Body).Decode(&member)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	fmt.Println(member)
	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		INSERT INTO main.members (id, userId, email)
		VALUES (@id, @userId, @email)
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: member.ID},
		{Name: "userId", Value: member.UserID},
		{Name: "email", Value: member.Email},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to create member", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *MembersHandler) GetMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, userId, email
		FROM main.members
		WHERE id = @memberID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "memberID", Value: memberID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Member not found", http.StatusNotFound)
		return
	}

	var member Member
	err = it.Next(&member)
	if err == iterator.Done {
		http.Error(w, "Member not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read member data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(member)
}

func (h *MembersHandler) UpdateMember(w http.ResponseWriter, r *http.Request) {
	var member Member
	err := json.NewDecoder(r.Body).Decode(&member)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	fmt.Println(member)
	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.members
		SET userId = @userId, email = @email
		WHERE id = @memberID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "memberID", Value: member.ID},
		{Name: "userId", Value: member.UserID},
		{Name: "email", Value: member.Email},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update member", http.StatusInternalServerError)
		return
	}
}

func (h *MembersHandler) DeleteMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Members
		WHERE id = @memberID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "memberID", Value: memberID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete member", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
