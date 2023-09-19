package events

import (
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

type adaptor struct {
	store *Store
	authz *authz.Authz
}

const Name = "Events"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	authz *authz.Authz,
	store *Store,
) *adaptor {
	return &adaptor{
		store: store,
		authz: authz,
	}
}

type CreateEventRequest struct {
	Event Event `json:"event"`
}

type CreateEventResponse struct {
	Event Event `json:"event"`
}

func (a *adaptor) CreateEvent(r *http.Request, args *CreateEventRequest, result *CreateEventResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.Event.JobID, "events", "create")
	// if err != nil || accessType == "" {
	// 	return errors.New("not permitted")
	// }

	if args.Event.Visibility == "public" && accessType == "private" {
		accessType = "public"
	}
	user, ok := r.Context().Value("user").(user.User)
	if !ok || accessType == "" {
		return errors.New("not permitted")
	}

	toCreateEvent := args.Event
	toCreateEvent.Visibility = accessType

	eventID, createdAt, err := a.store.CreateEvent(toCreateEvent, user.ID)
	if err != nil {
		return fmt.Errorf("Failed to create event: %v", err)
	}

	newEvent := toCreateEvent
	newEvent.ID = eventID
	newEvent.CreatedAt = createdAt
	newEvent.MemberID = user.ID

	result.Event = newEvent
	return nil
}

type GetEventRequest struct {
	ID string `json:"id"`
}

type GetEventResponse struct {
	Event Event `json:"event"`
}

func (a *adaptor) GetEvent(r *http.Request, args *GetEventRequest, result *GetEventResponse) error {
	event, err := a.store.GetEvent(args.ID)
	if err != nil {
		return fmt.Errorf("Event not found: %v", err)
	}

	accessType, err := a.authz.CheckJobPermission(r, event.JobID, "events", "read")
	if err != nil || accessType == "" {
		return err
	}

	result.Event = *event
	return nil
}

type UpdateEventRequest struct {
	Event Event `json:"event"`
}

type UpdateEventResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) UpdateEvent(r *http.Request, args *UpdateEventRequest, result *UpdateEventResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.Event.JobID, "events", "update")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	err = a.store.UpdateEvent(args.Event)
	if err != nil {
		return fmt.Errorf("Failed to update event: %v", err)
	}

	result.ID = args.Event.ID
	return nil
}

type DeleteEventRequest struct {
	ID string `json:"id"`
}

type DeleteEventResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) DeleteEvent(r *http.Request, args *DeleteEventRequest, result *DeleteEventResponse) error {
	accessType, err := a.authz.CheckPermission(r, "events", "delete")
	if err != nil || !accessType {
		return errors.New("not permitted")
	}

	err = a.store.DeleteEvent(args.ID)
	if err != nil {
		return fmt.Errorf("Failed to delete event: %v", err)
	}

	result.ID = args.ID
	return nil
}

type GetAllEventsRequest struct {
	JobID string `json:"jobId"`
}

type GetAllEventsResponse struct {
	Events []Event `json:"events"`
}

func (a *adaptor) GetAllEvents(r *http.Request, args *GetAllEventsRequest, result *GetAllEventsResponse) error {
	accessType, err := a.authz.CheckJobPermission(r, args.JobID, "events", "readall")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	var events []Event
	events, err = a.store.GetAllEvents(args.JobID, accessType)
	if err != nil {
		return fmt.Errorf("Failed to get public events: %v", err)
	}
	result.Events = events
	return nil
}
