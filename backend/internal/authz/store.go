package authz

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Role struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UserIDs     []string  `json:"userIds"`
	CreatedAt   time.Time `json:"createdAt"`
	// Add more fields as needed
}

type Authz struct {
	dbpool *pgxpool.Pool
}

func NewAuthz(dbpool *pgxpool.Pool) *Authz {
	return &Authz{
		dbpool: dbpool,
	}
}

func (s *Authz) CheckPermission(identifier, resource, permission string) (bool, error) {
	ctx := context.Background()

	sqlQuery := fmt.Sprintf(`
		SELECT %s 
		FROM permissions 
		WHERE (identifier = $1 OR $1 = ANY(userIds)) AND resource = $2
		LIMIT 1
	`, permission)

	row := s.dbpool.QueryRow(ctx, sqlQuery, identifier, resource)

	var hasPermission bool
	err := row.Scan(&hasPermission)
	if err != nil {
		return false, err
	}

	if hasPermission {
		return true, nil
	}

	roleIDs, err := s.GetRoleIDsForUser(identifier)
	if err != nil {
		return false, err
	}

	for _, roleID := range roleIDs {
		if hasRole, err := s.CheckRolePermission(roleID, resource, permission); err != nil {
			return false, err
		} else if hasRole {
			return true, nil
		}
	}

	return false, nil
}

func (s *Authz) CheckRolePermission(roleID, resource, permission string) (bool, error) {
	ctx := context.Background()

	sqlQuery := fmt.Sprintf(`
		SELECT %s 
		FROM permissions 
		WHERE identifier = $1 AND resource = $2
		LIMIT 1
	`, permission)

	row := s.dbpool.QueryRow(ctx, sqlQuery, roleID, resource)

	var hasPermission bool
	err := row.Scan(&hasPermission)
	if err != nil {
		return false, err
	}

	return hasPermission, nil
}

func (s *Authz) GetRoleIDsForUser(userID string) ([]string, error) {
	ctx := context.Background()

	sqlQuery := `
		SELECT id
		FROM roles
		WHERE $1 = ANY(userIds)
	`

	rows, err := s.dbpool.Query(ctx, sqlQuery, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roleIDs []string
	for rows.Next() {
		var roleID string
		err := rows.Scan(&roleID)
		if err != nil {
			return nil, err
		}
		roleIDs = append(roleIDs, roleID)
	}

	return roleIDs, nil
}
