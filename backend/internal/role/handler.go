package roles

import (
	"context"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Role"

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

type CreateRoleRequest struct {
	Role authz.Role `json:"role"`
}

func (h *adaptor) CreateRole(r *http.Request, args *CreateRoleRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermission(r, h.authz, "roles", "create")
	if err != nil || !ok {
		return err
	}

	roleID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO roles (id, name, description, user_ids, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err = h.dbpool.Exec(ctx, query, roleID, args.Role.Name, args.Role.Description, args.Role.UserIDs, time.Now())
	if err != nil {
		return err
	}

	return nil
}

type DeleteRoleRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

func (h *adaptor) DeleteRole(r *http.Request, args *DeleteRoleRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermission(r, h.authz, "roles", "delete")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		DELETE FROM roles
		WHERE id = $1
	`

	_, err = h.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return err
	}

	return nil
}

type GetRoleRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type GetRoleResponse struct {
	Role authz.Role `json:"role"`
}

func (h *adaptor) GetRole(r *http.Request, args *GetRoleRequest, result *GetRoleResponse) error {
	ok, err := utils.CheckPermission(r, h.authz, "roles", "read")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		SELECT id, name, description, user_ids, created_at
		FROM roles
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, args.ID)

	var role authz.Role
	err = row.Scan(&role.ID, &role.Name, &role.Description, &role.UserIDs, &role.CreatedAt)
	if err != nil {
		return err
	}

	result.Role = role
	return nil
}

type UpdateRoleRequest struct {
	Role authz.Role `json:"role"`
}

func (h *adaptor) UpdateRole(r *http.Request, args *UpdateRoleRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermission(r, h.authz, "roles", "update")
	if err != nil || !ok {
		return err
	}

	// Perform basic validation on the role data before update
	if args.Role.Name == "" {
		return utils.NewBadRequestError("Name is a required field")
	}

	ctx := context.Background()
	query := `
		UPDATE roles
		SET name = $2, description = $3, user_ids = $4
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, args.Role.ID, args.Role.Name, args.Role.Description, args.Role.UserIDs)
	if err != nil {
		return err
	}

	return nil
}
