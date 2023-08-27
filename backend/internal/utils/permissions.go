package utils

import (
	"fmt"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

func CheckPermissionAndExecute(w http.ResponseWriter, r *http.Request, authz *authz.Authz, resource string, permission string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return false, nil
	}

	hasPermission, err := authz.CheckPermission(user.ID, resource, permission)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return false, err
	}

	if !hasPermission {
		http.Error(w, fmt.Sprintf("You do not have permission to %s -> %s", resource, permission), http.StatusForbidden)
		return false, nil
	}

	return true, nil
}

func CheckPermissionAndOrgs(w http.ResponseWriter, r *http.Request, authz *authz.Authz, resource string, permission string, orgID string) (bool, error) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return false, nil
	}

	hasPermission, err := authz.CheckPermission(user.ID, resource, permission)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return false, err
	}

	if !hasPermission {
		http.Error(w, fmt.Sprintf("You do not have permission to %s -> %s", resource, permission), http.StatusForbidden)
		return false, nil
	}

	if user.OrganizationIds == nil {
		http.Error(w, "User's organization IDs cannot be empty", http.StatusBadRequest)
		return false, nil
	}

	// Check if the provided organization ID is not blank
	if orgID == "" {
		http.Error(w, "Organization ID cannot be blank", http.StatusBadRequest)
		return false, nil
	}

	// Check if the provided organization ID is within the user's allowed organization IDs
	if !ContainsString(user.OrganizationIds, orgID) {
		http.Error(w, "You do not have permission to perform this action for this organization", http.StatusForbidden)
		return false, nil
	}

	return true, nil
}
