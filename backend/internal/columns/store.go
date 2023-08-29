package columns

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type ColumnsStore struct {
	pool *pgxpool.Pool
}

func NewColumnsStore(pool *pgxpool.Pool) *ColumnsStore {
	return &ColumnsStore{
		pool: pool,
	}
}

func (s *ColumnsStore) CreateColumn(column Column) (string, error) {
	ctx := context.Background()
	columnID := uuid.New().String()
	query := `
		INSERT INTO columns (id, name, job_ids, organization_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := s.pool.QueryRow(ctx, query, columnID, column.Name, column.JobIDs, column.OrganizationID).Scan(&columnID)
	if err != nil {
		return "", fmt.Errorf("Failed to create column")
	}

	return columnID, nil
}

func (s *ColumnsStore) UpdateColumn(column Column) error {
	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $1, job_ids = $2, organization_id = $3
		WHERE id = $4
	`

	_, err := s.pool.Exec(ctx, query, column.Name, column.JobIDs, column.OrganizationID, column.ID)
	if err != nil {
		return fmt.Errorf("Failed to update column")
	}

	return nil
}

func (s *ColumnsStore) GetColumn(columnID string) (*Column, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, organization_id
		FROM columns
		WHERE id = $1
	`

	var column Column
	err := s.pool.QueryRow(ctx, query, columnID).Scan(&column.ID, &column.Name, &column.JobIDs, &column.OrganizationID)
	if err != nil {
		return nil, fmt.Errorf("Column not found")
	}

	return &column, nil
}

func (s *ColumnsStore) DeleteColumn(columnID string) error {
	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`

	_, err := s.pool.Exec(ctx, query, columnID)
	if err != nil {
		return err
	}

	return nil
}

func (s *ColumnsStore) GetAllColumns(organizationID string) ([]Column, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, organization_id
		FROM columns
		WHERE organization_id = $1
	`

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get columns for organization: %v", err)
	}
	defer rows.Close()

	var columns []Column
	for rows.Next() {
		var column Column
		err := rows.Scan(&column.ID, &column.Name, &column.JobIDs, &column.OrganizationID)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan column row: %v", err)
		}
		columns = append(columns, column)
	}

	return columns, nil
}

func (s *ColumnsStore) AddJobs(columnID string, jobIDs []string) error {
	ctx := context.Background()

	// Fetch existing job IDs from the column
	existingColumn, err := s.GetColumn(columnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	// Append new job IDs to the existing ones
	newJobIDs := append(existingColumn.JobIDs, jobIDs...)

	// Update the column with the new job IDs
	query := `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = s.pool.Exec(ctx, query, strings.Join(newJobIDs, ","), columnID)
	if err != nil {
		return fmt.Errorf("Failed to add jobs to column: %v", err)
	}

	return nil
}

func (s *ColumnsStore) RemoveJobs(columnID string, jobIDsToRemove []string) error {
	ctx := context.Background()

	// Fetch existing job IDs from the column
	existingColumn, err := s.GetColumn(columnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	// Create a map of existing job IDs for quick lookup
	existingJobIDsMap := make(map[string]bool)
	for _, id := range existingColumn.JobIDs {
		existingJobIDsMap[id] = true
	}

	// Filter out job IDs to be removed
	newJobIDs := make([]string, 0)
	for _, id := range existingColumn.JobIDs {
		if _, exists := existingJobIDsMap[id]; !exists {
			newJobIDs = append(newJobIDs, id)
		}
	}

	// Update the column with the new job IDs
	query := `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = s.pool.Exec(ctx, query, strings.Join(newJobIDs, ","), columnID)
	if err != nil {
		return fmt.Errorf("Failed to remove jobs from column: %v", err)
	}

	return nil
}
