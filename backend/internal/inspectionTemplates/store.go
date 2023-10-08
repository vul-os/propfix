package inspectionTemplates

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type InspectionTemplate struct {
	ID             string    `json:"id"`
	Area           string    `json:"area"`
	CreatedAt      time.Time `json:"createdAt"`
	OrganizationID string    `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewInspectionTemplatesStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (is *Store) Create(template InspectionTemplate) (string, error) {
	ctx := context.Background()
	templateID := uuid.New().String()
	query := `
		INSERT INTO inspection_templates (id, area, created_at, organization_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := is.pool.QueryRow(ctx, query, templateID, template.Area, time.Now(), template.OrganizationID).Scan(&templateID)
	if err != nil {
		return "", err
	}

	return templateID, nil
}

func (is *Store) Update(template InspectionTemplate) error {
	ctx := context.Background()
	query := `
		UPDATE inspection_templates
		SET area = $1
		WHERE id = $2 AND organization_id = $3
	`

	_, err := is.pool.Exec(ctx, query, template.Area, template.ID, template.OrganizationID)
	if err != nil {
		return err
	}
	return nil
}

func (is *Store) Get(id string) (*InspectionTemplate, error) {
	ctx := context.Background()
	query := `
		SELECT id, area, created_at, organization_id
		FROM inspection_templates
		WHERE id = $1
	`
	row := is.pool.QueryRow(ctx, query, id)

	var template InspectionTemplate
	err := row.Scan(&template.ID, &template.Area, &template.CreatedAt, &template.OrganizationID)
	if err != nil {
		return nil, err
	}

	return &template, nil
}

func (is *Store) Delete(id string) error {
	ctx := context.Background()
	query := `
		DELETE FROM inspection_templates
		WHERE id = $1
	`

	_, err := is.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (is *Store) GetAll(organizationID string) ([]InspectionTemplate, error) {
	ctx := context.Background()

	query := `
		SELECT id, area, created_at, organization_id
		FROM inspection_templates
		WHERE organization_id = $1
	`

	rows, err := is.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	templates := make([]InspectionTemplate, 0)
	for rows.Next() {
		var template InspectionTemplate
		err := rows.Scan(&template.ID, &template.Area, &template.CreatedAt, &template.OrganizationID)
		if err != nil {
			return nil, err
		}
		templates = append(templates, template)
	}

	return templates, nil
}
