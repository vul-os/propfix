package auth

import (
	"context"
	"fmt"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/user"

	"firebase.google.com/go/v4/auth"
)

// Claims represents the claims from the ID token.
type Claims map[string]interface{}

// IsAuthenticated is a middleware that checks if the request is authenticated with a valid Firebase ID token.
func IsAuthenticated(authClient *auth.Client) func(http.Handler) http.Handler {
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
			for k, v := range token.Claims {
				claims[k] = v
			}

			user := user.User{
				ID:          token.UID,
				DisplayName: claims["name"].(string),
				Email:       claims["email"].(string),
				PhotoURL:    claims["picture"].(string),
			}

			ctx := context.WithValue(r.Context(), "user", user)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
