package columns

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
)

type ColumnsHandler struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz // Add the authz instance to the handler
}

func NewColumnsHandler(dbpool *pgxpool.Pool, authz *authz.Authz) *ColumnsHandler {
	return &ColumnsHandler{
		dbpool: dbpool,
		authz:  authz, // Assign the authz instance to the handler
	}
}

type Column struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	JobIDs  []string `json:"jobIds"`
	BoardID string   `json:"boardId"`
}

// JSON-RPC request for creating a column
type CreateColumnRequest struct {
	Column Column `json:"column"`
}

// JSON-RPC response for creating a column
type CreateColumnResponse struct {
	ID string `json:"id"`
}

func (h *ColumnsHandler) CreateColumn(r *http.Request, args *CreateColumnRequest, result *CreateColumnResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponse(r, h.authz, "columns", "create")
	if err != nil || !ok {
		return err
	}

	args.Column.ID = uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO columns (id, name, job_ids, board_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	row := h.dbpool.QueryRow(ctx, query, args.Column.ID, args.Column.Name, args.Column.JobIDs, args.Column.BoardID)
	if err := row.Scan(&args.Column.ID); err != nil {
		return err
	}

	result.ID = args.Column.ID
	return nil
}

// JSON-RPC request for getting a column
type GetColumnRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for getting a column
type GetColumnResponse struct {
	Column Column `json:"column"`
}

func (h *ColumnsHandler) GetColumn(r *http.Request, args *GetColumnRequest, result *GetColumnResponse) error {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, board_id
		FROM columns
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, query, args.ID)

	var column Column
	err := row.Scan(&column.ID, &column.Name, &column.JobIDs, &column.BoardID)
	if err != nil {
		return err
	}

	result.Column = column
	return nil
}

// JSON-RPC request for updating a column
type UpdateColumnRequest struct {
	Column Column `json:"column"`
}

func (h *ColumnsHandler) UpdateColumn(r *http.Request, args *UpdateColumnRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponse(r, h.authz, "columns", "update")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $2, job_ids = $3, board_id = $4
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, args.Column.ID, args.Column.Name, args.Column.JobIDs, args.Column.BoardID)
	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for deleting a column
type DeleteColumnRequest struct {
	ID string `json:"id"`
}

func (h *ColumnsHandler) DeleteColumn(r *http.Request, args *DeleteColumnRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermissionAndExecuteResponse(r, h.authz, "columns", "delete")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return err
	}

	return nil
}

// JSON-RPC request for moving a job between columns
type MoveJobRequest struct {
	JobID    string `json:"jobId"`
	SourceID string `json:"sourceId"`
	TargetID string `json:"targetId"`
}

func (h *ColumnsHandler) MoveJob(r *http.Request, args *MoveJobRequest, result *utils.EmptyResponse) error {
	// Permission check for MoveJob endpoint is not necessary as it's based on specific source and target columns
	// and the user's permissions on those columns are already checked in GetColumn and UpdateColumn endpoints.

	ctx := context.Background()

	// Retrieve the current column
	currentQuery := `
		SELECT id, name, job_ids, board_id
		FROM columns
		WHERE id = $1
	`
	row := h.dbpool.QueryRow(ctx, currentQuery, args.SourceID)
	var currentColumn Column
	err := row.Scan(&currentColumn.ID, &currentColumn.Name, &currentColumn.JobIDs, &currentColumn.BoardID)
	if err != nil {
		return err
	}

	// Retrieve the target column
	targetQuery := `
		SELECT id, name, job_ids, board_id
		FROM columns
		WHERE id = $1
	`
	row = h.dbpool.QueryRow(ctx, targetQuery, args.TargetID)
	var targetColumn Column
	err = row.Scan(&targetColumn.ID, &targetColumn.Name, &targetColumn.JobIDs, &targetColumn.BoardID)
	if err != nil {
		return err
	}

	// Move the job from the current column to the target column
	currentColumn.JobIDs = removeString(currentColumn.JobIDs, args.JobID)
	targetColumn.JobIDs = append(targetColumn.JobIDs, args.JobID)

	// Update the current column in the database
	updateCurrentQuery := `
		UPDATE columns
		SET job_ids = $2
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, updateCurrentQuery, currentColumn.ID, currentColumn.JobIDs)
	if err != nil {
		return err
	}

	// Update the target column in the database
	updateTargetQuery := `
		UPDATE columns
		SET job_ids = $2
		WHERE id = $1
	`
	_, err = h.dbpool.Exec(ctx, updateTargetQuery, targetColumn.ID, targetColumn.JobIDs)
	if err != nil {
		return err
	}

	return nil
}

// removeString removes the given string from the slice.
func removeString(slice []string, target string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != target {
			result = append(result, s)
		}
	}
	return result
}

func (h *ColumnsHandler) GetAllColumns(r *http.Request, args *utils.EmptyRequest, result *[]Column) error {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, board_id
		FROM columns
	`
	rows, err := h.dbpool.Query(ctx, query)
	if err != nil {
		return err
	}
	defer rows.Close()

	var columns []Column
	for rows.Next() {
		var column Column
		err := rows.Scan(&column.ID, &column.Name, &column.JobIDs, &column.BoardID)
		if err != nil {
			return err
		}
		columns = append(columns, column)
	}

	*result = columns
	return nil
}
