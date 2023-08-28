package utils

import (
	"fmt"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

func CheckPermissionAndOrgs(r *http.Request, authz *authz.Authz, resource string, permission string, orgID string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return false, nil
	}

	hasPermission, err := authz.CheckPermission(user.ID, resource, permission)
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
	if !ContainsString(user.OrganizationIds, orgID) {
		return false, nil
	}

	return true, nil
}

func CheckPermission(r *http.Request, authz *authz.Authz, resource string, permission string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return false, nil
	}

	hasPermission, err := authz.CheckPermission(user.ID, resource, permission)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	if !hasPermission {
		return false, nil
	}

	return true, nil
}
