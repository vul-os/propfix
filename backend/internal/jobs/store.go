package jobs

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

type Store struct {
	dbpool *pgxpool.Pool
}

func NewJobStore(dbpool *pgxpool.Pool) *Store {
	return &Store{
		dbpool: dbpool,
	}
}

func (s *Store) CreateJob(job *Job) error {
	ctx := context.Background()

	// Generate a unique ID for the job
	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	// Set the job ID and creation timestamp
	job.ID = id
	job.CreatedAt = time.Now()

	// Insert the job into the database
	sqlQuery := `
        INSERT INTO jobs (id, name, organization_id, priority, description, tenant_identifier,
            assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `

	_, err = s.dbpool.Exec(ctx, sqlQuery,
		job.ID, job.Name, job.OrganizationID, job.Priority, job.Description, job.TenantIdentifier,
		job.AssigneeIDs, job.UnitIdentifier, job.BuildingID, job.Labels, job.Attachments,
		job.Cost, job.Hours, job.DueDate, job.CreatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (s *Store) UpdateJob(job *Job) error {
	ctx := context.Background()

	sqlQuery := `
        UPDATE jobs
        SET name = $1, organization_id = $2, priority = $3, description = $4,
        tenant_identifier = $5, assignee_ids = $6, unit_identifier = $7,
        building_id = $8, labels = $9, attachments = $10, cost = $11, hours = $12,
        due_date = $13
        WHERE id = $14
    `

	_, err := s.dbpool.Exec(ctx, sqlQuery,
		job.Name, job.OrganizationID, job.Priority, job.Description, job.TenantIdentifier,
		job.AssigneeIDs, job.UnitIdentifier, job.BuildingID, job.Labels, job.Attachments,
		job.Cost, job.Hours, job.DueDate, job.ID)

	if err != nil {
		return err
	}

	return nil
}

func (s *Store) DeleteJob(jobID string) error {
	ctx := context.Background()

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err := s.dbpool.Exec(ctx, sqlQuery, jobID)
	if err != nil {
		return err
	}

	return nil
}

func (s *Store) GetJobByID(jobID string) (*Job, error) {
	ctx := context.Background()

	sqlQuery := `
        SELECT id, name, organization_id, priority, description, tenant_identifier,
        assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at
        FROM jobs
        WHERE id = $1
    `

	row := s.dbpool.QueryRow(ctx, sqlQuery, jobID)

	var job Job
	err := row.Scan(
		&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
		&job.DueDate, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, errors.New("Job not found")
	} else if err != nil {
		return nil, err
	}

	return &job, nil
}

func (s *Store) GetJobsByOrganization(identifier string, permitted bool) ([]Job, error) {
	ctx := context.Background()
	query := ""

	if permitted {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at FROM jobs WHERE organization_id = '%s'`, identifier)
	} else {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at FROM jobs WHERE tenant_identifier = '%s'`, identifier)
	}

	rows, err := s.dbpool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if !permitted {
			job.Cost = 0
			job.Hours = 0
			job.Priority = ""
		}

		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return jobs, nil
}
