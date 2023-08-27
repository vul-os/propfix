package organizations

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/rpc/v2/json2"
	"net/http"
)

type Organization struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

type OrganizationHandler struct {
	store *OrganizationStore
	authz *authz.Authz
}

func NewOrganizationHandler(store *OrganizationStore, authz *authz.Authz) *OrganizationHandler {
	return &OrganizationHandler{
		store: store,
		authz: authz,
	}
}

type CreateOrganizationRequest struct {
	Name string `json:"name"`
}

type CreateOrganizationResponse struct {
	ID string `json:"id"`
}

func (h *OrganizationHandler) CreateOrganization(r *http.Request, args *CreateOrganizationRequest, reply *CreateOrganizationResponse) error {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "create")
	if err != nil || !ok {
		return err
	}

	org := &Organization{
		ID:      uuid.New().String(),
		Name:    args.Name,
		Members: []string{},
	}

	err = h.store.CreateOrganization(org)
	if err != nil {
		return errors.New("Failed to create organization")
	}

	reply.ID = org.ID
	return nil
}

type UpdateOrganizationRequest struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

type UpdateOrganizationResponse struct {
	Success bool `json:"success"`
}

func (h *OrganizationHandler) UpdateOrganization(r *http.Request, args *UpdateOrganizationRequest, reply *UpdateOrganizationResponse) error {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "update")
	if err != nil || !ok {
		return err
	}

	org := &Organization{
		ID:      args.ID,
		Name:    args.Name,
		Members: args.Members,
	}

	err = h.store.UpdateOrganization(org)
	if err != nil {
		return errors.New("Failed to update organization")
	}

	reply.Success = true
	return nil
}

type GetOrganizationRequest struct {
	ID string `json:"id"`
}

type GetOrganizationResponse struct {
	Organization Organization `json:"organization"`
}

func (h *OrganizationHandler) GetOrganization(r *http.Request, args *GetOrganizationRequest, reply *GetOrganizationResponse) error {
	org, err := h.store.GetOrganizationByID(args.ID)
	if err != nil {
		return errors.New("Organization not found")
	}

	reply.Organization = *org
	return nil
}

type DeleteOrganizationRequest struct {
	ID string `json:"id"`
}

type DeleteOrganizationResponse struct {
	Success bool `json:"success"`
}

func (h *OrganizationHandler) DeleteOrganization(r *http.Request, args *DeleteOrganizationRequest, reply *DeleteOrganizationResponse) error {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "delete")
	if err != nil || !ok {
		return err
	}

	err = h.store.DeleteOrganization(args.ID)
	if err != nil {
		return errors.New("Failed to delete organization")
	}

	reply.Success = true
	return nil
}

type AddMemberRequest struct {
	MemberID       string `json:"memberId"`
	OrganizationID string `json:"organizationId"`
}

type AddMemberResponse struct {
	Success bool `json:"success"`
}

func (h *OrganizationHandler) AddMember(r *http.Request, args *AddMemberRequest, reply *AddMemberResponse) error {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "update", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	// Get the organization from the store using OrganizationID
	org, err := h.store.GetOrganizationByID(args.OrganizationID)
	if err != nil {
		return errors.New("Organization not found")
	}

	// Add the member to the organization's Members slice
	org.Members = append(org.Members, args.MemberID)

	// Update the organization in the store
	err = h.store.UpdateOrganization(org)
	if err != nil {
		return errors.New("Failed to update organization")
	}

	reply.Success = true
	return nil
}

type RemoveMemberRequest struct {
	MemberID       string `json:"memberId"`
	OrganizationID string `json:"organizationId"`
}

type RemoveMemberResponse struct {
	Success bool `json:"success"`
}

func (h *OrganizationHandler) RemoveMember(r *http.Request, args *RemoveMemberRequest, reply *RemoveMemberResponse) error {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "update", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	// Get the organization from the store using OrganizationID
	org, err := h.store.GetOrganizationByID(args.OrganizationID)
	if err != nil {
		return errors.New("Organization not found")
	}

	// Remove the member from the organization's Members slice
	org.Members = utils.RemoveString(org.Members, args.MemberID)

	// Update the organization in the store
	err = h.store.UpdateOrganization(org)
	if err != nil {
		return errors.New("Failed to update organization")
	}

	reply.Success = true
	return nil
}