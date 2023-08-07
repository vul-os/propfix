package board

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

type BoardsHandler struct {
	client *bigquery.Client
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewBoardsHandler(client *bigquery.Client, authz *authz.Authz) *BoardsHandler {
	return &BoardsHandler{
		client: client,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Board struct {
	ID             string `bigquery:"id" json:"id"`
	Name           string `bigquery:"name" json:"name"`
	OrganizationID string `bigquery:"organizationId" json:"organizationId"`
}

func (h *BoardsHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "boards", "create"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to create boards", http.StatusForbidden)
		return
	}

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Boards").Inserter()
	err = inserter.Put(ctx, &board)
	if err != nil {
		http.Error(w, "Failed to create board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BoardsHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to get boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "boards", "read"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to get boards", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	boardID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, organizationId
		FROM main.Boards
		WHERE id = @boardID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "boardID", Value: boardID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Board not found", http.StatusNotFound)
		return
	}

	var board Board
	err = it.Next(&board)
	if err != nil {
		http.Error(w, "Board not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(board)
}

func (h *BoardsHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "boards", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update boards", http.StatusForbidden)
		return
	}

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Boards
		SET name = @name
		WHERE id = @boardID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "boardID", Value: board.ID},
		{Name: "name", Value: board.Name},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update board", http.StatusInternalServerError)
		return
	}
}

func (h *BoardsHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to delete boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "boards", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete boards", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	boardID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Boards
		WHERE id = @boardID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "boardID", Value: boardID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *BoardsHandler) GetAllBoards(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to get boards
	if hasPermission, err := h.authz.CheckPermission(user.ID, "boards", "read"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to get boards", http.StatusForbidden)
		return
	}

	ctx := context.Background()
	q := h.client.Query(`
		SELECT id, name, organizationId
		FROM main.Boards
	`)

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch boards", http.StatusInternalServerError)
		return
	}

	var boards []Board
	for {
		var board Board
		err := it.Next(&board)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read boards data", http.StatusInternalServerError)
			return
		}
		boards = append(boards, board)
	}

	json.NewEncoder(w).Encode(boards)
}
