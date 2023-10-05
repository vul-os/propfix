// handler.go in the inspectionAreas package
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
	ok, err := h.authz.CheckPermission(r, "inspectionareas", "create")
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
	ok, err := h.authz.CheckPermission(r, "inspectionareas", "update")
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
	AreaID string `json:"areaID"`
}

type GetInspectionAreaResponse struct {
	Area InspectionArea `json:"area"`
}

func (h *adaptor) GetInspectionArea(r *http.Request, args *GetInspectionAreaRequest, reply *GetInspectionAreaResponse) error {
	area, err := h.store.Get(args.AreaID)
	if err != nil {
		return err
	}

	ok, err := h.authz.CheckPermission(r, "inspectionareas", "get")
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
	ok, err := h.authz.CheckPermission(r, "inspectionareas", "delete")
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

type ListInspectionAreasRequest struct{}

type ListInspectionAreasResponse struct {
	Areas []InspectionArea `json:"areas"`
}

func (h *adaptor) ListInspectionAreas(r *http.Request, _ *ListInspectionAreasRequest, reply *ListInspectionAreasResponse) error {
	areas, err := h.store.List()
	if err != nil {
		return err
	}

	reply.Areas = areas
	return nil
}
