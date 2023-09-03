package columns

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Column struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	JobIDs         []string `json:"jobIds"`
	Order          int      `json:"order"`
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
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "create", args.Column.OrganizationID)
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
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "create", args.Column.OrganizationID)
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
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, organization_id
		FROM columns
		WHERE id = $1
	`

	var column Column
	err := a.pool.QueryRow(ctx, query, args.ColumnID).Scan(&column.ID, &column.Name, &column.JobIDs, &column.OrganizationID)
	if err != nil {
		return errors.New("Column not found")
	}
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "get", column.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
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
	ok, err := a.authz.CheckPermission(r, "columns", "delete")
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
	ctx := context.Background()

	// Fetch existing column to get current job IDs
	existingColumn, err := a.columnStore.GetColumn(args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "addjobs", existingColumn.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
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
	ctx := context.Background()

	// Fetch existing column to get current job IDs
	existingColumn, err := a.columnStore.GetColumn(args.ColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch existing column: %v", err)
	}

	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "removejobs", existingColumn.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
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

// MoveJobsRequest is the request payload for moving jobs between columns
type MoveJobsRequest struct {
	SourceColumnID      string   `json:"sourceColumnId"`
	DestinationColumnID string   `json:"destinationColumnId"`
	JobIDsToMove        []string `json:"jobIds"`
}

// MoveJobsResponse is the response payload for the MoveJobs method
type MoveJobsResponse struct {
	Success bool `json:"success"`
}

// MoveJobs moves jobs from one column to another
func (a *adaptor) MoveJobs(r *http.Request, args *MoveJobsRequest, reply *MoveJobsResponse) error {
	ctx := context.Background()

	// Fetch source column to get current job IDs
	sourceColumn, err := a.columnStore.GetColumn(args.SourceColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch source column: %v", err)
	}

	// Fetch destination column to get current job IDs
	destColumn, err := a.columnStore.GetColumn(args.DestinationColumnID)
	if err != nil {
		return fmt.Errorf("Failed to fetch destination column: %v", err)
	}

	// Check permissions for both source and destination columns
	ok, err := a.authz.CheckPermissionAndOrgs(r, "columns", "movejobs", sourceColumn.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ok, err = a.authz.CheckPermissionAndOrgs(r, "columns", "movejobs", destColumn.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	// Remove job IDs from source column and add them to destination column
	newSourceJobIDs := make([]string, 0)
	newDestJobIDs := append(destColumn.JobIDs, args.JobIDsToMove...)
	for _, id := range sourceColumn.JobIDs {
		if !contains(args.JobIDsToMove, id) {
			newSourceJobIDs = append(newSourceJobIDs, id)
		}
	}
	newSourceJobIDs = unique(newSourceJobIDs)
	newDestJobIDs = unique(newDestJobIDs)
	// Update the source column with the new job IDs
	query := `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = a.pool.Exec(ctx, query, newSourceJobIDs, args.SourceColumnID)
	if err != nil {
		return fmt.Errorf("Failed to update source column: %v", err)
	}

	// Update the destination column with the new job IDs
	query = `
		UPDATE columns
		SET job_ids = $1
		WHERE id = $2
	`
	_, err = a.pool.Exec(ctx, query, newDestJobIDs, args.DestinationColumnID)
	if err != nil {
		return fmt.Errorf("Failed to update destination column: %v", err)
	}

	reply.Success = true
	return nil
}

// Helper function to check if a slice contains a particular string
func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}
	return false
}

func unique(strings []string) []string {
	seen := make(map[string]bool)
	result := []string{}

	for _, str := range strings {
		if !seen[str] {
			seen[str] = true
			result = append(result, str)
		}
	}

	return result
}
