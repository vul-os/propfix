package columns

import (
	"context"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
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

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Column"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		dbpool: dbpool,
		authz:  authz,
	}
}

type Column struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	JobIDs  []string `json:"jobIds"`
	BoardID string   `json:"boardId"`
}

type CreateColumnRequest struct {
	Column Column `json:"column"`
}

type CreateColumnResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateColumn(r *http.Request, args *CreateColumnRequest, result *CreateColumnResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "create")
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
	row := a.dbpool.QueryRow(ctx, query, args.Column.ID, args.Column.Name, args.Column.JobIDs, args.Column.BoardID)
	if err := row.Scan(&args.Column.ID); err != nil {
		return err
	}

	result.ID = args.Column.ID
	return nil
}

type GetColumnRequest struct {
	ID string `json:"id"`
}

type GetColumnResponse struct {
	Column Column `json:"column"`
}

func (a *adaptor) GetColumn(r *http.Request, args *GetColumnRequest, result *GetColumnResponse) error {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, board_id
		FROM columns
		WHERE id = $1
	`
	row := a.dbpool.QueryRow(ctx, query, args.ID)

	var column Column
	err := row.Scan(&column.ID, &column.Name, &column.JobIDs, &column.BoardID)
	if err != nil {
		return err
	}

	result.Column = column
	return nil
}

type UpdateColumnRequest struct {
	Column Column `json:"column"`
}

func (a *adaptor) UpdateColumn(r *http.Request, args *UpdateColumnRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "update")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		UPDATE columns
		SET name = $2, job_ids = $3, board_id = $4
		WHERE id = $1
	`
	_, err = a.dbpool.Exec(ctx, query, args.Column.ID, args.Column.Name, args.Column.JobIDs, args.Column.BoardID)
	if err != nil {
		return err
	}

	return nil
}

type DeleteColumnRequest struct {
	ID string `json:"id"`
}

func (a *adaptor) DeleteColumn(r *http.Request, args *DeleteColumnRequest, result *utils.EmptyResponse) error {
	ok, err := utils.CheckPermission(r, a.authz, "columns", "delete")
	if err != nil || !ok {
		return err
	}

	ctx := context.Background()
	query := `
		DELETE FROM columns
		WHERE id = $1
	`
	_, err = a.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return err
	}

	return nil
}

type MoveJobRequest struct {
	JobID    string `json:"jobId"`
	SourceID string `json:"sourceId"`
	TargetID string `json:"targetId"`
}

func (a *adaptor) MoveJob(r *http.Request, args *MoveJobRequest, result *utils.EmptyResponse) error {
	ctx := context.Background()

	// Retrieve the current column
	currentQuery := `
		SELECT id, name, job_ids, board_id
		FROM columns
		WHERE id = $1
	`
	row := a.dbpool.QueryRow(ctx, currentQuery, args.SourceID)
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
	row = a.dbpool.QueryRow(ctx, targetQuery, args.TargetID)
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
	_, err = a.dbpool.Exec(ctx, updateCurrentQuery, currentColumn.ID, currentColumn.JobIDs)
	if err != nil {
		return err
	}

	// Update the target column in the database
	updateTargetQuery := `
		UPDATE columns
		SET job_ids = $2
		WHERE id = $1
	`
	_, err = a.dbpool.Exec(ctx, updateTargetQuery, targetColumn.ID, targetColumn.JobIDs)
	if err != nil {
		return err
	}

	return nil
}

func removeString(slice []string, target string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != target {
			result = append(result, s)
		}
	}
	return result
}

func (a *adaptor) GetAllColumns(r *http.Request, args *utils.EmptyRequest, result *[]Column) error {
	ctx := context.Background()
	query := `
		SELECT id, name, job_ids, board_id
		FROM columns
	`
	rows, err := a.dbpool.Query(ctx, query)
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
