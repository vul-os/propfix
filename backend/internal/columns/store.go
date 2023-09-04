package columns

import (
	"context"
	"fmt"

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
		INSERT INTO columns (id, name, organization_id, order_index)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := s.pool.QueryRow(ctx, query, columnID, column.Name, column.OrganizationID, column.OrderIndex).Scan(&columnID)
	if err != nil {
		return "", fmt.Errorf("Failed to create column: %v", err)
	}

	return columnID, nil
}

func (s *ColumnsStore) UpdateColumn(column Column) error {
	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $1, organization_id = $2, order_index = $3
		WHERE id = $4
	`

	_, err := s.pool.Exec(ctx, query, column.Name, column.OrganizationID, column.OrderIndex, column.ID)
	if err != nil {
		return fmt.Errorf("Failed to update column: %v", err)
	}

	return nil
}

func (s *ColumnsStore) GetColumn(columnID string) (*Column, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, organization_id, order_index
		FROM columns
		WHERE id = $1
	`

	var column Column
	err := s.pool.QueryRow(ctx, query, columnID).Scan(&column.ID, &column.Name, &column.OrganizationID, &column.OrderIndex)
	if err != nil {
		return nil, fmt.Errorf("Column not found: %v", err)
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
		return fmt.Errorf("Failed to delete column: %v", err)
	}

	return nil
}

func (s *ColumnsStore) GetAllColumns(organizationID string) ([]Column, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, organization_id, order_index
		FROM columns
		WHERE organization_id = $1
		ORDER BY order_index
	`

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get columns for organization: %v", err)
	}
	defer rows.Close()

	var columns []Column
	for rows.Next() {
		var column Column
		err := rows.Scan(&column.ID, &column.Name, &column.OrganizationID, &column.OrderIndex)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan column row: %v", err)
		}
		columns = append(columns, column)
	}

	return columns, nil
}
