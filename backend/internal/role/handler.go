package role

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

// RoleHandler represents the HTTP handler for role CRUD operations.
type RoleHandler struct {
	client *bigquery.Client
	authz  *authz.Authz // Add the authz.Authorizer field to handle permission checks
}

// NewRoleHandler creates a new instance of the RoleHandler.
func NewRoleHandler(client *bigquery.Client, authz *authz.Authz) *RoleHandler {
	return &RoleHandler{
		client: client,
		authz:  authz,
	}
}

func (h *RoleHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var role authz.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create jobs
	if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "create"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to create role", http.StatusForbidden)
		return
	}
	// Generate a UUID for the role ID
	role.ID = uuid.New().String()
	role.CreatedAt = time.Now()

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Roles").Inserter()
	err = inserter.Put(ctx, &role)
	if err != nil {
		http.Error(w, "Failed to create role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *RoleHandler) GetRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, name, description, userIds, createdAt
		FROM main.roles
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "roleID", Value: roleID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	}

	var role authz.Role
	err = it.Next(&role)
	if err == iterator.Done {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read role data", http.StatusInternalServerError)
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

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create jobs
	if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update role", http.StatusForbidden)
		return
	}
	// Perform basic validation on the role data before update
	if role.Name == "" || role.Description == "" {
		http.Error(w, "Name and Description are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.roles
		SET name = @name, description = @description, userIds = @userIds, createdAt = @createdAt
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "roleID", Value: role.ID},
		{Name: "name", Value: role.Name},
		{Name: "description", Value: role.Description},
		{Name: "userIds", Value: role.UserIDs},
		{Name: "createdAt", Value: role.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update role", http.StatusInternalServerError)
		return
	}
}

func (h *RoleHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create jobs
	if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete role", http.StatusForbidden)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.roles
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "roleID", Value: roleID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *RoleHandler) AddUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create jobs
	if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "adduser"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to add user to role", http.StatusForbidden)
		return
	}
	// Decode the user ID from the request body
	var userID string
	err := json.NewDecoder(r.Body).Decode(&userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT userIds
		FROM main.roles
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "roleID", Value: roleID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	}

	var role authz.Role
	err = it.Next(&role)
	if err == iterator.Done {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read role data", http.StatusInternalServerError)
		return
	}

	// Add the user ID to the existing list
	role.UserIDs = append(role.UserIDs, userID)

	// Update the role with the new list of user IDs
	q = h.client.Query(fmt.Sprintf(`
		UPDATE main.roles
		SET userIds = @userIds
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "roleID", Value: role.ID},
		{Name: "userIds", Value: role.UserIDs},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to add user to role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *RoleHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["id"]
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create jobs
	if hasPermission, err := h.authz.CheckPermission(user.ID, "role", "deleteuser"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete user for role", http.StatusForbidden)
		return
	}
	// Decode the user ID from the request body
	var userID string
	err := json.NewDecoder(r.Body).Decode(&userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT userIds
		FROM main.roles
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "roleID", Value: roleID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	}

	var role authz.Role
	err = it.Next(&role)
	if err == iterator.Done {
		http.Error(w, "Role not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read role data", http.StatusInternalServerError)
		return
	}

	// Find and remove the user ID from the existing list
	var updatedUserIDs []string
	for _, id := range role.UserIDs {
		if id != userID {
			updatedUserIDs = append(updatedUserIDs, id)
		}
	}

	// Update the role with the new list of user IDs
	q = h.client.Query(fmt.Sprintf(`
		UPDATE main.roles
		SET userIds = @userIds
		WHERE id = @roleID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "roleID", Value: role.ID},
		{Name: "userIds", Value: updatedUserIDs},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to remove user from role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
