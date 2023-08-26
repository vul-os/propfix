package buildings

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type BuildingsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewBuildingsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *BuildingsHandler {
	return &BuildingsHandler{
		dbpool: dbpool,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Building struct {
	ID               string    `json:"id"`
	BuildingName     string    `json:"buildingName"`
	Address          string    `json:"address"`
	UnitNumberSystem string    `json:"unitNumberSystem"`
	CreatedAt        time.Time `json:"createdAt"`
	OrganizationID   string    `json:"organizationId"`
}

func (h *BuildingsHandler) CreateBuilding(w http.ResponseWriter, r *http.Request) {
	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	building.ID = uuid.New().String()
	building.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO buildings (id, building_name, address, unit_number_system, created_at, organization_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	row := h.dbpool.QueryRow(ctx, query, building.ID, building.BuildingName, building.Address, building.UnitNumberSystem, building.CreatedAt, building.OrganizationID)
	if err := row.Scan(&building.ID); err != nil {
		http.Error(w, "Failed to create building", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": building.ID})
}


func (h *BuildingsHandler) GetBuilding(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	buildingID := vars["id"]

	ctx := context.Background()
	query := `
		SELECT id, building_name, address, unit_number_system, created_at, organization_id
		FROM buildings
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, buildingID)

	var building Building
	err := row.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.CreatedAt, &building.OrganizationID)
	if err != nil {
		http.Error(w, "Building not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(building)
}

func (h *BuildingsHandler) UpdateBuilding(w http.ResponseWriter, r *http.Request) {
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
	query := `
		UPDATE buildings
		SET building_name = $2, address = $3, unit_number_system = $4
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, building.ID, building.BuildingName, building.Address, building.UnitNumberSystem)
	if err != nil {
		http.Error(w, "Failed to update building", http.StatusInternalServerError)
		return
	}
}

func (h *BuildingsHandler) DeleteBuilding(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	buildingID := vars["id"]

	ctx := context.Background()
	query := `
		DELETE FROM buildings
		WHERE id = $1
	`
	_, err := h.dbpool.Exec(ctx, query, buildingID)
	if err != nil {
		http.Error(w, "Failed to delete building", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

