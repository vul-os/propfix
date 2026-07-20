package attachments

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"cloud.google.com/go/storage"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/go-chi/chi"
	"github.com/google/uuid" // Import the UUID package
)

type FileUploadHandler struct {
	bucket      *storage.BucketHandle
	eventsStore *events.Store
}

type UploadResponse struct {
	SignedURL  string `json:"signedUrl"`
	ObjectName string `json:"objectName"`
}

func NewFileUploadHandler(bucket *storage.BucketHandle, eventsStore *events.Store) (*FileUploadHandler, error) {
	return &FileUploadHandler{
		bucket:      bucket,
		eventsStore: eventsStore,
	}, nil
}

func (h *FileUploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobid")

	// Check if jobID is null or undefined and generate a UUID if needed
	if jobID == "" || jobID == "tennant" {
		newUUID, err := uuid.NewRandom()
		if err != nil {
			http.Error(w, "Failed to generate UUID", http.StatusInternalServerError)
			return
		}
		jobID = newUUID.String()
	}

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
		fmt.Println(err)
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// Create the response struct
	response := UploadResponse{
		SignedURL:  signedURL,
		ObjectName: objectName,
	}

	// Marshal the response struct into JSON
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
		return
	}

	// Set response headers and write the JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonResponse)
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
		fmt.Println(err)
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	// Create the response struct
	response := UploadResponse{
		SignedURL:  signedURL,
		ObjectName: objectName,
	}

	// Marshal the response struct into JSON
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
		return
	}

	// Set response headers and write the JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
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
