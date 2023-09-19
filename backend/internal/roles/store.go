package roles

import (
	"context"
	"errors"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Store struct {
	dbpool *pgxpool.Pool
}

func NewRoleStore(dbpool *pgxpool.Pool) *Store {
	return &Store{
		dbpool: dbpool,
	}
}

func (s *Store) CreateRole(role authz.Role) (string, error) {
	ctx := context.Background()
	roleID := uuid.New().String()
	query := `
		INSERT INTO roles (id, name, description, user_ids, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := s.dbpool.Exec(ctx, query, roleID, role.Name, role.Description, role.UserIDs, time.Now())
	if err != nil {
		return "", err
	}

	return roleID, nil
}

func (s *Store) DeleteRole(roleID string) error {
	ctx := context.Background()
	query := `
		DELETE FROM roles
		WHERE id = $1
	`
	res, err := s.dbpool.Exec(ctx, query, roleID)
	if err != nil {
		return err
	}

	rowsAffected := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("role not found")
	}

	return nil
}

func (s *Store) GetRoleByID(roleID string) (authz.Role, error) {
	ctx := context.Background()
	query := `
		SELECT id, name, description, user_ids, created_at
		FROM roles
		WHERE id = $1
	`
	row := s.dbpool.QueryRow(ctx, query, roleID)

	var role authz.Role
	err := row.Scan(&role.ID, &role.Name, &role.Description, &role.UserIDs, &role.CreatedAt)
	if err != nil {
		return authz.Role{}, err
	}

	return role, nil
}

func (s *Store) UpdateRole(role authz.Role) error {
	ctx := context.Background()
	query := `
		UPDATE roles
		SET name = $2, description = $3, user_ids = $4
		WHERE id = $1
	`
	res, err := s.dbpool.Exec(ctx, query, role.ID, role.Name, role.Description, role.UserIDs)
	if err != nil {
		return err
	}

	rowsAffected := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("role not found")
	}

	return nil
}

func (s *Store) AddMember(roleID, userID string) error {
	ctx := context.Background()
	query := `
		UPDATE roles
		SET user_ids = array_append(user_ids, $2)
		WHERE id = $1
	`
	res, err := s.dbpool.Exec(ctx, query, roleID, userID)
	if err != nil {
		return err
	}

	rowsAffected := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("role not found")
	}

	return nil
}

func (s *Store) RemoveMember(roleID, userID string) error {
	ctx := context.Background()
	query := `
		UPDATE roles
		SET user_ids = array_remove(user_ids, $2)
		WHERE id = $1
	`
	res, err := s.dbpool.Exec(ctx, query, roleID, userID)
	if err != nil {
		return err
	}

	rowsAffected := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("role not found")
	}

	return nil
}
