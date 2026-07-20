package permissions

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Store struct {
	dbpool *pgxpool.Pool
}

func NewPermissionStore(dbpool *pgxpool.Pool) *Store {
	return &Store{
		dbpool: dbpool,
	}
}

func (s *Store) CreatePermission(permission *Permission) (string, error) {
	permissionID := uuid.New().String()

	ctx := context.Background()
	query := `
        INSERT INTO permissions (id, resource, permission, identifier, created_at)
        VALUES ($1, $2, $3, $4, $5)
    `

	_, err := s.dbpool.Exec(ctx, query, permissionID, permission.Resource, permission.Permission, permission.Identifier, time.Now())
	if err != nil {
		return "", err
	}

	return permissionID, nil
}

func (s *Store) DeletePermission(permissionID string) error {
	ctx := context.Background()
	query := `
        DELETE FROM permissions
        WHERE id = $1
    `

	_, err := s.dbpool.Exec(ctx, query, permissionID)
	if err != nil {
		return err
	}

	return nil
}

func (s *Store) GetPermissionByID(permissionID string) (*Permission, error) {
	ctx := context.Background()
	query := `
        SELECT id, resource, permission, identifier, created_at
        FROM permissions
        WHERE id = $1
    `
	row := s.dbpool.QueryRow(ctx, query, permissionID)

	var permission Permission
	err := row.Scan(&permission.ID, &permission.Resource, &permission.Permission, &permission.Identifier, &permission.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &permission, nil
}

func (s *Store) UpdatePermission(permission *Permission) error {
	ctx := context.Background()
	query := `
        UPDATE permissions
        SET resource = $2, permission = $3, identifier = $4
        WHERE id = $1
    `

	_, err := s.dbpool.Exec(ctx, query, permission.ID, permission.Resource, permission.Permission, permission.Identifier)
	if err != nil {
		return err
	}

	return nil
}
