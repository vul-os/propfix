package authz

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"google.golang.org/api/iterator"
)

type Role struct {
	ID          string    `json:"id" bigquery:"id"`
	Name        string    `json:"name" bigquery:"name"`
	Description string    `json:"description" bigquery:"description"`
	UserIDs     []string  `json:"userIds" bigquery:"user_ids"`
	CreatedAt   time.Time `json:"createdAt" bigquery:"created_at"`
	// Add more fields as needed
}

type Authz struct {
	Client *bigquery.Client
}

func NewAuthz(client *bigquery.Client) *Authz {
	return &Authz{
		Client: client,
	}
}

func (s *Authz) CheckRolePermission(roleID, resource, permission string) (bool, error) {
	ctx := context.Background()

	sqlQuery := fmt.Sprintf(`
        SELECT %s 
        FROM permissions 
        WHERE identifier = @roleID AND resource = @resource
        LIMIT 1
    `, permission)

	query := s.Client.Query(sqlQuery)
	query.Parameters = []bigquery.QueryParameter{
		{
			Name:  "roleID",
			Value: roleID,
		},
		{
			Name:  "resource",
			Value: resource,
		},
	}

	var hasPermission bool
	it, err := query.Read(ctx)
	if err != nil {
		return false, err
	}

	for {
		var result struct {
			Permission bool `bigquery:"exists"`
		}
		err := it.Next(&result)
		if err == iterator.Done {
			break
		} else if err != nil {
			return false, err
		}
		hasPermission = result.Permission
	}

	return hasPermission, nil
}

func (s *Authz) GetRoleIDsForUser(userID string) ([]string, error) {
	ctx := context.Background()

	sqlQuery := `
        SELECT id
        FROM main.Roles
        WHERE @userID IN UNNEST(user_ids)
    `

	query := s.Client.Query(sqlQuery)
	query.Parameters = []bigquery.QueryParameter{
		{
			Name:  "userID",
			Value: userID,
		},
	}

	it, err := query.Read(ctx)
	if err != nil {
		return nil, err
	}

	var roleIDs []string
	var roleID string
	for {
		err := it.Next(&roleID)
		if err == iterator.Done {
			break
		} else if err != nil {
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

	sqlQuery := `
        SELECT EXISTS (
            SELECT 1
            FROM jobs
            WHERE (tenant_identifier = @userID AND id = @jobID)
                OR (id = @jobID AND organization_id IN UNNEST(@organizationIds))
            LIMIT 1
        )
    `

	query := s.Client.Query(sqlQuery)
	query.Parameters = []bigquery.QueryParameter{
		{
			Name:  "userID",
			Value: user.ID,
		},
		{
			Name:  "jobID",
			Value: jobId,
		},
		{
			Name:  "organizationIds",
			Value: user.OrganizationIds,
		},
	}

	var hasPermission bool
	it, err := query.Read(ctx)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	for {
		var result struct {
			Permission bool `bigquery:"exists"`
		}
		err := it.Next(&result)
		if err == iterator.Done {
			break
		} else if err != nil {
			return "", err
		}
		hasPermission = result.Permission
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
        WHERE (identifier = @userID OR identifier IN UNNEST(@roleIDs)) 
              AND resource = @resource 
              AND (permission = @permission OR permission = 'all')
        LIMIT 1
    )
    `

	query := s.Client.Query(sqlQuery)
	query.Parameters = []bigquery.QueryParameter{
		{
			Name:  "userID",
			Value: user.ID,
		},
		{
			Name:  "roleIDs",
			Value: roleIDs,
		},
		{
			Name:  "resource",
			Value: resource,
		},
		{
			Name:  "permission",
			Value: permission,
		},
	}

	var hasPermission bool
	it, err := query.Read(ctx)
	if err != nil {
		fmt.Println("here", err)
		return false, err
	}

	for {
		var result interface{}
		fmt.Println("here2", &result)

		err := it.Next(&result)
		if err == iterator.Done {
			fmt.Println("here2", result)

			break
		} else if err != nil {
			fmt.Println("here2", result)

			fmt.Println("here2", err)
			return false, err
		}
		// hasPermission = result.Permission
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
