package permissions

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Permission struct {
	ID         string    `json:"id"`
	Resource   string    `json:"resource"`
	Permission string    `json:"permission"`
	Identifier string    `json:"identifier"`
	CreatedAt  time.Time `json:"createdAt"`
}

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Permissions"

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

type CreatePermissionRequest struct {
	Permission Permission `json:"permission"`
}

type CreatePermissionResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreatePermission(r *http.Request, args *CreatePermissionRequest, result *CreatePermissionResponse) error {
	ok, err := a.authz.CheckPermission(r, "permissions", "create")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	permissionID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO permissions (id, resource, permission, identifier, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err = a.dbpool.Exec(ctx, query, permissionID, args.Permission.Resource, args.Permission.Permission, args.Permission.Identifier, time.Now())
	if err != nil {
		return err
	}

	result.ID = permissionID
	return nil
}

type DeletePermissionRequest struct {
	ID string `json:"id"`
}

type DeletePermissionResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) DeletePermission(r *http.Request, args *DeletePermissionRequest, result *DeletePermissionResponse) error {
	ok, err := a.authz.CheckPermission(r, "permissions", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM permissions
		WHERE id = $1
	`

	res, err := a.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	numRows := res.RowsAffected()

	// Log the result to aid in debugging
	result.Message = fmt.Sprintf("Deleted %d rows\n", numRows)

	// Explicitly return a non0+++-nil error if there are no issues
	return nil
}

type GetPermissionRequest struct {
	ID string `json:"id"`
}

type GetPermissionResponse struct {
	Permission Permission `json:"permission"`
}

func (a *adaptor) GetPermission(r *http.Request, args *GetPermissionRequest, result *GetPermissionResponse) error {
	ok, err := a.authz.CheckPermission(r, "permissions", "read")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, resource, permission, identifier, created_at
		FROM permissions
		WHERE id = $1
	`
	row := a.dbpool.QueryRow(ctx, query, args.ID)

	var permission Permission
	err = row.Scan(&permission.ID, &permission.Resource, &permission.Permission, &permission.Identifier, &permission.CreatedAt)
	if err != nil {
		return err
	}

	result.Permission = permission
	return nil
}

type UpdatePermissionRequest struct {
	Permission Permission `json:"permission"`
}

func (a *adaptor) UpdatePermission(r *http.Request, args *UpdatePermissionRequest, result *utils.EmptyResponse) error {
	ok, err := a.authz.CheckPermission(r, "permissions", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE permissions
		SET resource = $2, permission = $3, identifier = $4
		WHERE id = $1
	`

	_, err = a.dbpool.Exec(ctx, query, args.Permission.ID, args.Permission.Resource, args.Permission.Permission, args.Permission.Identifier)
	if err != nil {
		return err
	}

	return nil
}
