package organizations

import (
	"encoding/json"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type OrganizationHandler struct {
	store *OrganizationStore
	authz *authz.Authz
}

type Organization struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

func NewOrganizationHandler(store *OrganizationStore, authz *authz.Authz) *OrganizationHandler {
	return &OrganizationHandler{
		store: store,
		authz: authz,
	}
}

func (h *OrganizationHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "create")
	if err != nil || !ok {
		return
	}

	var org Organization
	err = json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	org.ID = uuid.New().String()

	organization := &Organization{
		ID:      org.ID,
		Name:    org.Name,
		Members: org.Members,
	}

	err = h.store.CreateOrganization(organization)
	if err != nil {
		http.Error(w, "Failed to create organization", http.StatusInternalServerError)
		return
	}

	// Return the created ID in the response
	response := map[string]string{"id": org.ID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *OrganizationHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "update")
	if err != nil || !ok {
		return
	}

	var org Organization
	err = json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	organization := &Organization{
		ID:      org.ID,
		Name:    org.Name,
		Members: org.Members,
	}

	err = h.store.UpdateOrganization(organization)
	if err != nil {
		http.Error(w, "Failed to update organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrganizationHandler) GetOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	org, err := h.store.GetOrganizationByID(orgID)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(org)
}

func (h *OrganizationHandler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "organizations", "delete")
	if err != nil || !ok {
		return
	}

	vars := mux.Vars(r)
	orgID := vars["id"]

	err = h.store.DeleteOrganization(orgID)
	if err != nil {
		http.Error(w, "Failed to delete organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrganizationHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	var addMemberRequest struct {
		MemberID       string `json:"memberId"`
		OrganizationID string `json:"organizationId"`
	}

	err := json.NewDecoder(r.Body).Decode(&addMemberRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "organizations", "update", addMemberRequest.OrganizationID)
	if err != nil || !ok {
		return
	}

	// Get the organization from the store using OrganizationID
	org, err := h.store.GetOrganizationByID(addMemberRequest.OrganizationID)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	// Add the member to the organization's Members slice
	org.Members = append(org.Members, addMemberRequest.MemberID)

	// Update the organization in the store
	err = h.store.UpdateOrganization(org)
	if err != nil {
		http.Error(w, "Failed to update organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrganizationHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	var removeMemberRequest struct {
		MemberID       string `json:"memberId"`
		OrganizationID string `json:"organizationId"`
	}

	err := json.NewDecoder(r.Body).Decode(&removeMemberRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "organizations", "update", removeMemberRequest.OrganizationID)
	if err != nil || !ok {
		return
	}

	// Get the organization from the store using OrganizationID
	org, err := h.store.GetOrganizationByID(removeMemberRequest.OrganizationID)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	// Remove the member from the organization's Members slice
	org.Members = utils.RemoveString(org.Members, removeMemberRequest.MemberID)

	// Update the organization in the store
	err = h.store.UpdateOrganization(org)
	if err != nil {
		http.Error(w, "Failed to update organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
