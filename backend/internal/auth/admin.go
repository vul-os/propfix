package auth

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	user "github.com/exolutionza/propfix-backend-go/internal/user"
)

// FirebaseAdmin provides functions to interact with the Firebase Admin SDK.
type FirebaseAdmin struct {
	app    *firebase.App
	client *auth.Client
}

// NewFirebaseAdmin creates a new FirebaseAdmin instance with the given Firebase options and authClient pointer.
func NewFirebaseAdmin(app *firebase.App, authClient *auth.Client) (*FirebaseAdmin, error) {
	return &FirebaseAdmin{
		app:    app,
		client: authClient,
	}, nil
}

// GetUserFromToken extracts user details from the given ID token using the authClient.
func (fa *FirebaseAdmin) GetUserFromToken(ctx context.Context, token string) (*user.User, error) {
	// Verify the ID token and get the user details.
	uid, err := fa.verifyIDToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("failed to verify ID token: %w", err)
	}

	usr, err := fa.client.GetUser(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details: %w", err)
	}

	return &user.User{
		ID:          usr.UID,
		DisplayName: usr.DisplayName,
		Email:       usr.Email,
		PhotoURL:    usr.PhotoURL,
	}, nil
}

// verifyIDToken verifies the provided ID token and returns the UID.
func (fa *FirebaseAdmin) verifyIDToken(ctx context.Context, token string) (string, error) {
	authToken, err := fa.client.VerifyIDToken(ctx, token)
	if err != nil {
		return "", fmt.Errorf("failed to verify ID token: %w", err)
	}

	return authToken.UID, nil
}
