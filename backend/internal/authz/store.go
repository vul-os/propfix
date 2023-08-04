package authz

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/role"
	"google.golang.org/api/iterator"
)

// Authz represents the interface for managing permissions in BigQuery.
type Authz struct {
	client *bigquery.Client
}

// NewAuthz creates a new instance of the Authz.
func NewAuthz(client *bigquery.Client) *Authz {
	return &Authz{
		client: client,
	}
}

// CheckPermission checks if the user or role associated with the given identifier (userID or roleID) has the required permission for the specified resource.
func (s *Authz) CheckPermission(identifier, resource, permission string) (bool, error) {
	ctx := context.Background()

	// Create the SQL query to check if the user or role has the required permission
	sqlQuery := fmt.Sprintf(`
		SELECT %s 
		FROM main.permissions 
		WHERE (identifier = @identifier OR @identifier IN UNNEST(userIds)) AND resource = @resource
		LIMIT 1
	`, permission)

	q := s.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "identifier", Value: identifier},
		{Name: "resource", Value: resource},
	}

	it, err := q.Read(ctx)
	if err != nil {
		return false, err
	}

	var hasPermission bool
	err = it.Next(&hasPermission)
	if err != nil && err != iterator.Done {
		return false, err
	}

	// If user/role has the required permission, return true
	if hasPermission {
		return true, nil
	}

	// If the user/role does not have the required permission, check if the role has it
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

	// Neither user nor role have the required permission
	return false, nil
}

// CheckRolePermission checks if the role associated with the given roleID has the required permission for the specified resource.
func (s *Authz) CheckRolePermission(roleID, resource, permission string) (bool, error) {
	ctx := context.Background()

	// Create the SQL query to check if the role has the required permission
	sqlQuery := fmt.Sprintf(`
		SELECT %s 
		FROM main.permissions 
		WHERE identifier = @roleID AND resource = @resource
		LIMIT 1
	`, permission)

	q := s.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "roleID", Value: roleID},
		{Name: "resource", Value: resource},
	}

	it, err := q.Read(ctx)
	if err != nil {
		return false, err
	}

	var hasPermission bool
	err = it.Next(&hasPermission)
	if err != nil && err != iterator.Done {
		return false, err
	}

	// Return true if the role has the required permission
	return hasPermission, nil
}

// GetRoleIDsForUser gets all the roleIDs associated with a user.
func (s *Authz) GetRoleIDsForUser(userID string) ([]string, error) {
	ctx := context.Background()

	sqlQuery := `
		SELECT id
		FROM main.roles
		WHERE @userID IN UNNEST(userIds)
	`

	q := s.client.Query(sqlQuery)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "userID", Value: userID},
	}

	it, err := q.Read(ctx)
	if err != nil {
		return nil, err
	}

	var roleIDs []string
	var role role.Role
	for {
		err := it.Next(&role)
		if err == iterator.Done {
			break
		} else if err != nil {
			return nil, err
		}

		roleIDs = append(roleIDs, role.ID)
	}

	return roleIDs, nil
}
