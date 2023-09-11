package organizations

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/google/uuid"
)

type adaptor struct {
	authz *authz.Authz
	store *OrganizationStore
}

const Name = "Organizations"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	st *OrganizationStore,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		authz: authz,
		store: st,
	}
}

type CreateOrganizationRequest struct {
	Organization Organization `json:"organization"`
}

type CreateOrganizationResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateOrganization(r *http.Request, args *CreateOrganizationRequest, result *CreateOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "create")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	orgID := uuid.New().String()
	org := &Organization{
		ID:             orgID,
		Name:           args.Organization.Name,
		Members:        args.Organization.Members,
		PendingMembers: args.Organization.PendingMembers,
	}

	err = a.store.CreateOrganization(org)
	if err != nil {
		return err
	}

	result.ID = orgID
	return nil
}

type GetOrganizationRequest struct {
	ID string `json:"id"`
}

type GetOrganizationResponse struct {
	Organization Organization `json:"organization"`
}

func (a *adaptor) GetOrganization(r *http.Request, args *GetOrganizationRequest, result *GetOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "get")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	org, err := a.store.GetOrganizationByID(args.ID)
	if err != nil {
		return err
	}

	result.Organization = *org
	return nil
}

type GetAllOrganizationsRequest struct {
}

type GetAllOrganizationsResponse struct {
	Organizations []Organization `json:"organizations"`
}

func (a *adaptor) GetAllOrganizations(r *http.Request, args *GetAllOrganizationsRequest, result *GetAllOrganizationsResponse) error {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}
	ok, err := a.authz.CheckPermission(r, "organizations", "getall")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	orgs, err := a.store.GetAllOrganizations(user.ID)
	if err != nil {
		return err
	}

	result.Organizations = orgs
	return nil
}

type InviteMemberRequest struct {
	OrganizationId string `json:"organizationId"`
	Email          string `json:"email"`
}

type InviteMemberResponse struct {
	Status string `json:"status"`
}

func (a *adaptor) InviteMember(r *http.Request, args *InviteMemberRequest, result *InviteMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "invite")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.AddPendingMember(args.OrganizationId, args.Email)
	if err != nil {
		return err
	}

	result.Status = "Invitation sent"
	return nil
}

type AcceptMemberInviteRequest struct {
	OrganizationId string `json:"organizationId"`
}

type AcceptMemberInviteResponse struct {
	Status string `json:"status"`
}

func (a *adaptor) AcceptMemberInvite(r *http.Request, args *AcceptMemberInviteRequest, result *AcceptMemberInviteResponse) error {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}

	isPending, err := a.store.CheckPendingMember(args.OrganizationId, user.Email)
	if err != nil {
		return err
	}

	if !isPending {
		return errors.New("user is not invited")
	}

	err = a.store.RemovePendingMember(args.OrganizationId, user.Email)
	if err != nil {
		return err
	}

	err = a.store.AddMember(args.OrganizationId, user.ID)
	if err != nil {
		return err
	}

	result.Status = "Successfully joined the organization"
	return nil
}
