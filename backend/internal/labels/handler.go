package labels

import (
	"context"
	"errors"
	"fmt"
	"github.com/gorilla/rpc/v2/json2"
	"github.com/jackc/pgx/v4/pgxpool"
	"net/http"
)

type Label struct {
	ID          string `json:"id"`
	OrganizationID string `json:"organizationId"`
	BoardID     string `json:"boardId"`
	Name        string `json:"name"`
	Color       string `json:"color"`
	// Add more fields as needed
}

type LabelsHandler struct {
	pool *pgxpool.Pool
}

func NewLabelsHandler(pool *pgxpool.Pool) *LabelsHandler {
	return &LabelsHandler{
		pool: pool,
	}
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