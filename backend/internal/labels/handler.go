package labels

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const Name = "Labels"

type adaptor struct {
	store *Store
	authz *authz.Authz
}

func New(store *Store, az *authz.Authz) *adaptor {
	return &adaptor{
		store: store,
		authz: az,
	}
}

func (h *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type CreateLabelRequest struct {
	OrganizationID string `json:"organizationId"`
	Name           string `json:"name"`
	Color          string `json:"color"`
}

type CreateLabelResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateLabel(r *http.Request, args *CreateLabelRequest, reply *CreateLabelResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "labels", "create", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	labelID, err := h.store.CreateLabel(args.OrganizationID, args.Name, args.Color)
	if err != nil {
		return err
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

func (h *adaptor) UpdateLabel(r *http.Request, args *UpdateLabelRequest, reply *UpdateLabelResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "labels", "update", args.Label.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.UpdateLabel(args.Label)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetLabelRequest struct {
	LabelID string `json:"labelId"`
}

type GetLabelResponse struct {
	Label Label `json:"label"`
}

func (h *adaptor) GetLabel(r *http.Request, args *GetLabelRequest, reply *GetLabelResponse) error {
	label, err := h.store.GetLabel(args.LabelID, "")
	if err != nil {
		return err
	}

	ok, err := h.authz.CheckPermissionAndOrgs(r, "labels", "get", label.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Label = label
	return nil
}

type DeleteLabelRequest struct {
	LabelID string `json:"labelId"`
}

type DeleteLabelResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteLabel(r *http.Request, args *DeleteLabelRequest, reply *DeleteLabelResponse) error {
	ok, err := h.authz.CheckPermission(r, "labels", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.DeleteLabel(args.LabelID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllLabelsRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllLabelsResponse struct {
	Labels []Label `json:"labels"`
}

func (h *adaptor) GetAllLabels(r *http.Request, args *GetAllLabelsRequest, reply *GetAllLabelsResponse) error {
	// ok, err := h.store.authz.CheckPermission(r, "labels", "getall")
	// if err != nil || !ok {
	// 	return errors.New("not permitted")
	// }

	labels, err := h.store.GetAllLabels(args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Labels = labels
	return nil
}
