package buildings

import (
	"context"
	"fmt"
	"strings"
	"time"

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

type Store struct {
	pool *pgxpool.Pool
}

func NewBuildingsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (bs *Store) Create(building Building) (string, error) {
	ctx := context.Background()
	buildingID := uuid.New().String()
	query := `
		INSERT INTO buildings (id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`

	err := bs.pool.QueryRow(ctx, query, buildingID, building.BuildingName, building.Address, building.UnitNumberSystem, building.Latitude, building.Longitude, time.Now(), building.OrganizationID).Scan(&buildingID)
	if err != nil {
		return "", err
	}

	return buildingID, nil
}

func (bs *Store) Update(building Building) error {
	ctx := context.Background()
	query := `
		UPDATE buildings
		SET building_name = $1, address = $2, unit_number_system = $3, latitude = $4, longitude = $5
		WHERE id = $6 AND organization_id = $7
	`

	_, err := bs.pool.Exec(ctx, query, building.BuildingName, building.Address, building.UnitNumberSystem, building.Latitude, building.Longitude, building.ID, building.OrganizationID)
	if err != nil {
		return err
	}
	return nil
}

func (bs *Store) Get(id string) (*Building, error) {
	ctx := context.Background()
	query := `
		SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
		FROM buildings
		WHERE id = $1
	`
	row := bs.pool.QueryRow(ctx, query, id)

	var building Building
	err := row.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.Latitude, &building.Longitude, &building.CreatedAt, &building.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &building, nil
}

func (bs *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
		DELETE FROM buildings
		WHERE id = $1 
	`

	_, err := bs.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (bs *Store) GetAll(search string, lat float64, long float64, organizationID string) ([]Building, error) {
	ctx := context.Background()

	var rows pgx.Rows
	var err error
	var queryArgs []interface{} // Using an interface slice to handle different data types

	baseQuery := `
		SELECT id, building_name, address, unit_number_system, latitude, longitude, created_at, organization_id
		FROM buildings
	`

	var whereClauses []string
	var i = 1 // Counter for query placeholders

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(building_name ILIKE $%d OR address ILIKE $%d)", i, i))
		queryArgs = append(queryArgs, "%"+search+"%")
		i++
	} else if lat != 0.0 && long != 0.0 {
		whereClauses = append(whereClauses, fmt.Sprintf("earth_box(ll_to_earth($%d, $%d), 5000) @> ll_to_earth(latitude, longitude)", i, i+1))
		queryArgs = append(queryArgs, lat, long)
		i += 2
	}

	if organizationID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("organization_id = $%d", i))
		queryArgs = append(queryArgs, organizationID)
		i++
	}

	if len(whereClauses) > 0 {
		baseQuery += " WHERE " + strings.Join(whereClauses, " AND ")
	}
	rows, err = bs.pool.Query(ctx, baseQuery, queryArgs...)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	buildings := make([]Building, 0)
	for rows.Next() {
		var building Building
		err := rows.Scan(&building.ID, &building.BuildingName, &building.Address, &building.UnitNumberSystem, &building.Latitude, &building.Longitude, &building.CreatedAt, &building.OrganizationID)
		if err != nil {
			return nil, err
		}
		buildings = append(buildings, building)
	}

	return buildings, nil
}
