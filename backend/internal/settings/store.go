package settings

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Setting struct {
	ID             string `json:"id"`
	Type           string `json:"type"`
	Data           string `json:"data"`
	OrganizationID string `json:"organizationId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewSettingsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (s *Store) CreateSetting(setting Setting) (string, error) {
	ctx := context.Background()
	settingID := uuid.New().String()
	query := `
        INSERT INTO settings (id, type, data, organization_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	err := s.pool.QueryRow(ctx, query, settingID, setting.Type, setting.Data, setting.OrganizationID).Scan(&settingID)
	if err != nil {
		fmt.Println(err)
		return "", errors.New("Failed to create setting")
	}

	return settingID, nil
}

func (s *Store) UpdateSetting(setting Setting) error {
	ctx := context.Background()
	query := `
        UPDATE settings
        SET type = $1, data = $2
        WHERE id = $3 AND organization_id = $4
    `

	_, err := s.pool.Exec(ctx, query, setting.Type, setting.Data, setting.ID, setting.OrganizationID)
	if err != nil {
		return errors.New("Failed to update setting")
	}

	return nil
}

func (s *Store) GetSetting(settingID, organizationID string) (Setting, error) {
	ctx := context.Background()
	query := `
        SELECT id, type, data, organization_id
        FROM settings
        WHERE id = $1 AND organization_id = $2
    `

	var setting Setting
	err := s.pool.QueryRow(ctx, query, settingID, organizationID).Scan(&setting.ID, &setting.Type, &setting.Data, &setting.OrganizationID)
	if err != nil {
		return Setting{}, errors.New("Setting not found")
	}

	return setting, nil
}

func (s *Store) DeleteSetting(settingID string) error {
	ctx := context.Background()
	query := `
        DELETE FROM settings
        WHERE id = $1
    `

	_, err := s.pool.Exec(ctx, query, settingID)
	if err != nil {
		return errors.New("Failed to delete setting")
	}

	return nil
}

func (s *Store) GetAllSettings(organizationID string) ([]Setting, error) {
	ctx := context.Background()
	query := `
        SELECT id, type, data, organization_id
        FROM settings
        WHERE organization_id = $1
    `

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := make([]Setting, 0)
	for rows.Next() {
		var setting Setting
		err := rows.Scan(&setting.ID, &setting.Type, &setting.Data, &setting.OrganizationID)
		if err != nil {
			return nil, err
		}
		settings = append(settings, setting)
	}

	return settings, nil
}
