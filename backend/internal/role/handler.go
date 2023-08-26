package role

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

// RoleHandler represents the HTTP handler for role CRUD operations.
type RoleHandler struct {
	pool  *pgxpool.Pool
	authz *authz.Authz // Add the authz.Authorizer field to handle permission checks
}

// NewRoleHandler creates a new instance of the RoleHandler.
func NewRoleHandler(pool *pgxpool.Pool, authz *authz.Authz) *RoleHandler {
	return &RoleHandler{
		pool:  pool,
		authz: authz,
	}
}

func (h *RoleHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var role authz.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Generate a UUID for the role ID
	role.ID = uuid.New().String()
	role.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO roles (id, name, description, user_ids, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var createdID string
	err = h.pool.QueryRow(ctx, query, role.ID, role.Name, role.Description, role.UserIDs, role.CreatedAt).Scan(&createdID)
	if err != nil {
		http.Error(w, "Failed to create role", http.StatusInternalServerError)
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


func (h *RoleHandler) GetRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, name, description, user_ids, created_at
		FROM roles
		WHERE id = $1
	`

	var role authz.Role
	err := h.pool.QueryRow(ctx, query, roleID).Scan(&role.ID, &role.Name, &role.Description, &role.UserIDs, &role.CreatedAt)
	if err != nil {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(role)
}

func (h *RoleHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	var role authz.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to update roles
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "update"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to update role", http.StatusForbidden)
	// 	return
	// }

	// Perform basic validation on the role data before update
	if role.Name == "" || role.Description == "" {
		http.Error(w, "Name and Description are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE roles
		SET name = $1, description = $2, user_ids = $3
		WHERE id = $4
	`

	_, err = h.pool.Exec(ctx, query, role.Name, role.Description, role.UserIDs, role.ID)
	if err != nil {
		http.Error(w, "Failed to update role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *RoleHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to delete roles
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "delete"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to delete role", http.StatusForbidden)
	// 	return
	// }

	ctx := context.Background()
	query := `
		DELETE FROM roles
		WHERE id = $1
	`

	_, err := h.pool.Exec(ctx, query, roleID)
	if err != nil {
		http.Error(w, "Failed to delete role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *RoleHandler) AddUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]

	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to add users to roles
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "adduser"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to add user to role", http.StatusForbidden)
	// 	return
	// }

	// Decode the user ID from the request body
	var userID string
	err := json.NewDecoder(r.Body).Decode(&userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE roles
		SET user_ids = array_append(user_ids, $1)
		WHERE id = $2
	`

	_, err = h.pool.Exec(ctx, query, userID, roleID)
	if err != nil {
		http.Error(w, "Failed to add user to role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *RoleHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]
	// user, ok := r.Context().Value("user").(user.User)
	// if !ok {
	// 	http.Error(w, "Failed to get user details", http.StatusInternalServerError)
	// 	return
	// }

	// // Check if the user has the permission to delete users from roles
	// if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "deleteuser"); err != nil {
	// 	http.Error(w, "Failed to check permission", http.StatusInternalServerError)
	// 	return
	// } else if !hasPermission {
	// 	http.Error(w, "You do not have permission to delete user for role", http.StatusForbidden)
	// 	return
	// }

	// Decode the user ID from the request body
	var userID string
	err := json.NewDecoder(r.Body).Decode(&userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := `
		UPDATE roles
		SET user_ids = array_remove(user_ids, $1)
		WHERE id = $2
	`

	_, err = h.pool.Exec(ctx, query, userID, roleID)
	if err != nil {
		http.Error(w, "Failed to remove user from role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
