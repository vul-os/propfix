package labels

import (
	"context"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Label struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
	BoardID        string `json:"boardId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type LabelsHandler struct {
	pool *pgxpool.Pool
}

func NewLabelsHandler(pool *pgxpool.Pool) *LabelsHandler {
	return &LabelsHandler{
		pool: pool,
	}
}

type CreateLabelRequest struct {
	OrganizationID string `json:"organizationId"`
	BoardID        string `json:"boardId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type CreateLabelResponse struct {
	ID string `json:"id"`
}

func (h *LabelsHandler) CreateLabel(r *http.Request, args *CreateLabelRequest, reply *CreateLabelResponse) error {
	ctx := context.Background()

	labelID := uuid.New().String()
	query := `
		INSERT INTO labels (id, organization_id, board_id, name, color)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := h.pool.QueryRow(ctx, query, labelID, args.OrganizationID, args.BoardID, args.Name, args.Color).Scan(&labelID)
	if err != nil {
		return errors.New("Failed to create label")
	}

	reply.ID = labelID
	return nil
}

type UpdateLabelRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
	BoardID        string `json:"boardId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type UpdateLabelResponse struct {
	Success bool `json:"success"`
}

func (h *LabelsHandler) UpdateLabel(r *http.Request, args *UpdateLabelRequest, reply *UpdateLabelResponse) error {
	ctx := context.Background()
	query := `
		UPDATE labels
		SET name = $1, color = $2
		WHERE id = $3 AND organization_id = $4
	`

	_, err := h.pool.Exec(ctx, query, args.Name, args.Color, args.ID, args.OrganizationID)
	if err != nil {
		return errors.New("Failed to update label")
	}

	reply.Success = true
	return nil
}

type GetLabelRequest struct {
	OrganizationID string `json:"organizationId"`
	LabelID        string `json:"labelId"`
}

type GetLabelResponse struct {
	Label Label `json:"label"`
}

func (h *LabelsHandler) GetLabel(r *http.Request, args *GetLabelRequest, reply *GetLabelResponse) error {
	ctx := context.Background()
	query := `
		SELECT id, name, color, board_id
		FROM labels
		WHERE id = $1 AND organization_id = $2
	`

	var label Label
	err := h.pool.QueryRow(ctx, query, args.LabelID, args.OrganizationID).Scan(&label.ID, &label.Name, &label.Color, &label.BoardID)
	if err != nil {
		return errors.New("Label not found")
	}

	reply.Label = label
	return nil
}

type DeleteLabelRequest struct {
	OrganizationID string `json:"organizationId"`
	LabelID        string `json:"labelId"`
}

type DeleteLabelResponse struct {
	Success bool `json:"success"`
}

func (h *LabelsHandler) DeleteLabel(r *http.Request, args *DeleteLabelRequest, reply *DeleteLabelResponse) error {
	ctx := context.Background()
	query := `
		DELETE FROM labels
		WHERE id = $1 AND organization_id = $2
	`

	_, err := h.pool.Exec(ctx, query, args.LabelID, args.OrganizationID)
	if err != nil {
		return errors.New("Failed to delete label")
	}

	reply.Success = true
	return nil
}
