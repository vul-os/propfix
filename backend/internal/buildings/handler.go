package buildings

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const Name = "Buildings"

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

type CreateBuildingRequest struct {
	Building Building `json:"building"`
}

type CreateBuildingResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateBuilding(r *http.Request, args *CreateBuildingRequest, reply *CreateBuildingResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "buildings", "create", args.Building.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	buildingID, err := h.store.Create(args.Building)
	if err != nil {
		return err
	}

	reply.ID = buildingID
	return nil
}

type UpdateBuildingRequest struct {
	Building Building `json:"building"`
}

type UpdateBuildingResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateBuilding(r *http.Request, args *UpdateBuildingRequest, reply *UpdateBuildingResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "buildings", "update", args.Building.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Update(args.Building)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetBuildingRequest struct {
	BuildingID string `json:"buildingId"`
}

type GetBuildingResponse struct {
	Building Building `json:"building"`
}

func (h *adaptor) GetBuilding(r *http.Request, args *GetBuildingRequest, reply *GetBuildingResponse) error {
	building, err := h.store.Get(args.BuildingID)
	if err != nil {
		return err
	}

	ok, err := h.authz.CheckPermissionAndOrgs(r, "buildings", "get", building.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Building = *building
	return nil
}

type DeleteBuildingRequest struct {
	BuildingID string `json:"buildingId"`
}

type DeleteBuildingResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteBuilding(r *http.Request, args *DeleteBuildingRequest, reply *DeleteBuildingResponse) error {
	ok, err := h.authz.CheckPermission(r, "buildings", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.BuildingID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllBuildingsRequest struct {
	Latitude       float64 `json:"latitude,omitempty"`
	Longitude      float64 `json:"longitude,omitempty"`
	Search         string  `json:"search,omitempty"`
	OrganizationID string  `json:"organizationId"`
}

type GetAllBuildingsResponse struct {
	Buildings []Building `json:"buildings"`
}

func (h *adaptor) GetAllBuildings(r *http.Request, args *GetAllBuildingsRequest, reply *GetAllBuildingsResponse) error {
	buildings, err := h.store.GetAll(args.Search, args.Latitude, args.Longitude, args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Buildings = buildings
	return nil
}
