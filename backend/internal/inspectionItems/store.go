package inspectionItems

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type InspectionItem struct {
	ID                   string    `json:"id"`
	InspectionID         string    `json:"inspectionId"`
	InspectionTemplateID string    `json:"inspectionTemplateId"`
	Checked              bool      `json:"checked"`
	CheckedAt            time.Time `json:"checkedAt"`
	Comments             string    `json:"comments"`
	OrganizationID       string    `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewInspectionItemsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (is *Store) Create(item InspectionItem) (string, error) {
	ctx := context.Background()
	itemID := uuid.New().String()
	query := `
        INSERT INTO inspection_items (id, inspection_id, inspection_template_id, checked, checked_at, comments, organization_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

	err := is.pool.QueryRow(ctx, query, itemID, item.InspectionID, item.InspectionTemplateID, item.Checked, item.CheckedAt, item.Comments, item.OrganizationID).Scan(&itemID)
	if err != nil {
		return "", err
	}

	return itemID, nil
}

func (is *Store) Update(item InspectionItem) error {
	ctx := context.Background()
	query := `
        UPDATE inspection_items
        SET inspection_id = $1, inspection_template_id = $2, checked = $3, checked_at = $4, comments = $5
        WHERE id = $6 AND organization_id = $7
    `

	_, err := is.pool.Exec(ctx, query, item.InspectionID, item.InspectionTemplateID, item.Checked, item.CheckedAt, item.Comments, item.ID, item.OrganizationID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id string) (*InspectionItem, error) {
	ctx := context.Background()
	query := `
        SELECT id, inspection_id, inspection_template_id, checked, checked_at, comments, organization_id
        FROM inspection_items
        WHERE id = $1
    `
	row := is.pool.QueryRow(ctx, query, id)

	var item InspectionItem
	err := row.Scan(&item.ID, &item.InspectionID, &item.InspectionTemplateID, &item.Checked, &item.CheckedAt, &item.Comments, &item.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (is *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
        DELETE FROM inspection_items
        WHERE id = $1
    `

	_, err := is.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) GetAll(organizationID string) ([]InspectionItem, error) {
	ctx := context.Background()

	query := `
        SELECT id, inspection_id, inspection_template_id, checked, checked_at, comments
        FROM inspection_items
        WHERE organization_id = $1
    `

	rows, err := is.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]InspectionItem, 0)
	for rows.Next() {
		var item InspectionItem
		err := rows.Scan(&item.ID, &item.InspectionID, &item.InspectionTemplateID, &item.Checked, &item.CheckedAt, &item.Comments)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}
