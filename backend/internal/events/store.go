package events

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type EventsStore struct {
	pool *pgxpool.Pool
}

func NewEventsStore(pool *pgxpool.Pool) *EventsStore {
	return &EventsStore{
		pool: pool,
	}
}

type Event struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	JobID     string          `json:"jobId"`
	MemberID  string          `json:"memberId"`
	Data      json.RawMessage `json:"data"`
	CreatedAt time.Time       `json:"createdAt"`
}

func (s *EventsStore) CreateEvent(event Event) (string, error) {
	// Perform basic validation on the event data before insertion
	if event.Type == "" || event.JobID == "" || event.MemberID == "" {
		return "", fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	// Generate a UUID and set it as the ID field
	event.ID = uuid.New().String()
	event.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO events (id, type, job_id, member_id, data, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := s.pool.Exec(ctx, query, event.ID, event.Type, event.JobID, event.MemberID, event.Data, event.CreatedAt)
	if err != nil {
		return "", fmt.Errorf("Failed to create event: %v", err)
	}

	return event.ID, nil
}

func (s *EventsStore) GetEvent(eventID string) (*Event, error) {
	ctx := context.Background()
	query := `
		SELECT id, type, job_id, member_id, data, created_at
		FROM events
		WHERE id = $1
	`

	var event Event
	err := s.pool.QueryRow(ctx, query, eventID).Scan(&event.ID, &event.Type, &event.JobID, &event.MemberID, &event.Data, &event.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("Event not found")
	}

	return &event, nil
}

func (s *EventsStore) UpdateEvent(event Event) error {
	// Perform basic validation on the event data before update
	if event.Type == "" || event.JobID == "" || event.MemberID == "" {
		return fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	event.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		UPDATE events
		SET type = $1, job_id = $2, member_id = $3, data = $4, created_at = $5
		WHERE id = $6
	`

	_, err := s.pool.Exec(ctx, query, event.Type, event.JobID, event.MemberID, event.Data, event.CreatedAt, event.ID)
	if err != nil {
		return fmt.Errorf("Failed to update event: %v", err)
	}

	return nil
}

func (s *EventsStore) DeleteEvent(eventID string) error {
	ctx := context.Background()
	query := `
		DELETE FROM events
		WHERE id = $1
	`

	_, err := s.pool.Exec(ctx, query, eventID)
	if err != nil {
		return fmt.Errorf("Failed to delete event: %v", err)
	}

	return nil
}

func (s *EventsStore) DeleteAllEventsForJobID(jobID string) error {
	ctx := context.Background()
	query := `
		DELETE FROM events
		WHERE job_id = $1
	`

	_, err := s.pool.Exec(ctx, query, jobID)
	if err != nil {
		return fmt.Errorf("Failed to delete events for job: %v", err)
	}

	return nil
}

func (s *EventsStore) GetAllEventsForJob(jobID string) ([]Event, error) {
	ctx := context.Background()
	query := `
		SELECT id, type, job_id, member_id, data, created_at
		FROM events
		WHERE job_id = $1
	`

	rows, err := s.pool.Query(ctx, query, jobID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get events for job: %v", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Type, &event.JobID, &event.MemberID, &event.Data, &event.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan event row: %v", err)
		}
		events = append(events, event)
	}

	return events, nil
}

func (s *EventsStore) GetPublicEventsForJob(jobID string) ([]Event, error) {
	ctx := context.Background()
	query := `
		SELECT id, type, job_id, member_id, data, created_at
		FROM events
		WHERE job_id = $1 AND type = 'public'
	`

	rows, err := s.pool.Query(ctx, query, jobID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get public events for job: %v", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Type, &event.JobID, &event.MemberID, &event.Data, &event.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan event row: %v", err)
		}
		events = append(events, event)
	}

	return events, nil
}
