package board

import (
	"context"
	"fmt"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type BoardsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

func NewBoardsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *BoardsHandler {
	return &BoardsHandler{
		dbpool: dbpool,
		authz:  authz,
	}
}

type CreateBoardRequest struct {
	Name           string `json:"name"`
	OrganizationID string `json:"organizationId"`
}

type CreateBoardResponse struct {
	ID string `json:"id"`
}

func (h *BoardsHandler) CreateBoard(args *CreateBoardRequest, result *CreateBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(nil, nil, h.authz, "boards", "create", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	boardID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO boards (id, name, organization_id)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	err = h.dbpool.QueryRow(ctx, query, boardID, args.Name, args.OrganizationID).Scan(&boardID)
	if err != nil {
		return fmt.Errorf("Failed to create board: %v", err)
	}

	result.ID = boardID
	return nil
}

// GetBoardRequest defines the request parameters for the GetBoard method.
type GetBoardRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

// GetBoardResponse defines the response structure for the GetBoard method.
type GetBoardResponse struct {
	Board Board `json:"board"`
}

// GetBoard retrieves a board by its ID.
func (h *BoardsHandler) GetBoard(args *GetBoardRequest, result *GetBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(nil, nil, h.authz, "boards", "read", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		SELECT id, name, organization_id
		FROM boards
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, args.ID)

	var board Board
	err = row.Scan(&board.ID, &board.Name, &board.OrganizationID)
	if err != nil {
		return fmt.Errorf("Board not found: %v", err)
	}

	result.Board = board
	return nil
}

package board

import (
	"context"
	"fmt"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type BoardsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

func NewBoardsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *BoardsHandler {
	return &BoardsHandler{
		dbpool: dbpool,
		authz:  authz,
	}
}

type CreateBoardRequest struct {
	Name           string `json:"name"`
	OrganizationID string `json:"organizationId"`
}

type CreateBoardResponse struct {
	ID string `json:"id"`
}

func (h *BoardsHandler) CreateBoard(args *CreateBoardRequest, result *CreateBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(nil, nil, h.authz, "boards", "create", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	boardID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO boards (id, name, organization_id)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	err = h.dbpool.QueryRow(ctx, query, boardID, args.Name, args.OrganizationID).Scan(&boardID)
	if err != nil {
		return fmt.Errorf("Failed to create board: %v", err)
	}

	result.ID = boardID
	return nil
}

// GetBoardRequest defines the request parameters for the GetBoard method.
type GetBoardRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

// GetBoardResponse defines the response structure for the GetBoard method.
type GetBoardResponse struct {
	Board Board `json:"board"`
}

// GetBoard retrieves a board by its ID.
func (h *BoardsHandler) GetBoard(args *GetBoardRequest, result *GetBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(nil, nil, h.authz, "boards", "read", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		SELECT id, name, organization_id
		FROM boards
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, args.ID)

	var board Board
	err = row.Scan(&board.ID, &board.Name, &board.OrganizationID)
	if err != nil {
		return fmt.Errorf("Board not found: %v", err)
	}

	result.Board = board
	return nil
}


