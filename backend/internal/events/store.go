package events

import (
	"context"
	"fmt"
	"time"

	"github.com/exolutionza/propfix-backend-go/internal/user"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

// Store is the struct for handling events data in the database
type Store struct {
	pool *pgxpool.Pool
}

// NewEventsStore creates a new instance of the events store
func NewEventsStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

// Event represents an event in the system
type Event struct {
	ID         string      `json:"id"`
	Type       string      `json:"type"`
	Visibility string      `json:"visibility"`
	JobID      string      `json:"jobId"`
	MemberID   string      `json:"memberId"`
	Data       interface{} `json:"data"`
	CreatedAt  time.Time   `json:"createdAt"`
}

// CreateEvent creates a new event in the database
func (s *Store) CreateEvent(event Event, userID string) (string, time.Time, error) {
	// Perform basic validation on the event data before insertion
	if event.Type == "" || event.JobID == "" {
		return "", time.Time{}, fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	// Generate a UUID and set it as the ID field
	event.ID = uuid.New().String()
	event.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		INSERT INTO events (id, type, job_id, member_id, data, created_at, visibility)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := s.pool.Exec(ctx, query, event.ID, event.Type, event.JobID, userID, event.Data, event.CreatedAt, event.Visibility)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("Failed to create event: %v", err)
	}

	return event.ID, event.CreatedAt, nil
}

// GetEvent retrieves an event by ID from the database
func (s *Store) GetEvent(eventID string) (*Event, error) {
	ctx := context.Background()
	query := `
		SELECT id, type, job_id, member_id, data, created_at, visibility
		FROM events
		WHERE id = $1
	`

	var event Event
	err := s.pool.QueryRow(ctx, query, eventID).Scan(&event.ID, &event.Type, &event.JobID, &event.MemberID, &event.Data, &event.CreatedAt, &event.Visibility)
	if err != nil {
		return nil, fmt.Errorf("Event not found: %v", err)
	}

	return &event, nil
}

// UpdateEvent updates an existing event in the database
func (s *Store) UpdateEvent(event Event) error {
	// Perform basic validation on the event data before update
	if event.Type == "" || event.JobID == "" || event.MemberID == "" {
		return fmt.Errorf("Type, Data, JobID, and MemberID are required fields")
	}

	event.CreatedAt = time.Now()

	ctx := context.Background()
	query := `
		UPDATE events
		SET type = $1, job_id = $2, member_id = $3, data = $4, created_at = $5, visibility = $6
		WHERE id = $7
	`

	_, err := s.pool.Exec(ctx, query, event.Type, event.JobID, event.MemberID, event.Data, event.CreatedAt, event.Visibility, event.ID)
	if err != nil {
		return fmt.Errorf("Failed to update event: %v", err)
	}

	return nil
}

// DeleteEvent deletes an event by ID from the database
func (s *Store) DeleteEvent(eventID string) error {
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

// DeleteAllEventsForJobID deletes all events associated with a job from the database
func (s *Store) DeleteAllEventsForJobID(jobID string) error {
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

func StringInSlice(str string, slice []string) bool {
	for _, s := range slice {
		if s == str {
			return true
		}
	}
	return false
}

// GetAllEvents retrieves all events for a given job and visibility from the database
func (s *Store) GetAllEvents(jobID string, visibility string, usr user.User, filters []string) ([]Event, error) {
	ctx := context.Background()
	var events []Event

	fmt.Println(usr, filters)

	query := `
		SELECT id, type, job_id, member_id, data, created_at, visibility
		FROM events
		WHERE job_id = $1
		ORDER BY created_at ASC 
	`

	// if StringInSlice("visibility-public", filters) {
	// 	query += " AND visibility = 'public'"
	// }
	// if StringInSlice("priority", filters) {
	// 	// Add conditions for priority filter
	// 	// Example: query += " AND priority = true"
	// }
	// if StringInSlice("latest-event", filters) {
	// 	query += " ORDER BY created_at DESC LIMIT 1"
	// }

	rows, err := s.pool.Query(ctx, query, jobID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get events for job: %v", err)
	}
	defer rows.Close()

	events = []Event{} // Initialize the events slice

	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Type, &event.JobID, &event.MemberID, &event.Data, &event.CreatedAt, &event.Visibility)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan event row: %v", err)
		}
		events = append(events, event)
	}

	return events, nil
}
