package permissions

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

type Permission struct {
	ID         string    `json:"id"`
	Resource   string    `json:"resource"`
	Permission string    `json:"permission"`
	Identifier string    `json:"identifier"`
	CreatedAt  time.Time `json:"createdAt"`
}

type PermissionsHandler struct {
	pool  *pgxpool.Pool
	authz *authz.Authz
}

func NewPermissionsHandler(pool *pgxpool.Pool, authz *authz.Authz) *PermissionsHandler {
	return &PermissionsHandler{
		pool:  pool,
		authz: authz,
	}
}

func (h *PermissionsHandler) CreatePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permissions", "create")
	if err != nil || !ok {
		return
	}

	var permission Permission
	err = json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if permission.Resource == "" || permission.Permission == "" || permission.Identifier == "" {
		http.Error(w, "OrganizationID, Resource, Permission, and Identifier are required fields", http.StatusBadRequest)
		return
	}

	permission.ID = uuid.New().String()
	permission.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO permissions (id, resource, permission, identifier, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var createdID string
	err = h.pool.QueryRow(ctx, query, permission.ID, permission.Resource, permission.Permission, permission.Identifier, permission.CreatedAt).Scan(&createdID)
	if err != nil {
		http.Error(w, "Failed to create permission", http.StatusInternalServerError)
		return
	}

	response := struct {
		ID string `json:"id"`
	}{
		ID: createdID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *PermissionsHandler) GetPermission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	permissionID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, organization_id, resource, permission, identifier, created_at
		FROM permissions
		WHERE id = $1
	`

	var permission Permission
	err := h.pool.QueryRow(ctx, query, permissionID).Scan(&permission.ID, &permission.Resource, &permission.Permission, &permission.Identifier, &permission.CreatedAt)
	if err != nil {
		http.Error(w, "Permission not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(permission)
}

func (h *PermissionsHandler) UpdatePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permisions", "update")
	if err != nil || !ok {
		return
	}

	var permission Permission
	err = json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if permission.Resource == "" || permission.Permission == "" || permission.Identifier == "" {
		http.Error(w, "OrganizationID, Resource, Permission, and Identifier are required fields", http.StatusBadRequest)
		return
	}

	permission.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		UPDATE permissions
		SET organization_id = $1, resource = $2, permission = $3, identifier = $4, created_at = $5
		WHERE id = $6
	`

	_, err = h.pool.Exec(ctx, query, permission.Resource, permission.Permission, permission.Identifier, permission.CreatedAt, permission.ID)
	if err != nil {
		http.Error(w, "Failed to update permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PermissionsHandler) DeletePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permisions", "delete")
	if err != nil || !ok {
		return
	}

	vars := mux.Vars(r)
	permissionID := vars["id"]

	ctx := context.Background()
	query := `
		DELETE FROM permissions
		WHERE id = $1
	`

	_, err = h.pool.Exec(ctx, query, permissionID)
	if err != nil {
		http.Error(w, "Failed to delete permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
