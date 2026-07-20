package auth

import (
	"context"
	"fmt"
	"net/http"

	"firebase.google.com/go/v4/auth"
	"github.com/exolutionza/propfix-backend-go/internal/organizations"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

// Claims represents the claims from the ID token.
type Claims map[string]interface{}

// IsAuthenticated is a middleware that checks if the request is authenticated with a valid Firebase ID token.
func IsAuthenticated(authClient *auth.Client, orgStore organizations.OrganizationStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			idToken := r.Header.Get("Authorization")
			if idToken == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			token, err := authClient.VerifyIDToken(context.Background(), idToken)
			if err != nil {
				fmt.Println(err)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			claims := make(Claims)
			fmt.Println(token)

			for k, v := range token.Claims {
				claims[k] = v
			}
			user := user.User{}
			if uid, ok := claims["user_id"].(string); ok {
				user.ID = uid
			} else if uid, ok := claims["uid"].(string); ok {
				user.ID = uid
			} else {
				user.ID = token.UID
			}

			if name, ok := claims["name"].(string); ok {
				user.DisplayName = name
			}

			if email, ok := claims["email"].(string); ok {
				user.Email = email
			}

			if picture, ok := claims["picture"].(string); ok {
				user.PhotoURL = picture
			}

			// Get user's organization IDs using the orgStore
			orgIDs, err := orgStore.GetOrganizationIDsForUser(user.ID)
			if err != nil {
				fmt.Println("Error getting user's organization IDs:", err)
				http.Error(w, "Failed to get user details", http.StatusInternalServerError)
				return
			}
			user.OrganizationIds = orgIDs

			ctx := context.WithValue(r.Context(), "user", user)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
