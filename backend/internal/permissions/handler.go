package permissions

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

// Permission represents a permission entity in the application.
type Permission struct {
	ID         string    `bigquery:"id" json:"id"`
	Resource   string    `bigquery:"resource" json:"resource"`
	Permission string    `bigquery:"permission" json:"permission"`
	Identifier string    `bigquery:"identifier" json:"identifier"`
	CreatedAt  time.Time `bigquery:"createdAt" json:"createdAt"`
	// Add more fields as needed
}

// PermissionsHandler represents the HTTP handler for permission CRUD operations.
type PermissionsHandler struct {
	client *bigquery.Client
}

// NewPermissionsHandler creates a new instance of the PermissionsHandler.
func NewPermissionsHandler(client *bigquery.Client) *PermissionsHandler {
	return &PermissionsHandler{
		client: client,
	}
}

func (h *PermissionsHandler) CreatePermission(w http.ResponseWriter, r *http.Request) {
	var permission Permission
	err := json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Generate a UUID for the permission ID
	permission.ID = uuid.New().String()
	permission.CreatedAt = time.Now()

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("permissions").Inserter()
	err = inserter.Put(ctx, &permission)
	if err != nil {
		http.Error(w, "Failed to create permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *PermissionsHandler) GetPermission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	permissionID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, resource, permission, userID, roleID, createdAt
		FROM main.permissions
		WHERE id = @permissionID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "permissionID", Value: permissionID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Permission not found", http.StatusNotFound)
		return
	}

	var permission Permission
	err = it.Next(&permission)
	if err == iterator.Done {
		http.Error(w, "Permission not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read permission data", http.StatusInternalServerError)
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
	if permission.Resource == "" || permission.Permission == "" || (permission.Identifier == "") {
		http.Error(w, "Resource, Permission, and either UserID or RoleID are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.permissions
		SET resource = @resource, permission = @permission, identifier = @identifier, roleID = @roleID, createdAt = @createdAt
		WHERE id = @permissionID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "permissionID", Value: permission.ID},
		{Name: "resource", Value: permission.Resource},
		{Name: "permission", Value: permission.Permission},
		{Name: "identifier", Value: permission.Identifier},
		{Name: "createdAt", Value: permission.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update permission", http.StatusInternalServerError)
		return
	}
}

func (h *PermissionsHandler) DeletePermission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	permissionID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.permissions
		WHERE id = @permissionID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "permissionID", Value: permissionID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete permission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
