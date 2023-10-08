package inspectionAreas

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type InspectionArea struct {
	ID             string `json:"id"`
	Area           string `json:"area"`
	OrganizationID string `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewInspectionAreasStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (is *Store) Create(area InspectionArea) (string, error) {
	ctx := context.Background()
	areaID := uuid.New().String()
	query := `
		INSERT INTO inspection_areas (id, area, organization_id)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	err := is.pool.QueryRow(ctx, query, areaID, area.Area, area.OrganizationID).Scan(&areaID)
	if err != nil {
		return "", err
	}

	return areaID, nil
}

func (is *Store) Update(area InspectionArea) error {
	ctx := context.Background()
	query := `
		UPDATE inspection_areas
		SET area = $1
		WHERE id = $2 AND organization_id = $3
	`

	_, err := is.pool.Exec(ctx, query, area.Area, area.ID, area.OrganizationID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id, organizationID string) (*InspectionArea, error) {
	ctx := context.Background()
	query := `
		SELECT id, area, organization_id
		FROM inspection_areas
		WHERE id = $1 AND organization_id = $2
	`
	row := is.pool.QueryRow(ctx, query, id, organizationID)

	var area InspectionArea
	err := row.Scan(&area.ID, &area.Area, &area.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &area, nil
}

func (is *Store) Delete(id, organizationID string) error {
	ctx := context.Background()
	query := `
		DELETE FROM inspection_areas
		WHERE id = $1 AND organization_id = $2
	`

	_, err := is.pool.Exec(ctx, query, id, organizationID)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) GetAll(organizationID string) ([]InspectionArea, error) {
	ctx := context.Background()

	query := `
		SELECT id, area, organization_id
		FROM inspection_areas
		WHERE organization_id = $1
	`

	rows, err := is.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	areas := make([]InspectionArea, 0)
	for rows.Next() {
		var area InspectionArea
		err := rows.Scan(&area.ID, &area.Area, &area.OrganizationID)
		if err != nil {
			return nil, err
		}
		areas = append(areas, area)
	}

	return areas, nil
}
