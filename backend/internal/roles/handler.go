package roles

import (
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const Name = "Roles"

type adaptor struct {
	store *Store
	authz *authz.Authz
}

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(store *Store, authz *authz.Authz) *adaptor {
	return &adaptor{
		store: store,
		authz: authz,
	}
}

type CreateRoleRequest struct {
	Role authz.Role `json:"role"`
}

type CreateRoleResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateRole(r *http.Request, request *CreateRoleRequest, response *CreateRoleResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "create")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	id, err := a.store.CreateRole(request.Role)
	if err != nil {
		return err
	}

	*response = CreateRoleResponse{
		ID: id,
	}
	return nil
}

type DeleteRoleRequest struct {
	ID string `json:"id"`
}

type DeleteRoleResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) DeleteRole(r *http.Request, args *DeleteRoleRequest, result *DeleteRoleResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.DeleteRole(args.ID)
	if err != nil {
		result.Message = "Failed to delete role"
		return err
	}

	result.Message = fmt.Sprintf("Role with ID %s deleted successfully", args.ID)
	return nil
}

type GetRoleRequest struct {
	ID string `json:"id"`
}

type GetRoleResponse struct {
	Role authz.Role `json:"role"`
}

func (a *adaptor) GetRole(r *http.Request, args *GetRoleRequest, result *GetRoleResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "read")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	role, err := a.store.GetRoleByID(args.ID)
	if err != nil {
		return err
	}

	result.Role = role
	return nil
}

type UpdateRoleRequest struct {
	Role authz.Role `json:"role"`
}

type UpdateRoleResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) UpdateRole(r *http.Request, args *UpdateRoleRequest, result *UpdateRoleResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.UpdateRole(args.Role)
	if err != nil {
		result.Message = "Failed to update role"
		return err
	}

	result.Message = "Role updated successfully"
	return nil
}
