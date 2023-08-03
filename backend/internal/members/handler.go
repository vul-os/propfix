package members

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

type MembersHandler struct {
	client *bigquery.Client
}

func NewMembersHandler(client *bigquery.Client) *MembersHandler {
	return &MembersHandler{
		client: client,
	}
}

type Member struct {
	ID        string `bigquery:"id"`
	Email     string `bigquery:"email"`
	Role      string `bigquery:"role"`
	UserID    string `bigquery:"userid"`
	Name      string `bigquery:"name"`
	AvatarURL string `bigquery:"avatarurl"`
}

type CreateResponse struct {
	ID string `json:"id"`
}

func (h *MembersHandler) CreateMember(w http.ResponseWriter, r *http.Request) {
	var member Member
	err := json.NewDecoder(r.Body).Decode(&member)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the member data before insertion
	if member.UserID == "" || member.Email == "" {
		http.Error(w, "UserID and Email are required fields", http.StatusBadRequest)
		return
	}

	// Generate a UUID and set it as the ID field
	member.ID = uuid.New().String()

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		INSERT INTO main.members (id, userId, email, role, name, avatarurl)
		VALUES (@id, @userId, @email, @role, @name, @avatarurl)
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: member.ID},
		{Name: "userId", Value: member.UserID},
		{Name: "email", Value: member.Email},
		{Name: "role", Value: member.Role},
		{Name: "name", Value: member.Name},
		{Name: "avatarurl", Value: member.AvatarURL},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to create member", http.StatusInternalServerError)
		return
	}

	// Create a response with the generated ID
	response := CreateResponse{
		ID: member.ID,
	}

	// Encode the response to JSON and send it as the HTTP response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *MembersHandler) GetMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, userId, email, role, name, avatarurl
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

	// Perform basic validation on the member data before update
	if member.UserID == "" || member.Email == "" {
		http.Error(w, "UserID and Email are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.members
		SET userId = @userId, email = @email, role = @role, name = @name, avatarurl = @avatarurl
		WHERE id = @memberID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "memberID", Value: member.ID},
		{Name: "userId", Value: member.UserID},
		{Name: "email", Value: member.Email},
		{Name: "role", Value: member.Role},
		{Name: "name", Value: member.Name},
		{Name: "avatarurl", Value: member.AvatarURL},
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
		DELETE FROM main.members
		WHERE id = @memberID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "memberID", Value: memberID}}

	_, err := q.Run(ctx)
	if err != nil {
		// Log the error for debugging purposes.
		fmt.Printf("Failed to delete member: %v\n", err)
		http.Error(w, "Failed to delete member", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
