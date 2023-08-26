package organizations

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type OrganizationHandler struct {
	pool *pgxpool.Pool
}

type Organization struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Members interface{} `json:"members"`
}

func NewOrganizationHandler(pool *pgxpool.Pool) *OrganizationHandler {
	return &OrganizationHandler{
		pool: pool,
	}
}

func (h *OrganizationHandler) GetOrganization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orgID := vars["id"]
	fmt.Println(orgID)

	ctx := context.Background()
	query := `
		SELECT id, name, members
		FROM organizations
		WHERE id = $1
	`

	var org Organization
	err := h.pool.QueryRow(ctx, query, orgID).Scan(&org.ID, &org.Name, &org.Members)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(org)
}

func (h *OrganizationHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	var org Organization
	err := json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	org.ID = uuid.New().String()

	query := `
		INSERT INTO organizations (id, name, members)
		VALUES ($1, $2, $3)
	`

	_, err = h.pool.Exec(ctx, query, org.ID, org.Name, org.Members)
	if err != nil {
		fmt.Println("Error creating organization:", err)
		http.Error(w, "Failed to create organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *OrganizationHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	var org Organization
	err := json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE organizations
		SET name = $1
		WHERE id = $2
	`

	_, err = h.pool.Exec(ctx, query, org.Name, org.ID)
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
	query := `
		DELETE FROM organizations
		WHERE id = $1
	`

	_, err := h.pool.Exec(ctx, query, orgID)
	if err != nil {
		fmt.Println("Error deleting organization:", err)
		http.Error(w, "Failed to delete organization", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
