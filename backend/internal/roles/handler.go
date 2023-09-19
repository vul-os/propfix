package roles

import (
	"errors"
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

// ... (Previous code for CreateRole, DeleteRole, GetRole, UpdateRole)

type AddMemberRequest struct {
	RoleID string `json:"role_id"`
	UserID string `json:"user_id"`
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

type RemoveMemberFromRoleRequest struct {
	RoleID string `json:"role_id"`
	UserID string `json:"user_id"`
}

type RemoveMemberFromRoleResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) RemoveMemberFromRole(r *http.Request, args *RemoveMemberFromRoleRequest, result *RemoveMemberFromRoleResponse) error {
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
