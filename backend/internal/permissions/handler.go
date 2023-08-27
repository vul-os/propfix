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

// ... (other code)

type CreatePermissionRequest struct {
	Resource   string `json:"resource"`
	Permission string `json:"permission"`
	Identifier string `json:"identifier"`
}

func (h *PermissionsHandler) CreatePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permissions", "create")
	if err != nil || !ok {
		return
	}

	var request CreatePermissionRequest
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if request.Resource == "" || request.Permission == "" || request.Identifier == "" {
		http.Error(w, "Resource, Permission, and Identifier are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		INSERT INTO permissions (id, resource, permission, identifier, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	permissionID := uuid.New().String()
	createdAt := time.Now()
	err = h.pool.QueryRow(ctx, query, permissionID, request.Resource, request.Permission, request.Identifier, createdAt).Scan(&permissionID)
	if err != nil {
		http.Error(w, "Failed to create permission", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"id": permissionID}
	json.NewEncoder(w).Encode(response)
}

type DeletePermissionRequest struct {
	ID string `json:"id"`
}

func (h *PermissionsHandler) DeletePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permissions", "delete")
	if err != nil || !ok {
		return
	}

	var request DeletePermissionRequest
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		DELETE FROM permissions
		WHERE id = $1
	`

	_, err = h.pool.Exec(ctx, query, request.ID)
	if err != nil {
		http.Error(w, "Failed to delete permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type GetPermissionRequest struct {
	ID string `json:"id"`
}

func (h *PermissionsHandler) GetPermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permissions", "read")
	if err != nil || !ok {
		return
	}

	var request GetPermissionRequest
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		SELECT id, resource, permission, identifier, created_at
		FROM permissions
		WHERE id = $1
	`

	var permission Permission
	err = h.pool.QueryRow(ctx, query, request.ID).Scan(&permission.ID, &permission.Resource, &permission.Permission, &permission.Identifier, &permission.CreatedAt)
	if err != nil {
		http.Error(w, "Permission not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(permission)
}

type UpdatePermissionRequest struct {
	ID         string `json:"id"`
	Resource   string `json:"resource"`
	Permission string `json:"permission"`
	Identifier string `json:"identifier"`
}

func (h *PermissionsHandler) UpdatePermission(w http.ResponseWriter, r *http.Request) {
	ok, err := utils.CheckPermissionAndExecute(w, r, h.authz, "permissions", "update")
	if err != nil || !ok {
		return
	}

	var request UpdatePermissionRequest
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if request.Resource == "" || request.Permission == "" || request.Identifier == "" {
		http.Error(w, "Resource, Permission, and Identifier are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE permissions
		SET resource = $1, permission = $2, identifier = $3
		WHERE id = $4
	`

	_, err = h.pool.Exec(ctx, query, request.Resource, request.Permission, request.Identifier, request.ID)
	if err != nil {
		http.Error(w, "Failed to update permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
