package organisations

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type OrganisationHandler struct {
	client *bigquery.Client
}

type Organisation struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []Member `json:"members"`
}

type Member struct {
	UserID string `json:"userId,omitempty"`
	Email  string `json:"email,omitempty"`
}

func NewOrganizationHandler(client *bigquery.Client) *OrganisationHandler {
	return &OrganisationHandler{
		client: client,
	}
}

func (h *OrganisationHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var org Organisation
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
	var existingOrg Organisation
	err = it.Next(&existingOrg)
	if err != iterator.Done {
		http.Error(w, "Organisation already exists", http.StatusConflict)
		return
	}

	// Insert the organization into the BigQuery table
	inserter := h.client.Dataset("propfix").Table("Organisations").Inserter()
	err = inserter.Put(ctx, &org)
	if err != nil {
		http.Error(w, "Failed to create organisation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *OrganisationHandler) GetOrganisation(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "Organisation not found", http.StatusNotFound)
		return
	}
	var org Organisation
	err = it.Next(&org)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org)
}

func (h *OrganisationHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	var org Organisation
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
		http.Error(w, "Failed to update organisation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrganisationHandler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]

	ctx := context.Background()
	query := h.client.Query(fmt.Sprintf(`
		DELETE FROM propfix.Organisations
		WHERE id = @orgID
	`))
	query.Parameters = []bigquery.QueryParameter{{Name: "orgID", Value: orgID}}

	_, err := query.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete organisation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
