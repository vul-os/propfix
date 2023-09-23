package roles

import (
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"
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

type AddMemberRequest struct {
	RoleID string `json:"roleId"`
	UserID string `json:"userId"`
}

type AddMemberResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) AddMember(r *http.Request, args *AddMemberRequest, result *AddMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "add_member")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.AddMember(args.RoleID, args.UserID)
	if err != nil {
		result.Message = "Failed to add member to role"
		return err
	}

	result.Message = "Member added to role successfully"
	return nil
}

type RemoveMemberRequest struct {
	RoleID string `json:"roleId"`
	UserID string `json:"userId"`
}

type RemoveMemberResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) RemoveMember(r *http.Request, args *RemoveMemberRequest, result *RemoveMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "roles", "remove_member")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.RemoveMember(args.RoleID, args.UserID)
	if err != nil {
		result.Message = "Failed to remove member from role"
		return err
	}

	result.Message = "Member removed from role successfully"
	return nil
}

type GetAllRolesRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllRolesResponse struct {
	Roles []authz.Role `json:"roles"`
}

func (h *adaptor) GetAllRoles(r *http.Request, args *GetAllRolesRequest, reply *GetAllRolesResponse) error {
	ok, err := h.authz.CheckPermission(r, "roles", "getall")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	roles, err := h.store.GetAllRoles(args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Roles = roles
	return nil
}

type GetFirstRoleRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetFirstRoleResponse struct {
	Role *authz.Role `json:"role"`
}

func (a *adaptor) GetFirstRole(r *http.Request, args *GetFirstRoleRequest, result *GetFirstRoleResponse) error {
	// ok, err := a.authz.CheckPermission(r, "roles", "read")
	// if err != nil || !ok {
	// 	return errors.New("not permitted")
	// }
	user, ok := r.Context().Value("user").(user.User)
	if !ok || user.ID == "" {
		return errors.New("not permitted")
	}

	role, err := a.store.GetFirstRoleByUserID(user.ID, args.OrganizationID)
	if err != nil {
		return err
	}

	result.Role = role
	return nil
}
