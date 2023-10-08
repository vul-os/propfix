package inspectionAreas

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const name = "InspectionAreas"

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

type CreateInspectionAreaRequest struct {
	Area InspectionArea `json:"area"`
}

type CreateInspectionAreaResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionArea(r *http.Request, args *CreateInspectionAreaRequest, reply *CreateInspectionAreaResponse) error {
	// Check permission and organization for the "update" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "update", args.Area.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	areaID, err := h.store.Create(args.Area)
	if err != nil {
		return err
	}

	reply.ID = areaID
	return nil
}

type UpdateInspectionAreaRequest struct {
	Area InspectionArea `json:"area"`
}

type UpdateInspectionAreaResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionArea(r *http.Request, args *UpdateInspectionAreaRequest, reply *UpdateInspectionAreaResponse) error {
	// Check permission and organization for the "update" action on the "inspectionareas" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionareas", "update", args.Area.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Update(args.Area)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetInspectionAreaRequest struct {
	ID string `json:"id"`
}

type GetInspectionAreaResponse struct {
	Area InspectionArea `json:"area"`
}

func (h *adaptor) GetInspectionArea(r *http.Request, args *GetInspectionAreaRequest, reply *GetInspectionAreaResponse) error {
	area, err := h.store.Get(args.ID)
	if err != nil {
		return err
	}

	// Check permission and organization for the "get" action on the "inspectionareas" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionareas", "get", area.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Area = *area
	return nil
}

type DeleteInspectionAreaRequest struct {
	ID string `json:"id"`
}

type DeleteInspectionAreaResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionArea(r *http.Request, args *DeleteInspectionAreaRequest, reply *DeleteInspectionAreaResponse) error {
	area, err := h.store.Get(args.ID)
	if err != nil {
		return err
	}

	// Check permission and organization for the "get" action on the "inspectionareas" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionareas", "get", area.OrganizationID)
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

type GetAllInspectionAreasRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllInspectionAreasResponse struct {
	Areas []InspectionArea `json:"areas"`
}

func (h *adaptor) GetAllInspectionAreas(r *http.Request, args *GetAllInspectionAreasRequest, reply *GetAllInspectionAreasResponse) error {

	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionareas", "GetAll", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	areas, err := h.store.GetAll(args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Areas = areas
	return nil
}
