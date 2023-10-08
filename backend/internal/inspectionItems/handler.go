package inspectionItems

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const name = "InspectionItems"

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

type CreateInspectionItemRequest struct {
	Item InspectionItem `json:"item"`
}

type CreateInspectionItemResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionItem(r *http.Request, args *CreateInspectionItemRequest, reply *CreateInspectionItemResponse) error {
	// Check permission and organization for the "create" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "create", args.Item.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	itemID, err := h.store.Create(args.Item)
	if err != nil {
		return err
	}

	reply.ID = itemID
	return nil
}

type UpdateInspectionItemRequest struct {
	Item InspectionItem `json:"item"`
}

type UpdateInspectionItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionItem(r *http.Request, args *UpdateInspectionItemRequest, reply *UpdateInspectionItemResponse) error {
	// Check permission and organization for the "update" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "update", args.Item.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Update(args.Item)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetInspectionItemRequest struct {
	ID string `json:"id"`
}

type GetInspectionItemResponse struct {
	Item InspectionItem `json:"item"`
}

func (h *adaptor) GetInspectionItem(r *http.Request, args *GetInspectionItemRequest, reply *GetInspectionItemResponse) error {

	item, err := h.store.Get(args.ID)
	if err != nil {
		return err
	}
	// Check permission and organization for the "get" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "get", item.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Item = *item
	return nil
}

type DeleteInspectionItemRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type DeleteInspectionItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionItem(r *http.Request, args *DeleteInspectionItemRequest, reply *DeleteInspectionItemResponse) error {
	item, err := h.store.Get(args.ID)
	if err != nil {
		return err
	}
	// Check permission and organization for the "get" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "delete", item.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.ID, item.OrganizationID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllInspectionItemsRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllInspectionItemsResponse struct {
	Items []InspectionItem `json:"items"`
}

func (h *adaptor) GetAllInspectionItems(r *http.Request, args *GetAllInspectionItemsRequest, reply *GetAllInspectionItemsResponse) error {
	// Check permission and organization for the "list" action on the "inspectionitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectionitems", "list", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	items, err := h.store.GetAll(args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Items = items
	return nil
}
