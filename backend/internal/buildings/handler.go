package buildings

import (
	"context"
	"errors"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Building struct {
	ID               string    `json:"id"`
	BuildingName     string    `json:"buildingName"`
	Address          string    `json:"address"`
	UnitNumberSystem string    `json:"unitNumberSystem"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	CreatedAt        time.Time `json:"createdAt"`
	OrganizationID   string    `json:"organizationId"`
}

type adaptor struct {
	pool  *pgxpool.Pool
	authz *authz.Authz
}

func New(pool *pgxpool.Pool, authz *authz.Authz) *adaptor {
	return &adaptor{
		pool:  pool,
		authz: authz,
	}
}

const Name = "Buildings"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type CreateBuildingRequest struct {
	Building Building `json:"building"`
}

type CreateBuildingResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateBuilding(r *http.Request, args *CreateBuildingRequest, reply *CreateBuildingResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "buildings", "create", args.Building.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	buildingID := uuid.New().String()
	query := `
		INSERT INTO buildings (id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`

	err = a.pool.QueryRow(ctx, query, buildingID, args.Building.BuildingName, args.Building.Address, args.Building.UnitNumberSystem, args.Building.Latitude, args.Building.Longitude, time.Now(), args.Building.OrganizationID).Scan(&buildingID)
	if err != nil {
		return errors.New("Failed to create building")
	}

	reply.ID = buildingID
	return nil
}

type UpdateBuildingRequest struct {
	Building Building `json:"building"`
}

type UpdateBuildingResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateBuilding(r *http.Request, args *UpdateBuildingRequest, reply *UpdateBuildingResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "buildings", "update", args.Building.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE buildings
		SET building_name = $1, address = $2, unit_number_system = $3, latitude = $4, longitude = $5
		WHERE id = $6 AND organization_id = $7
	`

	_, err = a.pool.Exec(ctx, query, args.Building.BuildingName, args.Building.Address, args.Building.UnitNumberSystem, args.Building.Latitude, args.Building.Longitude, args.Building.ID, args.Building.OrganizationID)
	if err != nil {
		return errors.New("Failed to update building")
	}

	reply.Success = true
	return nil
}

type GetBuildingRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type GetBuildingResponse struct {
	Building Building `json:"building"`
}

func (a *adaptor) GetBuilding(r *http.Request, args *GetBuildingRequest, reply *GetBuildingResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "buildings", "read", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
		FROM buildings
		WHERE id = $1
	`
	row := a.pool.QueryRow(ctx, query, args.ID)

	var building Building
	err = row.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.Latitude, &building.Longitude, &building.CreatedAt, &building.OrganizationID)
	if err != nil {
		return err
	}

	reply.Building = building
	return nil
}

type DeleteBuildingRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type DeleteBuildingResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteBuilding(r *http.Request, args *DeleteBuildingRequest, reply *DeleteBuildingResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "buildings", "delete", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM buildings
		WHERE id = $1 AND organization_id = $2
	`

	_, err = a.pool.Exec(ctx, query, args.ID, args.OrganizationID)
	if err != nil {
		return errors.New("Failed to delete building")
	}

	reply.Success = true
	return nil
}

type GetAllBuildingsResponse struct {
	Buildings []Building `json:"buildings"`
}

type GetAllBuildingsRequest struct {
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`
	Search    string  `json:"search,omitempty"`
}

func (a *adaptor) GetAllBuildings(r *http.Request, args *GetAllBuildingsRequest, reply *GetAllBuildingsResponse) error {
	ctx := context.Background()

	var rows pgx.Rows
	var err error

	if args.Latitude != 0.0 && args.Longitude != 0.0 {
		query := `
			SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
			FROM buildings
			WHERE earth_box(ll_to_earth($1, $2), 5000) @> ll_to_earth(latitude, longitude)
		`
		rows, err = a.pool.Query(ctx, query, args.Latitude, args.Longitude)
	} else if args.Search != "" {
		query := `
			SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
			FROM buildings
			WHERE building_name ILIKE $1 OR address ILIKE $1
		`
		rows, err = a.pool.Query(ctx, query, "%"+args.Search+"%")
	} else {
		query := `
			SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
			FROM buildings
		`
		rows, err = a.pool.Query(ctx, query)
	}

	if err != nil {
		return err
	}
	defer rows.Close()

	buildings := make([]Building, 0)
	for rows.Next() {
		var building Building
		err := rows.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.Latitude, &building.Longitude, &building.CreatedAt, &building.OrganizationID)
		if err != nil {
			return err
		}
		buildings = append(buildings, building)
	}

	reply.Buildings = buildings
	return nil
}
