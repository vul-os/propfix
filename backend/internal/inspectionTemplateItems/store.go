package inspectionTemplateItems

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type InspectionTemplateItem struct {
	ID                   string    `json:"id"`
	OrderIndex           int       `json:"orderIndex"`
	Item                 string    `json:"item"`
	InspectionTemplateID string    `json:"inspectionTemplateID"`
	CreatedAt            time.Time `json:"createdAt"`
	OrganizationID       string    `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewInspectionTemplateItemsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (is *Store) Create(item InspectionTemplateItem) (string, error) {
	ctx := context.Background()
	itemID := uuid.New().String()
	query := `
		INSERT INTO inspection_template_items (id, order_index, item, inspection_template_id, created_at, organization_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	err := is.pool.QueryRow(ctx, query, itemID, item.OrderIndex, item.Item, item.InspectionTemplateID, time.Now(), item.OrganizationID).Scan(&itemID)
	if err != nil {
		return "", err
	}

	return itemID, nil
}

func (is *Store) Update(item InspectionTemplateItem) error {
	ctx := context.Background()
	query := `
		UPDATE inspection_template_items
		SET order_index = $1, item = $2, inspection_template_id = $3
		WHERE id = $4 AND organization_id = $5
	`

	_, err := is.pool.Exec(ctx, query, item.OrderIndex, item.Item, item.InspectionTemplateID, item.ID, item.OrganizationID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id string) (*InspectionTemplateItem, error) {
	ctx := context.Background()
	query := `
		SELECT id, order_index, item, inspection_template_id, created_at, organization_id
		FROM inspection_template_items
		WHERE id = $1
	`
	row := is.pool.QueryRow(ctx, query, id)

	var item InspectionTemplateItem
	err := row.Scan(&item.ID, &item.OrderIndex, &item.Item, &item.InspectionTemplateID, &item.CreatedAt, &item.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (is *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
		DELETE FROM inspection_template_items
		WHERE id = $1
	`

	_, err := is.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) GetAll(organizationID string) ([]InspectionTemplateItem, error) {
	ctx := context.Background()

	query := `
		SELECT id, order_index, item, inspection_template_id, created_at
		FROM inspection_template_items
		WHERE organization_id = $1
	`

	rows, err := is.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]InspectionTemplateItem, 0)
	for rows.Next() {
		var item InspectionTemplateItem
		err := rows.Scan(&item.ID, &item.OrderIndex, &item.Item, &item.InspectionTemplateID, &item.CreatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}
