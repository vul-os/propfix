package inspections

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const name = "Inspections"

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
	return name
}

type CreateInspectionRequest struct {
	Inspection Inspection `json:"inspection"`
}

type CreateInspectionResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspection(r *http.Request, args *CreateInspectionRequest, reply *CreateInspectionResponse) error {
	// Check permission and organization for the "create" action on the "inspections" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspections", "create", args.Inspection.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	inspectionID, err := h.store.Create(args.Inspection)
	if err != nil {
		return err
	}

	reply.ID = inspectionID
	return nil
}

type UpdateInspectionRequest struct {
	Inspection Inspection `json:"inspection"`
}

type UpdateInspectionResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspection(r *http.Request, args *UpdateInspectionRequest, reply *UpdateInspectionResponse) error {
	// Check permission for the "update" action on the "inspections" resource.
	ok, err := h.authz.CheckPermission(r, "inspections", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Update(args.Inspection)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetInspectionRequest struct {
	InspectionID string `json:"inspectionID"`
}

type GetInspectionResponse struct {
	Inspection Inspection `json:"inspection"`
}

func (h *adaptor) GetInspection(r *http.Request, args *GetInspectionRequest, reply *GetInspectionResponse) error {
	// Check permission for the "get" action on the "inspections" resource.
	ok, err := h.authz.CheckPermission(r, "inspections", "get")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	inspection, err := h.store.Get(args.InspectionID)
	if err != nil {
		return err
	}

	reply.Inspection = *inspection
	return nil
}

type DeleteInspectionRequest struct {
	ID string `json:"id"`
}

type DeleteInspectionResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspection(r *http.Request, args *DeleteInspectionRequest, reply *DeleteInspectionResponse) error {
	// Check permission for the "delete" action on the "inspections" resource.
	ok, err := h.authz.CheckPermission(r, "inspections", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.ID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type ListInspectionsRequest struct{}

type ListInspectionsResponse struct {
	Inspections []Inspection `json:"inspections"`
}

func (h *adaptor) ListInspections(r *http.Request, _ *ListInspectionsRequest, reply *ListInspectionsResponse) error {
	// Check permission for the "list" action on the "inspections" resource.
	ok, err := h.authz.CheckPermission(r, "inspections", "list")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	inspections, err := h.store.List()
	if err != nil {
		return err
	}

	reply.Inspections = inspections
	return nil
}
