package columnJobLinks

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewColumnJobLinkStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (s *Store) MoveJob(fromColumnID, toColumnID, jobID string, newOrderIndex int) error {
	ctx := context.Background()
	dateUpdated := time.Now()
	linkID := uuid.New().String()

	query := `
		WITH moved_row AS (
			INSERT INTO ColumnJobLinks (id, column_id, job_id, date_updated, order_index)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (job_id, column_id) DO UPDATE
			SET column_id = EXCLUDED.column_id, date_updated = EXCLUDED.date_updated, order_index = EXCLUDED.order_index
			RETURNING *
		)
		DELETE FROM ColumnJobLinks
		WHERE column_id = $6 AND job_id = $7
		RETURNING *;
	`

	params := []interface{}{linkID, toColumnID, jobID, dateUpdated, newOrderIndex, fromColumnID, jobID}

	rows, err := s.pool.Query(ctx, query, params...)
	if err != nil {
		return fmt.Errorf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	// Process the deleted row, if needed
	for rows.Next() {
		// Handle the deleted row, if needed
	}

	return nil
}

func (s *Store) RemoveJobs(columnID string, jobIDsToRemove []string) error {
	ctx := context.Background()

	query := `
        DELETE FROM ColumnJobLinks
        WHERE column_id = $1 AND job_id = ANY($2)
    `

	_, err := s.pool.Exec(ctx, query, columnID, jobIDsToRemove)
	if err != nil {
		return errors.New("Failed to remove jobs from column")
	}

	return nil
}

func (s *Store) AddJobs(columnID string, jobIDs []string) error {
	ctx := context.Background()
	dateUpdated := time.Now()

	for i, jobID := range jobIDs {
		linkID := uuid.New().String()

		query := `
            INSERT INTO ColumnJobLinks (id, column_id, job_id, order_index, date_updated)
            VALUES ($1, $2, $3, $4, $5)
        `

		_, err := s.pool.Exec(ctx, query, linkID, columnID, jobID, i, dateUpdated)
		if err != nil {
			return errors.New("Failed to add job to column")
		}
	}

	return nil
}

func (s *Store) AddJobToFirstColumn(organizationID, jobID string) error {
	ctx := context.Background()
	dateUpdated := time.Now()
	linkID := uuid.New().String()

	query := `
		WITH column_data AS (
			SELECT id
			FROM columns
			WHERE organization_id = $1 AND name = 'New Jobs'
			LIMIT 1
		)
		INSERT INTO ColumnJobLinks (id, column_id, job_id, order_index, date_updated)
		SELECT $2, column_data.id, $3, 0, $4
		FROM column_data
	`

	_, err := s.pool.Exec(ctx, query, organizationID, linkID, jobID, dateUpdated)
	if err != nil {
		return errors.New("Failed to add job to first column")
	}

	return nil
}

func (s *Store) GetAllColumns(organizationID string) ([]ColumnWithJobIds, error) {
	ctx := context.Background()

	query := `
        SELECT c.id, c.name, c.order_index, j.job_id
        FROM columns c
        LEFT JOIN ColumnJobLinks j ON c.id = j.column_id
        WHERE c.organization_id = $1
        ORDER BY c.order_index ASC
    `

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	columnMap := make(map[string]*ColumnWithJobIds)

	for rows.Next() {
		var columnID, name string
		var jobID sql.NullString
		var orderIndex int

		if err := rows.Scan(&columnID, &name, &orderIndex, &jobID); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		_, exists := columnMap[columnID]

		if !exists {
			newColumn := &ColumnWithJobIds{
				ID:         columnID,
				Name:       name,
				OrderIndex: orderIndex,
				JobIds:     []string{},
			}
			columnMap[columnID] = newColumn
		}

		if jobID.Valid && jobID.String != "" {
			columnMap[columnID].JobIds = append(columnMap[columnID].JobIds, jobID.String)
		}

	}
	var finalColumns []ColumnWithJobIds
	for _, column := range columnMap {
		fmt.Println(*column)
		finalColumns = append(finalColumns, *column)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating through rows: %w", err)
	}

	return finalColumns, nil
}
