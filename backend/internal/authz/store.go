package authz

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/user"
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

func (s *Authz) CheckPermission(userID, resource, permission string) (bool, error) {
	ctx := context.Background()

	roleIDs, err := s.GetRoleIDsForUser(userID)
	if err != nil {
		fmt.Println(err)
		return false, err
	}
	fmt.Println(userID, roleIDs)
	sqlQuery := `
	SELECT EXISTS (
		SELECT 1
		FROM permissions 
		WHERE (identifier = $1 OR identifier = ANY($2)) AND resource = $3 AND (permission = $4 OR permission = 'all')
		LIMIT 1
	)
	`

	var hasPermission bool
	err = s.dbpool.QueryRow(ctx, sqlQuery, userID, roleIDs, resource, permission).Scan(&hasPermission)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	return hasPermission, nil
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
		WHERE $1 = ANY(user_ids)
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

func (s *Authz) CheckJobPermission(r *http.Request, jobId, resource, permission string) (string, error) {
	ctx := context.Background()
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return "", nil
	}

	// Check Permissions
	ok, err := s.CheckPermission(user.ID, resource, permission)
	if ok {
		return "private", nil
	}

	// Check job relation for public access to public events
	sqlJobQuery := `
		SELECT EXISTS (
			SELECT 1
			FROM jobs
			WHERE tenant_identifier = $1 AND id = $2
			LIMIT 1
		)
	`

	var hasJobRelation bool
	err = s.dbpool.QueryRow(ctx, sqlJobQuery, user.ID, jobId).Scan(&hasJobRelation)
	if err != nil || !hasJobRelation {
		fmt.Println(err)
		return "", err
	}
	return "public", nil
}
