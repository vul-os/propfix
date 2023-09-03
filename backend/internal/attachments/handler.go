package attachments

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"cloud.google.com/go/storage"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/go-chi/chi"
)

type FileUploadHandler struct {
	bucket      *storage.BucketHandle
	eventsStore *events.EventsStore
}

func NewFileUploadHandler(bucket *storage.BucketHandle, eventsStore *events.EventsStore) (*FileUploadHandler, error) {
	return &FileUploadHandler{
		bucket:      bucket,
		eventsStore: eventsStore,
	}, nil
}

func (h *FileUploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobid")
	fmt.Println(jobID)

	// Parse the file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to read file from request", http.StatusBadRequest)
		return
	}
	defer file.Close()
	fmt.Println(jobID, header.Filename)
	// Create a new object in the bucket with the desired filename
	objectName := fmt.Sprintf("%s/%s", jobID, header.Filename)
	obj := h.bucket.Object(objectName)
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
	opts := &storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  "GET",
		Expires: time.Now().Add(15 * time.Minute),
	}
	signedURL, err := h.bucket.SignedURL(objectName, opts)
	if err != nil {
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// Return the signed URL in the response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, signedURL)
}

func (h *FileUploadHandler) GetFile(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobid")
	filename := chi.URLParam(r, "filename")

	// Construct the object path in the bucket
	objectName := fmt.Sprintf("%s/%s", jobID, filename)

	// Generate a signed URL for accessing the file
	opts := &storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  "GET",
		Expires: time.Now().Add(15 * time.Minute),
	}
	signedURL, err := h.bucket.SignedURL(objectName, opts)
	if err != nil {
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// Return the signed URL in the response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(signedURL))
}

func (h *FileUploadHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobid")
	filename := chi.URLParam(r, "filename")

	// Construct the object path in the bucket
	objectName := fmt.Sprintf("%s/%s", jobID, filename)

	// Delete the file from the bucket
	if err := h.bucket.Object(objectName).Delete(r.Context()); err != nil {
		http.Error(w, "Failed to delete file from Cloud Storage", http.StatusInternalServerError)
		return
	}

	// Return success status in the response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "File deleted successfully!")
}
