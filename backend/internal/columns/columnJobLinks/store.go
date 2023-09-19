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

	// If the source and destination columns are the same, it's just a reorder.
	// In that case, we should just update the order_index and not do an insert followed by delete.
	if fromColumnID == toColumnID {
		query := `
			UPDATE ColumnJobLinks 
			SET date_updated = $1, order_index = $2
			WHERE column_id = $3 AND job_id = $4;
		`

		params := []interface{}{dateUpdated, newOrderIndex, fromColumnID, jobID}

		_, err := s.pool.Exec(ctx, query, params...)
		if err != nil {
			return fmt.Errorf("Failed to execute query: %v", err)
		}
		return nil
	}

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
		),
		delete_previous AS (
			DELETE FROM ColumnJobLinks 
			WHERE job_id = $3 AND column_id IN (SELECT id FROM column_data)
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

// RemoveJobFromAllColumns removes the given jobID from all columns in the ColumnJobLinks table.
func (s *Store) RemoveJobFromAllColumns(jobID string) error {
	ctx := context.Background()

	query := `
		DELETE FROM ColumnJobLinks
		WHERE job_id = $1
	`

	if _, err := s.pool.Exec(ctx, query, jobID); err != nil {
		return fmt.Errorf("Failed to remove job with ID %s from all columns: %v", jobID, err)
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
		ORDER BY c.order_index ASC, j.order_index ASC, j.date_updated DESC
    `

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	columnMap := make(map[string]*ColumnWithJobIds)
	var columnsInOrder []*ColumnWithJobIds

	for rows.Next() {
		var columnID, name string
		var jobID sql.NullString
		var orderIndex int

		if err := rows.Scan(&columnID, &name, &orderIndex, &jobID); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if column, exists := columnMap[columnID]; exists {
			if jobID.Valid && jobID.String != "" {
				column.JobIds = append(column.JobIds, jobID.String)
			}
		} else {
			newColumn := &ColumnWithJobIds{
				ID:         columnID,
				Name:       name,
				OrderIndex: orderIndex,
				JobIds:     []string{},
			}
			if jobID.Valid && jobID.String != "" {
				newColumn.JobIds = append(newColumn.JobIds, jobID.String)
			}
			columnMap[columnID] = newColumn
			columnsInOrder = append(columnsInOrder, newColumn)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating through rows: %w", err)
	}

	// Convert slice of pointers to slice of values for the final result
	var finalColumns []ColumnWithJobIds
	for _, column := range columnsInOrder {
		finalColumns = append(finalColumns, *column)
	}

	return finalColumns, nil
}
