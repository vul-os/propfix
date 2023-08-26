package board

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type BoardsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewBoardsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *BoardsHandler {
	return &BoardsHandler{
		dbpool: dbpool,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Board struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	OrganizationID string `json:"organizationId"`
}

func (h *BoardsHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		INSERT INTO boards (id, name, organizationid)
		VALUES ($1, $2, $3)
	`
	_, err = h.dbpool.Exec(ctx, query, board.ID, board.Name, board.OrganizationID)
	if err != nil {
		http.Error(w, "Failed to create board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BoardsHandler) GetBoard(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	boardID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, name, organizationid
		FROM boards
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, boardID)

	var board Board
	err := row.Scan(&board.ID, &board.Name, &board.OrganizationID)
	if err != nil {
		http.Error(w, "Board not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(board)
}

func (h *BoardsHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {

	var board Board
	err := json.NewDecoder(r.Body).Decode(&board)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE boards
		SET name = $2
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, board.ID, board.Name)
	if err != nil {
		http.Error(w, "Failed to update board", http.StatusInternalServerError)
		return
	}
}

func (h *BoardsHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	boardID := vars["id"]

	ctx := context.Background()
	query := `
		DELETE FROM boards
		WHERE id = $1
	`
	_, err := h.dbpool.Exec(ctx, query, boardID)
	if err != nil {
		http.Error(w, "Failed to delete board", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *BoardsHandler) GetAllBoards(w http.ResponseWriter, r *http.Request) {

	ctx := context.Background()
	query := `
		SELECT id, name, organizationid
		FROM boards
	`

	rows, err := h.dbpool.Query(ctx, query)
	if err != nil {
		http.Error(w, "Failed to fetch boards", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var boards []Board
	for rows.Next() {
		var board Board
		err := rows.Scan(&board.ID, &board.Name, &board.OrganizationID)
		if err != nil {
			http.Error(w, "Failed to read boards data", http.StatusInternalServerError)
			return
		}
		boards = append(boards, board)
	}

	json.NewEncoder(w).Encode(boards)
}
