package buildings

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

// JSON-RPC request for creating a building
type CreateBuildingRequest struct {
	Building Building `json:"building"`
}

// JSON-RPC response for creating a building
type CreateBuildingResponse struct {
	ID string `json:"id"`
}

func (h *BuildingsHandler) CreateBuilding(r *http.Request, args *CreateBuildingRequest, result *CreateBuildingResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponse(r, h.authz, "buildings", "create", args.Building.OrganizationID)
	if err != nil || !ok {
		return err
	}

	args.Building.ID = uuid.New().String()
	args.Building.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO buildings (id, building_name, address, unit_number_system, created_at, organization_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	row := h.dbpool.QueryRow(ctx, query, args.Building.ID, args.Building.BuildingName, args.Building.Address, args.Building.UnitNumberSystem, args.Building.CreatedAt, args.Building.OrganizationID)
	if err := row.Scan(&args.Building.ID); err != nil {
		return err
	}

	result.ID = args.Building.ID
	return nil
}

// JSON-RPC request for getting a building
type GetBuildingRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

// JSON-RPC response for getting a building
type GetBuildingResponse struct {
	Building Building `json:"building"`
}

func (h *BuildingsHandler) GetBuilding(r *http.Request, args *GetBuildingRequest, result *GetBuildingResponse) error {
	ok, err := utils.CheckPermissionAndOrgsResponse(r, h.authz, "buildings", "read", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		SELECT id, building_name, address, unit_number_system, created_at, organization_id
		FROM buildings
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, args.ID)

	var building Building
	err = row.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.CreatedAt, &building.OrganizationID)
	if err != nil {
		return err
	}

	result.Building = building
	return nil
}

// JSON-RPC request for updating a building
type UpdateBuildingRequest struct {
	Building Building `json:"building"`
}

func (h *BuildingsHandler) UpdateBuilding(r *http.Request, args *UpdateBuildingRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponse(r, h.authz, "buildings", "update", args.Building.OrganizationID)
	if err != nil || !ok {
		return err
	}

	// Perform basic validation on the building data before update
	if args.Building.BuildingName == "" || args.Building.Address == "" || args.Building.UnitNumberSystem == "" {
		return utils.NewBadRequestError("BuildingName, Address, and UnitNumberSystem are required fields")
	}

	ctx := context.Background()
	query := `
		UPDATE buildings
		SET building_name = $2, address = $3, unit_number_system = $4
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, args.Building.ID, args.Building.BuildingName, args.Building.Address, args.Building.UnitNumberSystem)
	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for deleting a building
type DeleteBuildingRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

func (h *BuildingsHandler) DeleteBuilding(r *http.Request, args *DeleteBuildingRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndOrgsResponse(r, h.authz, "buildings", "delete", args.OrganizationID)
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		DELETE FROM buildings
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return err
	}

	return nil
}
