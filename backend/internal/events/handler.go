package events

import (
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/jackc/pgx/v4/pgxpool"
)

type adaptor struct {
	store *EventsStore
	authz *authz.Authz
}

const Name = "Events"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		store: NewEventsStore(dbpool),
		authz: authz,
	}
}

type CreateEventRequest struct {
	Event Event `json:"event"`
}

type CreateEventResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateEvent(r *http.Request, args *CreateEventRequest, result *CreateEventResponse) error {
	accessType, err := a.authz.CheckEventPermission(r, args.Event.JobID, "events", "create")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	if args.Event.Visibility == "public" && accessType == "private" {
		accessType = "public"
	}
	user, ok := r.Context().Value("user").(user.User)
	if !ok || accessType == "" {
		return errors.New("not permitted")
	}
	fmt.Println(accessType)
	eventID, err := a.store.CreateEvent(args.Event, accessType, user.ID)
	if err != nil {
		return fmt.Errorf("Failed to create event: %v", err)
	}

	result.ID = eventID
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

	accessType, err := a.authz.CheckEventPermission(r, event.JobID, "events", "read")
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
	accessType, err := a.authz.CheckEventPermission(r, args.Event.JobID, "events", "update")
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
	accessType, err := a.authz.CheckEventPermission(r, args.ID, "events", "delete")
	if err != nil || accessType == "" {
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
	accessType, err := a.authz.CheckEventPermission(r, args.JobID, "events", "readall")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	var events []Event
	events, err = a.store.GetAllEventsForJob(args.JobID, accessType)
	if err != nil {
		return fmt.Errorf("Failed to get public events: %v", err)
	}
	result.Events = events
	return nil
}
