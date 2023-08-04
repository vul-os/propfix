package events

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

type EventsStore struct {
	client *bigquery.Client
}

func NewEventsStore(client *bigquery.Client) *EventsStore {
	return &EventsStore{
		client: client,
	}
}

type Event struct {
	ID        string    `bigquery:"id" json:"id"`
	Type      string    `bigquery:"type" json:"type"`
	JobID     string    `bigquery:"jobId" json:"jobId"`
	MemberID  string    `bigquery:"memberId" json:"memberId"`
	Data      string    `bigquery:"data" json:"data"`
	CreatedAt time.Time `bigquery:"createdAt" json:"createdAt"`
}

func (s *EventsStore) CreateEvent(event Event) (string, error) {
	// Perform basic validation on the event data before insertion
	if event.Type == "" || event.Data == "" || event.JobID == "" || event.MemberID == "" {
		return "", fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	// Generate a UUID and set it as the ID field
	event.ID = uuid.New().String()
	event.CreatedAt = time.Now()

	ctx := context.Background()
	q := s.client.Query(fmt.Sprintf(`
		INSERT INTO main.events (id, type, jobId, memberId, data, createdAt)
		VALUES (@id, @type, @jobId, @memberId, @data, @createdAt)
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "id", Value: event.ID},
		{Name: "type", Value: event.Type},
		{Name: "jobId", Value: event.JobID},
		{Name: "memberId", Value: event.MemberID},
		{Name: "data", Value: event.Data},
		{Name: "createdAt", Value: event.CreatedAt},
	}

	_, err := q.Run(ctx)
	if err != nil {
		return "", fmt.Errorf("Failed to create event: %v", err)
	}

	return event.ID, nil
}

func (s *EventsStore) GetEvent(eventID string) (*Event, error) {
	ctx := context.Background()
	q := s.client.Query(fmt.Sprintf(`
		SELECT id, type, jobId, memberId, data, createdAt
		FROM main.events
		WHERE id = @eventID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "eventID", Value: eventID}}

	it, err := q.Read(ctx)
	if err != nil {
		return nil, fmt.Errorf("Event not found")
	}

	var event Event
	err = it.Next(&event)
	if err == iterator.Done {
		return nil, fmt.Errorf("Event not found")
	} else if err != nil {
		return nil, fmt.Errorf("Failed to read event data: %v", err)
	}

	return &event, nil
}

func (s *EventsStore) UpdateEvent(event Event) error {
	// Perform basic validation on the event data before update
	if event.Type == "" || event.Data == "" || event.JobID == "" || event.MemberID == "" {
		return fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	event.CreatedAt = time.Now()

	ctx := context.Background()
	q := s.client.Query(fmt.Sprintf(`
		UPDATE main.events
		SET type = @type, jobId = @jobId, memberId = @memberId, data = @data, createdAt = @createdAt
		WHERE id = @eventID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "eventID", Value: event.ID},
		{Name: "type", Value: event.Type},
		{Name: "jobId", Value: event.JobID},
		{Name: "memberId", Value: event.MemberID},
		{Name: "data", Value: event.Data},
		{Name: "createdAt", Value: event.CreatedAt},
	}

	_, err := q.Run(ctx)
	if err != nil {
		return fmt.Errorf("Failed to update event: %v", err)
	}

	return nil
}

func (s *EventsStore) DeleteEvent(eventID string) error {
	ctx := context.Background()
	q := s.client.Query(fmt.Sprintf(`
		DELETE FROM main.events
		WHERE id = @eventID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "eventID", Value: eventID}}

	_, err := q.Run(ctx)
	if err != nil {
		return fmt.Errorf("Failed to delete event: %v", err)
	}

	return nil
}

func (s *EventsStore) DeleteAllEventsForJobID(jobID string) error {
	ctx := context.Background()
	q := s.client.Query(fmt.Sprintf(`
		DELETE FROM main.events
		WHERE jobId = @jobID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "jobID", Value: jobID}}

	_, err := q.Run(ctx)
	if err != nil {
		return fmt.Errorf("Failed to delete events for job: %v", err)
	}

	return nil
}
