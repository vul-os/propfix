package auth

import (
	"context"
	"fmt"

	"github.com/exolutionza/propfix-backend-go/internal/user"

	"firebase.google.com/go/v4/auth"
)

// GetUserFromId extracts user details from the given user ID.
func GetUserFromId(ctx context.Context, userId string, authClient *auth.Client) (*user.User, error) {
	// Fetch the user details from Firebase Auth.
	u, err := authClient.GetUser(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details from Firebase: %w", err)
	}

	return &user.User{
		ID:          u.UID,
		DisplayName: u.DisplayName,
		Email:       u.Email,
		PhotoURL:    u.PhotoURL,
	}, nil
}

// GetUsersFromIDs fetches user details from Firebase for the given list of user IDs.
func GetUsersFromIDs(ctx context.Context, userIDs []string, authClient *auth.Client) ([]*user.User, error) {
	var users []*user.User

	for _, userID := range userIDs {
		u, err := GetUserFromId(ctx, userID, authClient)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, nil
}
