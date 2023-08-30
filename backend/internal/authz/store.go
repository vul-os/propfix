package authz

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
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

	// Check Permissions and job relation for public access to public events
	sqlQuery := `
		SELECT EXISTS (
			SELECT 1
			FROM jobs
			WHERE (tenant_identifier = $1 AND id = $2)
				OR (id = $2 AND organization_id = ANY($3))
			LIMIT 1
		)
	`

	var hasPermission bool
	err := s.dbpool.QueryRow(ctx, sqlQuery, user.ID, jobId, user.OrganizationIds).Scan(&hasPermission)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	if hasPermission {
		return "private", nil
	}

	return "public", nil
}

func (s *Authz) CheckPermission(r *http.Request, resource string, permission string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return false, nil
	}

	ctx := context.Background()

	roleIDs, err := s.GetRoleIDsForUser(user.ID)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	sqlQuery := `
	SELECT EXISTS (
		SELECT 1
		FROM permissions 
		WHERE (identifier = $1 OR identifier = ANY($2)) AND resource = $3 AND (permission = $4 OR permission = 'all')
		LIMIT 1
	)
	`

	var hasPermission bool
	err = s.dbpool.QueryRow(ctx, sqlQuery, user.ID, roleIDs, resource, permission).Scan(&hasPermission)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	return hasPermission, nil
}

// TODO: move to authz store.go
func (s *Authz) CheckPermissionAndOrgs(r *http.Request, resource string, permission string, orgID string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return false, nil
	}

	hasPermission, err := s.CheckPermission(r, resource, permission)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	if !hasPermission {
		return false, nil
	}

	if user.OrganizationIds == nil {
		return false, nil
	}

	// Check if the provided organization ID is not blank
	if orgID == "" {
		return false, nil
	}

	// Check if the provided organization ID is within the user's allowed organization IDs
	if !utils.ContainsString(user.OrganizationIds, orgID) {
		return false, nil
	}

	return true, nil
}
