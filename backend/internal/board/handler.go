package board

import (
	"context"
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Board struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	OrganizationID string `json:"organizationId"`
}

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Board"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		dbpool: dbpool,
		authz:  authz,
	}
}

type CreateBoardRequest struct {
	Board Board `json:"board"`
}

type CreateBoardResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateBoard(r *http.Request, args *CreateBoardRequest, result *CreateBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "boards", "create", args.Board.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	boardID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO boards (id, name, organization_id)
		VALUES ($1, $2, $3)
	`
	_, err = a.dbpool.Exec(ctx, query, boardID, args.Board.Name, args.Board.OrganizationID)
	if err != nil {
		return errors.New("Failed to create board")
	}

	result.ID = boardID
	return nil
}

type UpdateBoardRequest struct {
	Board Board `json:"board"`
}

type UpdateBoardResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateBoard(r *http.Request, args *UpdateBoardRequest, result *UpdateBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "boards", "update", args.Board.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	// Perform basic validation on the board data before update
	if args.Board.Name == "" {
		return utils.NewBadRequestError("Name is a required field")
	}

	ctx := context.Background()
	query := `
		UPDATE boards
		SET name = $2
		WHERE id = $1
	`
	_, err = a.dbpool.Exec(ctx, query, args.Board.ID, args.Board.Name)
	if err != nil {
		return errors.New("Failed to update board")
	}

	result.Success = true
	return nil
}

type DeleteBoardRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type DeleteBoardResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteBoard(r *http.Request, args *DeleteBoardRequest, result *DeleteBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "boards", "delete", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM boards
		WHERE id = $1
	`
	_, err = a.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return errors.New("Failed to delete board")
	}

	result.Success = true
	return nil
}

type GetBoardRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type GetBoardResponse struct {
	Board Board `json:"board"`
}

func (a *adaptor) GetBoard(r *http.Request, args *GetBoardRequest, result *GetBoardResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "boards", "read", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, name, organization_id
		FROM boards
		WHERE id = $1
	`
	row := a.dbpool.QueryRow(ctx, query, args.ID)

	var board Board
	err = row.Scan(&board.ID, &board.Name, &board.OrganizationID)
	if err != nil {
		return err
	}

	result.Board = board
	return nil
}
