package columns

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Column struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	OrderIndex     int    `json:"orderIndex"`
	OrganizationID string `json:"organizationId"`
}

type adaptor struct {
	pool        *pgxpool.Pool
	authz       *authz.Authz
	columnStore *ColumnsStore
}

func New(pool *pgxpool.Pool, authz *authz.Authz, cs *ColumnsStore) *adaptor {
	return &adaptor{
		pool:        pool,
		authz:       authz,
		columnStore: cs,
	}
}

const Name = "Columns"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type CreateColumnRequest struct {
	Column Column `json:"column"`
}

type CreateColumnResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateColumn(r *http.Request, args *CreateColumnRequest, reply *CreateColumnResponse) error {
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "create", args.Column.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	columnID := uuid.New().String()
	query := `
		INSERT INTO columns (id, name, organization_id, order_index)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err = a.pool.QueryRow(ctx, query, columnID, args.Column.Name, args.Column.OrganizationID, args.Column.OrderIndex).Scan(&columnID)
	if err != nil {
		fmt.Println("CreateColumn Error:", err)
		return errors.New("Failed to create column")
	}

	reply.ID = columnID
	return nil
}

type UpdateColumnRequest struct {
	Column Column `json:"column"`
}

type UpdateColumnResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateColumn(r *http.Request, args *UpdateColumnRequest, reply *UpdateColumnResponse) error {
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "update", args.Column.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $1, organization_id = $2, order_index = $4
		WHERE id = $3
	`

	_, err = a.pool.Exec(ctx, query, args.Column.Name, args.Column.OrganizationID, args.Column.ID, args.Column.OrderIndex)
	if err != nil {
		fmt.Println("UpdateColumn Error:", err)
		return errors.New("Failed to update column")
	}

	reply.Success = true
	return nil
}

type GetColumnRequest struct {
	ColumnID string `json:"id"`
}

type GetColumnResponse struct {
	Column Column `json:"column"`
}

func (a *adaptor) GetColumn(r *http.Request, args *GetColumnRequest, reply *GetColumnResponse) error {
	ctx := context.Background()
	query := `
		SELECT id, name, organization_id
		FROM columns
		WHERE id = $1
	`

	var column Column
	err := a.pool.QueryRow(ctx, query, args.ColumnID).Scan(&column.ID, &column.Name, &column.OrganizationID)
	if err != nil {
		return errors.New("Column not found")
	}
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "get", column.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Column = column
	return nil
}

type DeleteColumnRequest struct {
	ColumnID string `json:"id"`
}

type DeleteColumnResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) DeleteColumn(r *http.Request, args *DeleteColumnRequest, result *DeleteColumnResponse) error {
	ok, err := a.authz.CheckPermission(r, "columns", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`

	res, err := a.pool.Exec(ctx, query, args.ColumnID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	numRows := res.RowsAffected()

	// Log the result to aid in debugging
	result.Message = fmt.Sprintf("Deleted %d rows\n", numRows)

	return nil
}
