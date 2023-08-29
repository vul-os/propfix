package columns

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Column struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	JobIDs         []string `json:"jobIds"`
	OrganizationID string   `json:"organizationId"`
}

type adaptor struct {
	pool        *pgxpool.Pool
	authz       *authz.Authz
	columnStore *ColumnsStore
}

func New(pool *pgxpool.Pool, authz *authz.Authz, cs *ColumnsStore) *adaptor {
	return &adaptor{
		pool:        pool,
		authz:       authz,
		columnStore: cs,
	}
}

const Name = "Columns"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type CreateColumnRequest struct {
	Column Column `json:"column"`
}

type CreateColumnResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateColumn(r *http.Request, args *CreateColumnRequest, reply *CreateColumnResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "create")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	columnID := uuid.New().String()
	query := `
		INSERT INTO columns (id, name, job_ids, organization_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err = a.pool.QueryRow(ctx, query, columnID, args.Column.Name, args.Column.JobIDs, args.Column.OrganizationID).Scan(&columnID)
	if err != nil {
		return errors.New("Failed to create column")
	}

	reply.ID = columnID
	return nil
}

type UpdateColumnRequest struct {
	Column Column `json:"column"`
}

type UpdateColumnResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateColumn(r *http.Request, args *UpdateColumnRequest, reply *UpdateColumnResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $1, job_ids = $2, organization_id = $3
		WHERE id = $4
	`

	_, err = a.pool.Exec(ctx, query, args.Column.Name, args.Column.JobIDs, args.Column.OrganizationID, args.Column.ID)
	if err != nil {
		return errors.New("Failed to update column")
	}

	reply.Success = true
	return nil
}

type GetColumnRequest struct {
	ColumnID string `json:"id"`
}

type GetColumnResponse struct {
	Column Column `json:"column"`
}

func (a *adaptor) GetColumn(r *http.Request, args *GetColumnRequest, reply *GetColumnResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "get")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, organization_id
		FROM columns
		WHERE id = $1
	`

	var column Column
	err = a.pool.QueryRow(ctx, query, args.ColumnID).Scan(&column.ID, &column.Name, &column.JobIDs, &column.OrganizationID)
	if err != nil {
		return errors.New("Column not found")
	}

	reply.Column = column
	return nil
}

type DeleteColumnRequest struct {
	ColumnID string `json:"id"`
}

type DeleteColumnResponse struct {
	Message string `json:"message"`
}

func (a *adaptor) DeleteColumn(r *http.Request, args *DeleteColumnRequest, result *DeleteColumnResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`

	res, err := a.pool.Exec(ctx, query, args.ColumnID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	numRows := res.RowsAffected()

	// Log the result to aid in debugging
	result.Message = fmt.Sprintf("Deleted %d rows\n", numRows)

	// Explicitly return a non-nil error if there are no issues
	return nil
}

type AddJobsRequest struct {
	ColumnID string   `json:"columnId"`
	JobIDs   []string `json:"jobIds"`
}

type AddJobsResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) AddJobs(r *http.Request, args *AddJobsRequest, reply *AddJobsResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()

	// Fetch existing column to get current job IDs
	existingColumn, err := a.columnStore.GetColumn(args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	// Append new job IDs to existing ones
	newJobIDs := append(existingColumn.JobIDs, args.JobIDs...)

	// Update the column with the new job IDs
	query := `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = a.pool.Exec(ctx, query, newJobIDs, args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to add jobs to column: %v", err)
	}

	reply.Success = true
	return nil
}

type RemoveJobsRequest struct {
	ColumnID     string   `json:"columnId"`
	JobsToRemove []string `json:"jobsToRemove"`
}

type RemoveJobsResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) RemoveJobs(r *http.Request, args *RemoveJobsRequest, reply *RemoveJobsResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()

	// Fetch existing column to get current job IDs
	existingColumn, err := a.columnStore.GetColumn(args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	// Create a map of existing job IDs for quick lookup
	existingJobIDsMap := make(map[string]bool)
	for _, id := range existingColumn.JobIDs {
		existingJobIDsMap[id] = true
	}

	// Filter out job IDs to be removed
	newJobIDs := make([]string, 0)
	for _, id := range existingColumn.JobIDs {
		if _, exists := existingJobIDsMap[id]; !exists {
			newJobIDs = append(newJobIDs, id)
		}
	}

	// Update the column with the new job IDs
	query := `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = a.pool.Exec(ctx, query, newJobIDs, args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to remove jobs from column: %v", err)
	}

	reply.Success = true
	return nil
}
