package inspections

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Inspection struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	ScheduleDate   time.Time `json:"scheduleDate"`
	AssigneeIDs    []string  `json:"assigneeIds"`
	OrganizationID string    `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewInspectionsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (is *Store) Create(inspection Inspection) (string, error) {
	ctx := context.Background()
	inspectionID := uuid.New().String()
	query := `
		INSERT INTO inspections (id, name, schedule_date, assignee_ids, organization_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := is.pool.QueryRow(ctx, query, inspectionID, inspection.Name, inspection.ScheduleDate, inspection.AssigneeIDs, inspection.OrganizationID).Scan(&inspectionID)
	if err != nil {
		return "", err
	}

	return inspectionID, nil
}

func (is *Store) Update(inspection Inspection) error {
	ctx := context.Background()
	query := `
		UPDATE inspections
		SET name = $1, schedule_date = $2, assignee_ids = $3, organization_id = $4
		WHERE id = $5
	`

	_, err := is.pool.Exec(ctx, query, inspection.Name, inspection.ScheduleDate, inspection.AssigneeIDs, inspection.OrganizationID, inspection.ID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id string) (*Inspection, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, schedule_date, assignee_ids, organization_id
		FROM inspections
		WHERE id = $1
	`
	row := is.pool.QueryRow(ctx, query, id)

	var inspection Inspection
	err := row.Scan(&inspection.ID, &inspection.Name, &inspection.ScheduleDate, &inspection.AssigneeIDs, &inspection.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &inspection, nil
}

func (is *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
		DELETE FROM inspections
		WHERE id = $1 
	`

	_, err := is.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) List() ([]Inspection, error) {
	ctx := context.Background()

	query := `
		SELECT id, name, schedule_date, assignee_ids, organization_id
		FROM inspections
	`

	rows, err := is.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	inspections := make([]Inspection, 0)
	for rows.Next() {
		var inspection Inspection
		err := rows.Scan(&inspection.ID, &inspection.Name, &inspection.ScheduleDate, &inspection.AssigneeIDs, &inspection.OrganizationID)
		if err != nil {
			return nil, err
		}
		inspections = append(inspections, inspection)
	}

	return inspections, nil
}
