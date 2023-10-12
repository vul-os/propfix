package organizations

import (
	"context"
	"errors"
	"log"
	"net/http"

	"firebase.google.com/go/v4/auth"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/mail"
	"github.com/exolutionza/propfix-backend-go/internal/roles"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/pendingMembers"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/google/uuid"
)

type adaptor struct {
	authz               *authz.Authz
	store               *OrganizationStore
	pendingMembersStore *pendingMembers.Store
	rolesStore          *roles.Store
	mailClient          *mail.MailgunClient
	authClient          *auth.Client
}

const Name = "Organizations"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	st *OrganizationStore,
	pms *pendingMembers.Store,
	rs *roles.Store,
	authz *authz.Authz,
	authn *auth.Client,
	m *mail.MailgunClient,
) *adaptor {
	return &adaptor{
		authz:               authz,
		authClient:          authn,
		store:               st,
		pendingMembersStore: pms,
		rolesStore:          rs,
		mailClient:          m,
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
		ID:      orgID,
		Name:    args.Organization.Name,
		Members: args.Organization.Members,
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
	RoleId         string `json:"roleId"`
}

type InviteMemberResponse struct {
	Status string `json:"status"`
}

func (a *adaptor) InviteMember(r *http.Request, args *InviteMemberRequest, result *InviteMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "invite")
	if err != nil || !ok {
		return errors.New("not permitted")
	}
	org, err := a.store.GetOrganizationByID(args.OrganizationId)
	if err != nil {
		return err
	}

	_, err = a.pendingMembersStore.AddPendingMember(pendingMembers.PendingMember{
		Email:          args.Email,
		OrganizationID: args.OrganizationId,
		RoleID:         args.RoleId,
	})
	if err != nil {
		return err
	}

	err = a.mailClient.SendInvite(args.Email, args.OrganizationId, org.Name)
	if err != nil {
		return errors.New("failed to send invitation email")
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

	mem, err := a.pendingMembersStore.GetPendingMember(args.OrganizationId, user.Email)
	if err != nil {
		return err
	}

	if mem != nil {
		return errors.New("user is not invited")
	}

	err = a.rolesStore.AddMember(mem.RoleID, user.ID)
	if err != nil {
		return err
	}

	err = a.pendingMembersStore.DeletePendingMember(args.OrganizationId, user.Email)
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

type RemoveMemberRequest struct {
	OrganizationId string `json:"organizationId"`
	UserId         string `json:"userId"`
}

type RemoveMemberResponse struct {
	Status string `json:"status"`
}

func (a *adaptor) RemoveMember(r *http.Request, args *RemoveMemberRequest, result *RemoveMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "delete_member")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.store.RemoveMember(args.OrganizationId, args.UserId)
	if err != nil {
		return err
	}

	result.Status = "Member removed from the organization"
	return nil
}

type RemovePendingMemberRequest struct {
	OrganizationId string `json:"organizationId"`
	Email          string `json:"email"`
}

type RemovePendingMemberResponse struct {
	Status string `json:"status"`
}

func (a *adaptor) RemovePendingMember(r *http.Request, args *RemovePendingMemberRequest, result *RemovePendingMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "delete_pending_member")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = a.pendingMembersStore.DeletePendingMember(args.OrganizationId, args.Email)
	if err != nil {
		return err
	}

	result.Status = "Pending member removed from the organization"
	return nil
}

func (a *adaptor) fetchUserData(userIDs []string, orgId string) ([]user.User, error) {
	ctx := context.Background()

	// Assuming you have a UserStore or some other method to fetch user data
	var userData []user.User

	for _, userID := range userIDs {
		u, err := a.authClient.GetUser(ctx, userID)
		if err != nil {
			log.Printf("Error fetching user by ID: %v\n", err)
			return nil, err
		}

		role, err := a.rolesStore.GetFirstRoleByUserID(userID, orgId)
		if err != nil {
			log.Printf("Error fetching user role by ID: %v\n", err)
			return nil, err
		}
		// Convert Firebase Auth user data into your user.User struct
		userRecord := user.User{
			ID:          u.UID,
			DisplayName: u.DisplayName,
			Email:       u.Email,
			PhotoURL:    u.PhotoURL,
			RoleId:      role.ID,
		}

		userData = append(userData, userRecord)
	}

	return userData, nil
}

type GetAllMembersRequest struct {
	OrganizationId string `json:"organizationId"`
}

type GetAllMembersResponse struct {
	Members        []user.User                    `json:"members"`
	PendingMembers []pendingMembers.PendingMember `json:"pending_members"`
}

func (a *adaptor) GetAllMembers(r *http.Request, args *GetAllMembersRequest, result *GetAllMembersResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "get")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	mems, err := a.store.GetAllMembers(args.OrganizationId)
	if err != nil {
		return err
	}

	pmems, err := a.pendingMembersStore.GetAllPendingMembers(args.OrganizationId)
	if err != nil {
		return err
	}

	membersData, err := a.fetchUserData(mems, args.OrganizationId)
	if err != nil {
		return err
	}

	result.Members = membersData
	result.PendingMembers = pmems

	return nil
}
