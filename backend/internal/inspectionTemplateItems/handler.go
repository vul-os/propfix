package inspectionTemplateItems

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const name = "InspectionTemplateItems"

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

type CreateInspectionTemplateItemRequest struct {
	Item           InspectionTemplateItem `json:"item"`
	OrganizationID string                 `json:"organizationId"`
}

type CreateInspectionTemplateItemResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionTemplateItem(r *http.Request, args *CreateInspectionTemplateItemRequest, reply *CreateInspectionTemplateItemResponse) error {
	// Check permission and organization for the "create" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "create", args.OrganizationID)
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

type UpdateInspectionTemplateItemRequest struct {
	Item           InspectionTemplateItem `json:"item"`
	OrganizationID string                 `json:"organizationId"`
}

type UpdateInspectionTemplateItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionTemplateItem(r *http.Request, args *UpdateInspectionTemplateItemRequest, reply *UpdateInspectionTemplateItemResponse) error {
	// Check permission and organization for the "update" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "update", args.OrganizationID)
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

type GetInspectionTemplateItemRequest struct {
	ItemID         string `json:"itemID"`
	OrganizationID string `json:"organizationId"`
}

type GetInspectionTemplateItemResponse struct {
	Item InspectionTemplateItem `json:"item"`
}

func (h *adaptor) GetInspectionTemplateItem(r *http.Request, args *GetInspectionTemplateItemRequest, reply *GetInspectionTemplateItemResponse) error {
	// Check permission and organization for the "get" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "get", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	item, err := h.store.Get(args.ItemID, args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Item = *item
	return nil
}

type DeleteInspectionTemplateItemRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type DeleteInspectionTemplateItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionTemplateItem(r *http.Request, args *DeleteInspectionTemplateItemRequest, reply *DeleteInspectionTemplateItemResponse) error {
	// Check permission and organization for the "delete" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "delete", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.ID, args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllInspectionTemplateItemsRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllInspectionTemplateItemsResponse struct {
	Items []InspectionTemplateItem `json:"items"`
}

func (h *adaptor) GetAllInspectionItemsInspectionTemplateItems(r *http.Request, args *GetAllInspectionTemplateItemsRequest, reply *GetAllInspectionTemplateItemsResponse) error {

	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "GetAll", args.OrganizationID)
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
