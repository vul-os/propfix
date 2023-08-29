package labels

import (
	"context"
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/exolutionza/propfix-backend-go/internal/authz"

	"github.com/exolutionza/propfix-backend-go/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Label struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type adaptor struct {
	pool  *pgxpool.Pool
	authz *authz.Authz
}

func New(pool *pgxpool.Pool, authz *authz.Authz) *adaptor {
	return &adaptor{
		pool:  pool,
		authz: authz,
	}
}

const Name = "Labels"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type CreateLabelRequest struct {
	Label Label `json:"label"`
}

type CreateLabelResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateLabel(r *http.Request, args *CreateLabelRequest, reply *CreateLabelResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "labels", "create", args.Label.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	labelID := uuid.New().String()
	query := `
		INSERT INTO labels (id, organization_id, name, color)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err = a.pool.QueryRow(ctx, query, labelID, args.Label.OrganizationID, args.Label.Name, args.Label.Color).Scan(&labelID)
	if err != nil {
		return errors.New("Failed to create label")
	}

	reply.ID = labelID
	return nil
}

type UpdateLabelRequest struct {
	Label Label `json:"label"`
}

type UpdateLabelResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateLabel(r *http.Request, args *UpdateLabelRequest, reply *UpdateLabelResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "labels", "update", args.Label.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE labels
		SET name = $1, color = $2
		WHERE id = $3 AND organization_id = $4
	`

	_, err = a.pool.Exec(ctx, query, args.Label.Name, args.Label.Color, args.Label.ID, args.Label.OrganizationID)
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

func (a *adaptor) GetLabel(r *http.Request, args *GetLabelRequest, reply *GetLabelResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "labels", "get", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, name, color
		FROM labels
		WHERE id = $1 AND organization_id = $2
	`

	var label Label
	err = a.pool.QueryRow(ctx, query, args.LabelID, args.OrganizationID).Scan(&label.ID, &label.Name, &label.Color)
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

func (a *adaptor) DeleteLabel(r *http.Request, args *DeleteLabelRequest, reply *DeleteLabelResponse) error {
	ok, err := utils.CheckPermissionAndOrgs(r, a.authz, "labels", "delete", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM labels
		WHERE id = $1 AND organization_id = $2
	`

	_, err = a.pool.Exec(ctx, query, args.LabelID, args.OrganizationID)
	if err != nil {
		return errors.New("Failed to delete label")
	}

	reply.Success = true
	return nil
}
