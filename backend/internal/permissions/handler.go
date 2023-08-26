package permissions

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	// "github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

// Permission represents a permission entity in the application.
type Permission struct {
	ID         string    `json:"id"`
	Resource   string    `json:"resource"`
	Permission string    `json:"permission"`
	Identifier string    `json:"identifier"`
	CreatedAt  time.Time `json:"createdAt"`
	// Add more fields as needed
}

// PermissionsHandler represents the HTTP handler for permission CRUD operations.
type PermissionsHandler struct {
	pool  *pgxpool.Pool
	authz *authz.Authz // Add the authz.Authorizer field to handle permission checks
}

// NewPermissionsHandler creates a new instance of the PermissionsHandler.
func NewPermissionsHandler(pool *pgxpool.Pool, authz *authz.Authz) *PermissionsHandler {
	return &PermissionsHandler{
		pool:  pool,
		authz: authz,
	}
}

func (h *PermissionsHandler) CreatePermission(w http.ResponseWriter, r *http.Request) {
	var permission Permission
	err := json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to create permissions
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "permissions", "create"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to create permissions", http.StatusForbidden)
	// 	return
	// }

	// Generate a UUID for the permission ID
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
		SELECT id, resource, permission, identifier, created_at
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
	var permission Permission
	err := json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the permission data before update
	if permission.Resource == "" || permission.Permission == "" || permission.Identifier == "" {
		http.Error(w, "Resource, Permission, and Identifier are required fields", http.StatusBadRequest)
		return
	}

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to update permissions
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "permissions", "update"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to update permissions", http.StatusForbidden)
	// 	return
	// }

	ctx := context.Background()
	query := `
		UPDATE permissions
		SET resource = $1, permission = $2, identifier = $3, created_at = $4
		WHERE id = $5
	`

	_, err = h.pool.Exec(ctx, query, permission.Resource, permission.Permission, permission.Identifier, permission.CreatedAt, permission.ID)
	if err != nil {
		http.Error(w, "Failed to update permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PermissionsHandler) DeletePermission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	permissionID := vars["id"]

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to delete permissions
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "permissions", "delete"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to delete permissions", http.StatusForbidden)
	// 	return
	// }

	ctx := context.Background()
	query := `
		DELETE FROM permissions
		WHERE id = $1
	`

	_, err := h.pool.Exec(ctx, query, permissionID)
	if err != nil {
		http.Error(w, "Failed to delete permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
