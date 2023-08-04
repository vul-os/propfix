package events

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/gorilla/mux"
)

type EventsHandler struct {
	store *EventsStore
	authz authz.Authz // Replace "Authorization" with the actual type of your authorization mechanism
}

func NewEventsHandler(store *EventsStore, authz authz.Authz) *EventsHandler {
	return &EventsHandler{
		store: store,
		authz: authz,
	}
}

func (h *EventsHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	eventID, err := h.store.CreateEvent(event)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create event: %v", err), http.StatusInternalServerError)
		return
	}

	// Create a response with the generated ID
	response := struct {
		ID string `json:"id"`
	}{
		ID: eventID,
	}

	// Encode the response to JSON and send it as the HTTP response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *EventsHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventID := vars["id"]

	event, err := h.store.GetEvent(eventID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Event not found: %v", err), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func (h *EventsHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	user, ok := r.Context().Value("user").(user.User) // Replace "user.User" with the actual user type from your authentication mechanism
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to update events
	if hasPermission, err := h.authz.CheckPermission(user.ID, "events", "update"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to update events", http.StatusForbidden)
		return
	}

	err = h.store.UpdateEvent(event)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update event: %v", err), http.StatusInternalServerError)
		return
	}
}

func (h *EventsHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventID := vars["id"]

	user, ok := r.Context().Value("user").(user.User) // Replace "user.User" with the actual user type from your authentication mechanism
	if !ok {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	// Check if the user has the permission to delete events
	if hasPermission, err := h.authz.CheckPermission(user.ID, "events", "delete"); err != nil {
		http.Error(w, "Failed to check permission", http.StatusInternalServerError)
		return
	} else if !hasPermission {
		http.Error(w, "You do not have permission to delete events", http.StatusForbidden)
		return
	}

	err := h.store.DeleteEvent(eventID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete event: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
