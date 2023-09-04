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
		SELECT c.id, c.name, j.job_id
		FROM columns c
		LEFT JOIN ColumnJobLinks j ON c.id = j.column_id
		WHERE c.organization_id = $1
		ORDER BY c.name, j.order_index
	`

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, errors.New("Failed to execute query")
	}
	defer rows.Close()

	columnMap := make(map[string]*ColumnWithJobIds)
	var columns []ColumnWithJobIds

	for rows.Next() {
		var columnID, name string
		var jobID sql.NullString

		err := rows.Scan(&columnID, &name, &jobID)
		if err != nil {
			fmt.Println(err)
			return nil, errors.New("Failed to scan row")
		}

		// Check if the column already exists in the map
		if column, exists := columnMap[columnID]; exists {
			if jobID.Valid {
				column.JobIds = append(column.JobIds, jobID.String)
			}
		} else {
			var newJobIds []string
			if jobID.Valid {
				newJobIds = append(newJobIds, jobID.String)
			}
			newColumn := ColumnWithJobIds{
				ID:     columnID,
				Name:   name,
				JobIds: newJobIds,
			}

			columnMap[columnID] = &newColumn
			columns = append(columns, newColumn)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, errors.New("Error iterating through rows")
	}

	return columns, nil
}
