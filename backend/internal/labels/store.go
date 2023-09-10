package labels

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Label struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewLabelStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (s *Store) CreateLabel(label Label) (string, error) {
	ctx := context.Background()
	labelID := uuid.New().String()
	query := `
        INSERT INTO labels (id, organization_id, name, color)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	err := s.pool.QueryRow(ctx, query, labelID, label.OrganizationID, label.Name, label.Color).Scan(&labelID)
	if err != nil {
		return "", errors.New("Failed to create label")
	}

	return labelID, nil
}

func (s *Store) UpdateLabel(label Label) error {
	ctx := context.Background()
	query := `
        UPDATE labels
        SET name = $1, color = $2
        WHERE id = $3 AND organization_id = $4
    `

	_, err := s.pool.Exec(ctx, query, label.Name, label.Color, label.ID, label.OrganizationID)
	if err != nil {
		return errors.New("Failed to update label")
	}

	return nil
}

func (s *Store) GetLabel(labelID, organizationID string) (Label, error) {
	ctx := context.Background()
	query := `
        SELECT id, name, color, organization_id
        FROM labels
        WHERE id = $1
    `

	var label Label
	err := s.pool.QueryRow(ctx, query, labelID).Scan(&label.ID, &label.Name, &label.Color, &label.OrganizationID)
	if err != nil {
		return Label{}, errors.New("Label not found")
	}

	return label, nil
}

func (s *Store) DeleteLabel(labelID string) error {
	ctx := context.Background()
	query := `
        DELETE FROM labels
        WHERE id = $1
    `

	_, err := s.pool.Exec(ctx, query, labelID)
	if err != nil {
		return errors.New("Failed to delete label")
	}

	return nil
}

func (s *Store) GetAllLabels(organizationID string) ([]Label, error) {
	ctx := context.Background()
	query := `
        SELECT id, organization_id, name, color
        FROM labels
        WHERE organization_id = $1
    `

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	labels := make([]Label, 0)
	for rows.Next() {
		var label Label
		err := rows.Scan(&label.ID, &label.OrganizationID, &label.Name, &label.Color)
		if err != nil {
			return nil, err
		}
		labels = append(labels, label)
	}

	return labels, nil
}
