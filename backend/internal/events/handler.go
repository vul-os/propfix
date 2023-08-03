package events

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

type EventsHandler struct {
	store *EventsStore
}

func NewEventsHandler(store *EventsStore) *EventsHandler {
	return &EventsHandler{
		store: store,
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

	json.NewEncoder(w).Encode(event)
}

func (h *EventsHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
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

	err := h.store.DeleteEvent(eventID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete event: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EventsHandler) DeleteAllEventsForJobID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["jobId"]

	err := h.store.DeleteAllEventsForJobID(jobID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete events for job: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
