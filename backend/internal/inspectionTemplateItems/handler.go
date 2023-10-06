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
	Item InspectionTemplateItem `json:"item"`
}

type CreateInspectionTemplateItemResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionTemplateItem(r *http.Request, args *CreateInspectionTemplateItemRequest, reply *CreateInspectionTemplateItemResponse) error {
	// Check permission and organization for the "create" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplateitems", "create", args.Item.OrganizationID)
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
	Item InspectionTemplateItem `json:"item"`
}

type UpdateInspectionTemplateItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionTemplateItem(r *http.Request, args *UpdateInspectionTemplateItemRequest, reply *UpdateInspectionTemplateItemResponse) error {
	// Check permission for the "update" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermission(r, "inspectiontemplateitems", "update")
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
	ItemID string `json:"itemID"`
}

type GetInspectionTemplateItemResponse struct {
	Item InspectionTemplateItem `json:"item"`
}

func (h *adaptor) GetInspectionTemplateItem(r *http.Request, args *GetInspectionTemplateItemRequest, reply *GetInspectionTemplateItemResponse) error {
	item, err := h.store.Get(args.ItemID)
	if err != nil {
		return err
	}

	// Check permission for the "get" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermission(r, "inspectiontemplateitems", "get")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Item = *item
	return nil
}

type DeleteInspectionTemplateItemRequest struct {
	ID string `json:"id"`
}

type DeleteInspectionTemplateItemResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionTemplateItem(r *http.Request, args *DeleteInspectionTemplateItemRequest, reply *DeleteInspectionTemplateItemResponse) error {
	// Check permission for the "delete" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermission(r, "inspectiontemplateitems", "delete")
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

type ListInspectionTemplateItemsRequest struct{}

type ListInspectionTemplateItemsResponse struct {
	Items []InspectionTemplateItem `json:"items"`
}

func (h *adaptor) ListInspectionTemplateItems(r *http.Request, _ *ListInspectionTemplateItemsRequest, reply *ListInspectionTemplateItemsResponse) error {
	// Check permission for the "list" action on the "inspectiontemplateitems" resource.
	ok, err := h.authz.CheckPermission(r, "inspectiontemplateitems", "list")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	items, err := h.store.List()
	if err != nil {
		return err
	}

	reply.Items = items
	return nil
}
