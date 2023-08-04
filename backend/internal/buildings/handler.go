package buildings

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type BuildingsHandler struct {
	client *bigquery.Client
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewBuildingsHandler(client *bigquery.Client, authz *authz.Authz) *BuildingsHandler {
	return &BuildingsHandler{
		client: client,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Building struct {
	ID               string    `bigquery:"id" json:"id"`
	BuildingName     string    `bigquery:"buildingName" json:"buildingName"`
	Address          string    `bigquery:"address" json:"address"`
	UnitNumberSystem string    `bigquery:"unitNumberSystem" json:"unitNumberSystem"`
	CreatedAt        time.Time `bigquery:"createdAt" json:"createdAt"`
}

func (h *BuildingsHandler) CreateBuilding(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(authz.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to create buildings
	if hasPermission, err := h.authz.CheckPermission(user.ID, "buildings", "create"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to create buildings", http.StatusForbidden)
		return
	}

	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	building.ID = uuid.New().String()
	building.CreatedAt = time.Now()

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Buildings").Inserter()
	err = inserter.Put(ctx, &building)
	if err != nil {
		http.Error(w, "Failed to create building", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BuildingsHandler) GetBuilding(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(authz.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to get buildings
	if hasPermission, err := h.authz.CheckPermission(user.ID, "buildings", "read"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to get buildings", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	buildingID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, buildingName, address, unitNumberSystem, createdAt
		FROM main.Buildings
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "buildingID", Value: buildingID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Building not found", http.StatusNotFound)
		return
	}

	var building Building
	err = it.Next(&building)
	if err == iterator.Done {
		http.Error(w, "Building not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read building data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(building)
}

func (h *BuildingsHandler) UpdateBuilding(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(authz.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update buildings
	if hasPermission, err := h.authz.CheckPermission(user.ID, "buildings", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update buildings", http.StatusForbidden)
		return
	}

	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the building data before update
	if building.BuildingName == "" || building.Address == "" || building.UnitNumberSystem == "" {
		http.Error(w, "BuildingName, Address, and UnitNumberSystem are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Buildings
		SET buildingName = @buildingName, address = @address, unitNumberSystem = @unitNumberSystem
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "buildingID", Value: building.ID},
		{Name: "buildingName", Value: building.BuildingName},
		{Name: "address", Value: building.Address},
		{Name: "unitNumberSystem", Value: building.UnitNumberSystem},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update building", http.StatusInternalServerError)
		return
	}
}

func (h *BuildingsHandler) DeleteBuilding(w http.ResponseWriter, r *http.Request) {
	// Get the user from the request context
	user, ok := r.Context().Value("user").(authz.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to delete buildings
	if hasPermission, err := h.authz.CheckPermission(user.ID, "buildings", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete buildings", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	buildingID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Buildings
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "buildingID", Value: buildingID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete building", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
