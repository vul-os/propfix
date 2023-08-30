package attachments

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/storage"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/google/uuid"
)

type adaptor struct {
	authz  *authz.Authz
	bucket *storage.BucketHandle
	store  *events.EventsStore
}

func New(
	authz *authz.Authz,
	eventsStore *events.EventsStore,
	bucket *storage.BucketHandle,
) *adaptor {
	return &adaptor{
		authz:  authz,
		store:  eventsStore,
		bucket: bucket,
	}
}

const Name = "Attachments"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type UploadFileRequest struct {
	JobID string `json:"jobid"`
	File  []byte `json:"file"`
}

type UploadFileResponse struct {
	SignedURL string `json:"signedURL"`
}

func (a *adaptor) UploadFile(r *http.Request, args *UploadFileRequest, reply *UploadFileResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.JobID, "file", "upload")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	objectName := fmt.Sprintf("%s/%s", args.JobID, uuid.New().String()) // Generate a unique filename

	obj := a.bucket.Object(objectName)
	wc := obj.NewWriter(context.Background())

	if _, err := wc.Write(args.File); err != nil {
		return fmt.Errorf("failed to write file to Cloud Storage: %v", err)
	}
	if err := wc.Close(); err != nil {
		return fmt.Errorf("failed to close Cloud Storage writer: %v", err)
	}

	opts := storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  http.MethodGet,
		Expires: time.Now().Add(15 * time.Minute),
	}

	signedURL, err := a.bucket.SignedURL(objectName, &opts)
	if err != nil {
		return fmt.Errorf("failed to generate signed URL: %v", err)
	}

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return nil
	}

	event := events.Event{
		ID:         uuid.New().String(),
		Type:       "file_upload",
		JobID:      args.JobID,
		Data:       objectName, // Store the object name for reference
		CreatedAt:  time.Now(),
		Visibility: "private", // Assuming accessType is private for all
	}
	_, err = a.store.CreateEvent(event, "private", user.ID)
	if err != nil {
		log.Printf("Failed to create event for file upload: %v", err)
	}

	reply.SignedURL = signedURL
	return nil
}

type GetFileRequest struct {
	JobID    string `json:"jobid"`
	FileName string `json:"filename"`
}

type GetFileResponse struct {
	SignedURL string `json:"signedURL"`
}

func (a *adaptor) GetFile(r *http.Request, args *GetFileRequest, reply *GetFileResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.JobID, "file", "get")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	objectName := fmt.Sprintf("%s/%s", args.JobID, args.FileName)

	opts := storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  http.MethodGet,
		Expires: time.Now().Add(15 * time.Minute),
	}

	signedURL, err := a.bucket.SignedURL(objectName, &opts)
	if err != nil {
		return fmt.Errorf("failed to generate signed URL: %v", err)
	}

	reply.SignedURL = signedURL
	return nil
}

type DeleteFileRequest struct {
	JobID    string `json:"jobid"`
	FileName string `json:"filename"`
}

type DeleteFileResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteFile(r *http.Request, args *DeleteFileRequest, reply *DeleteFileResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.JobID, "events", "delete")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	objectName := fmt.Sprintf("%s/%s", args.JobID, args.FileName)

	if err := a.bucket.Object(objectName).Delete(r.Context()); err != nil {
		return fmt.Errorf("failed to delete file from Cloud Storage: %v", err)
	}

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return nil
	}

	event := events.Event{
		ID:        uuid.New().String(),
		Type:      "file_deletion",
		JobID:     args.JobID,
		Data:      args.FileName,
		CreatedAt: time.Now(),
	}
	_, err = a.store.CreateEvent(event, "private", user.ID)
	if err != nil {
		log.Printf("Failed to create event for file deletion: %v", err)
	}

	reply.Success = true
	return nil
}
