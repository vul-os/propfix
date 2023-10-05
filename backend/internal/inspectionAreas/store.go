// store.go in the inspectionAreas package
package inspectionAreas

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type InspectionArea struct {
	ID   string `json:"id"`
	Area string `json:"area"`
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
		INSERT INTO inspection_areas (id, area)
		VALUES ($1, $2)
		RETURNING id
	`

	err := is.pool.QueryRow(ctx, query, areaID, area.Area).Scan(&areaID)
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
		WHERE id = $2
	`

	_, err := is.pool.Exec(ctx, query, area.Area, area.ID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id string) (*InspectionArea, error) {
	ctx := context.Background()
	query := `
		SELECT id, area
		FROM inspection_areas
		WHERE id = $1
	`
	row := is.pool.QueryRow(ctx, query, id)

	var area InspectionArea
	err := row.Scan(&area.ID, &area.Area)
	if err != nil {
		return nil, err
	}

	return &area, nil
}

func (is *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
		DELETE FROM inspection_areas
		WHERE id = $1 
	`

	_, err := is.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) List() ([]InspectionArea, error) {
	ctx := context.Background()

	query := `
		SELECT id, area
		FROM inspection_areas
	`

	rows, err := is.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	areas := make([]InspectionArea, 0)
	for rows.Next() {
		var area InspectionArea
		err := rows.Scan(&area.ID, &area.Area)
		if err != nil {
			return nil, err
		}
		areas = append(areas, area)
	}

	return areas, nil
}
