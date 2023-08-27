package roles

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type RoleHandler struct {
	pool  *pgxpool.Pool
	authz *authz.Authz
}

func NewRoleHandler(pool *pgxpool.Pool, authz *authz.Authz) *RoleHandler {
	return &RoleHandler{
		pool:  pool,
		authz: authz,
	}
}

type GetRoleRequest struct {
	ID            string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

func (h *RoleHandler) GetRole(w http.ResponseWriter, r *http.Request) {
	var request GetRoleRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "roles", "read", request.OrganizationID)
	if err != nil || !ok {
		return
	}

	ctx := context.Background()
	query := `
		SELECT id, name, description, user_ids, created_at
		FROM roles
		WHERE id = $1
	`

	var role authz.Role
	err = h.pool.QueryRow(ctx, query, request.ID).Scan(&role.ID, &role.Name, &role.Description, &role.UserIDs, &role.CreatedAt)
	if err != nil {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(role)
}

type UpdateRoleRequest struct {
	ID            string   `json:"id"`
	OrganizationID string   `json:"organizationId"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	UserIDs       []string `json:"userIds"`
}

func (h *RoleHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	var request UpdateRoleRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if request.Name == "" || request.Description == "" {
		http.Error(w, "Name and Description are required fields", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "roles", "update", request.OrganizationID)
	if err != nil || !ok {
		return
	}

	ctx := context.Background()
	query := `
		UPDATE roles
		SET name = $1, description = $2, user_ids = $3
		WHERE id = $4
	`

	_, err = h.pool.Exec(ctx, query, request.Name, request.Description, request.UserIDs, request.ID)
	if err != nil {
		http.Error(w, "Failed to update role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type CreateRoleRequest struct {
	OrganizationID string   `json:"organizationId"`
	Name           string   `json:"name"`
	Description    string   `json:"description"`
	UserIDs        []string `json:"userIds"`
}

func (h *RoleHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var request CreateRoleRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "roles", "create", request.OrganizationID)
	if err != nil || !ok {
		return
	}

	ctx := context.Background()
	query := `
		INSERT INTO roles (id, organization_id, name, description, user_ids, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	roleID := uuid.New().String()
	_, err = h.pool.Exec(ctx, query, roleID, request.OrganizationID, request.Name, request.Description, request.UserIDs, time.Now())
	if err != nil {
		http.Error(w, "Failed to create role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

type DeleteRoleRequest struct {
	ID            string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

func (h *RoleHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	var request DeleteRoleRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ok, err := utils.CheckPermissionAndOrgs(w, r, h.authz, "roles", "delete", request.OrganizationID)
	if err != nil || !ok {
		return
	}

	ctx := context.Background()
	query := `
		DELETE FROM roles
		WHERE id = $1
	`

	_, err = h.pool.Exec(ctx, query, request.ID)
	if err != nil {
		http.Error(w, "Failed to delete role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}