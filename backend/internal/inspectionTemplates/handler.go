package inspectionTemplates

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const name = "InspectionTemplates"

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

type CreateInspectionTemplateRequest struct {
	Template       InspectionTemplate `json:"template"`
	OrganizationID string             `json:"organizationId"`
}

type CreateInspectionTemplateResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionTemplate(r *http.Request, args *CreateInspectionTemplateRequest, reply *CreateInspectionTemplateResponse) error {
	// Check permission and organization for the "create" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "create", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	templateID, err := h.store.Create(args.Template)
	if err != nil {
		return err
	}

	reply.ID = templateID
	return nil
}

type UpdateInspectionTemplateRequest struct {
	Template       InspectionTemplate `json:"template"`
	OrganizationID string             `json:"organizationId"`
}

type UpdateInspectionTemplateResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionTemplate(r *http.Request, args *UpdateInspectionTemplateRequest, reply *UpdateInspectionTemplateResponse) error {
	// Check permission and organization for the "update" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "update", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Update(args.Template)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetInspectionTemplateRequest struct {
	TemplateID     string `json:"templateID"`
	OrganizationID string `json:"organizationId"`
}

type GetInspectionTemplateResponse struct {
	Template InspectionTemplate `json:"template"`
}

func (h *adaptor) GetInspectionTemplate(r *http.Request, args *GetInspectionTemplateRequest, reply *GetInspectionTemplateResponse) error {
	// Check permission and organization for the "get" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "get", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	template, err := h.store.Get(args.TemplateID, args.OrganizationID) // Pass the OrganizationID parameter
	if err != nil {
		return err
	}

	reply.Template = *template
	return nil
}

type DeleteInspectionTemplateRequest struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organizationId"`
}

type DeleteInspectionTemplateResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionTemplate(r *http.Request, args *DeleteInspectionTemplateRequest, reply *DeleteInspectionTemplateResponse) error {
	// Check permission and organization for the "delete" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "delete", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.ID, args.OrganizationID) // Pass the OrganizationID parameter
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllInspectionTemplatesRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllInspectionTemplatesResponse struct {
	Templates []InspectionTemplate `json:"templates"`
}

func (h *adaptor) GetAllInspectionItemsInspectionTemplates(r *http.Request, args *GetAllInspectionTemplatesRequest, reply *GetAllInspectionTemplatesResponse) error {
	// Check permission and organization for the "list" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "list", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	templates, err := h.store.GetAll(args.OrganizationID) // Pass the OrganizationID parameter
	if err != nil {
		return err
	}

	reply.Templates = templates
	return nil
}
