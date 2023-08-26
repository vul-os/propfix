package attachments

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"cloud.google.com/go/storage"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/gorilla/mux"
)

type FileUploadHandler struct {
	client      *storage.Client
	bucketName  string
	eventsStore *events.EventsStore
}

func NewFileUploadHandler(bucketName string, eventsStore *events.EventsStore) (*FileUploadHandler, error) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}

	return &FileUploadHandler{
		client:      client,
		bucketName:  bucketName,
		eventsStore: eventsStore,
	}, nil
}

func (h *FileUploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["jobid"]

	// Parse the file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to read file from request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create a new object in the bucket with the desired filename
	objectName := fmt.Sprintf("%s/%s", jobID, header.Filename)
	obj := h.client.Bucket(h.bucketName).Object(objectName)
	wc := obj.NewWriter(context.Background())

	// Copy the file data to the object in Cloud Storage
	if _, err := io.Copy(wc, file); err != nil {
		http.Error(w, "Failed to upload file to Cloud Storage", http.StatusInternalServerError)
		return
	}
	if err := wc.Close(); err != nil {
		http.Error(w, "Failed to close Cloud Storage writer", http.StatusInternalServerError)
		return
	}

	// Generate a signed URL for the uploaded file
	signedURL, err := h.GenerateV4GetObjectSignedURL(h.bucketName, objectName)
	if err != nil {
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// // Create an event for file upload
	// event := events.Event{
	// 	ID:        uuid.New().String(),
	// 	Type:      "file_upload",
	// 	JobID:     jobID,
	// 	Data:      header.Filename,
	// 	CreatedAt: time.Now(),
	// }
	// _, err = h.eventsStore.CreateEvent(event)
	// if err != nil {
	// 	log.Printf("Failed to create event for file upload: %v", err)
	// }

	// Return the signed URL in the response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, signedURL)
}

func (h *FileUploadHandler) GetFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["jobid"]
	filename := vars["filename"]

	// Construct the object path in the bucket
	objectName := fmt.Sprintf("%s/%s", jobID, filename)

	// Generate a signed URL for accessing the file
	signedURL, err := h.GenerateV4GetObjectSignedURL(h.bucketName, objectName)
	if err != nil {
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// Return the signed URL in the response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(signedURL))
}

// GenerateV4GetObjectSignedURL generates object signed URL with GET method.
func (h *FileUploadHandler) GenerateV4GetObjectSignedURL(bucket, object string) (string, error) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("storage.NewClient: %w", err)
	}
	defer client.Close()

	opts := &storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  "GET",
		Expires: time.Now().Add(15 * time.Minute),
	}

	u, err := client.Bucket(bucket).SignedURL(object, opts)
	if err != nil {
		return "", fmt.Errorf("Bucket(%q).SignedURL: %w", bucket, err)
	}

	return u, nil
}

func (h *FileUploadHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["jobid"]
	filename := vars["filename"]

	// Construct the object path in the bucket
	objectName := fmt.Sprintf("%s/%s", jobID, filename)

	// Delete the file from the bucket
	if err := h.client.Bucket(h.bucketName).Object(objectName).Delete(r.Context()); err != nil {
		http.Error(w, "Failed to delete file from Cloud Storage", http.StatusInternalServerError)
		return
	}

	// // Create an event for file deletion
	// event := events.Event{
	// 	ID:        uuid.New().String(),
	// 	Type:      "file_deletion",
	// 	JobID:     jobID,
	// 	Data:      filename,
	// 	CreatedAt: time.Now(),
	// }
	// _, err := h.eventsStore.CreateEvent(event)
	// if err != nil {
	// 	log.Printf("Failed to create event for file deletion: %v", err)
	// }

	// Return success status in the response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "File deleted successfully!")
}
