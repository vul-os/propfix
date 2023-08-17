package Organizations

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type OrganizationHandler struct {
	client *bigquery.Client
}

type Organization struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []Member `json:"members"`
}

type Member struct {
	UserID string `json:"userId,omitempty"`
	Email  string `json:"email,omitempty"`
}

func NewOrganizationHandler(client *bigquery.Client) *OrganizationHandler {
	return &OrganizationHandler{
		client: client,
	}
}

func (h *OrganizationHandler) CreateOrganisation(w http.ResponseWriter, r *http.Request) {
	var org Organization
	err := json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if organization already exists
	ctx := context.Background()
	query := h.client.Query(fmt.Sprintf(`
		SELECT id FROM propfix.Organizations WHERE id = @orgID
	`))
	query.Parameters = []bigquery.QueryParameter{{Name: "orgID", Value: org.ID}}
	it, err := query.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to check organization existence", http.StatusInternalServerError)
		return
	}
	var existingOrg Organization
	err = it.Next(&existingOrg)
	if err != iterator.Done {
		http.Error(w, "Organisation already exists", http.StatusConflict)
		return
	}

	// Insert the organization into the BigQuery table
	inserter := h.client.Dataset("propfix").Table("Organizations").Inserter()
	err = inserter.Put(ctx, &org)
	if err != nil {
		http.Error(w, "Failed to create organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *OrganizationHandler) GetOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	ctx := context.Background()
	query := h.client.Query(fmt.Sprintf(`
		SELECT id, name, members
		FROM propfix.Organizations
		WHERE id = @orgID
	`))
	query.Parameters = []bigquery.QueryParameter{{Name: "orgID", Value: orgID}}
	it, err := query.Read(ctx)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}
	var org Organization
	err = it.Next(&org)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org)
}

func (h *OrganizationHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	var org Organization
	err := json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := h.client.Query(fmt.Sprintf(`
		UPDATE propfix.Organizations
		SET name = @name
		WHERE id = @orgID
	`))
	query.Parameters = []bigquery.QueryParameter{
		{Name: "name", Value: org.Name},
		{Name: "orgID", Value: orgID},
	}

	_, err = query.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrganizationHandler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	ctx := context.Background()
	query := h.client.Query(fmt.Sprintf(`
		DELETE FROM propfix.Organizations
		WHERE id = @orgID
	`))
	query.Parameters = []bigquery.QueryParameter{{Name: "orgID", Value: orgID}}

	_, err := query.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
