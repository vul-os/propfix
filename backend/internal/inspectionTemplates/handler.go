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
	Template InspectionTemplate `json:"template"`
}

type CreateInspectionTemplateResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateInspectionTemplate(r *http.Request, args *CreateInspectionTemplateRequest, reply *CreateInspectionTemplateResponse) error {
	// Check permission and organization for the "create" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "create", args.Template.OrganizationID)
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
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "update", args.Template.OrganizationID)
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
	ID string `json:"id"`
}

type GetInspectionTemplateResponse struct {
	Template InspectionTemplate `json:"template"`
}

func (h *adaptor) GetInspectionTemplate(r *http.Request, args *GetInspectionTemplateRequest, reply *GetInspectionTemplateResponse) error {
	template, err := h.store.Get(args.ID) // Pass the OrganizationID parameter
	if err != nil {
		return err
	}

	// Check permission and organization for the "get" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "get", template.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Template = *template
	return nil
}

type DeleteInspectionTemplateRequest struct {
	ID string `json:"id"`
}

type DeleteInspectionTemplateResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteInspectionTemplate(r *http.Request, args *DeleteInspectionTemplateRequest, reply *DeleteInspectionTemplateResponse) error {
	template, err := h.store.Get(args.ID) // Pass the OrganizationID parameter
	if err != nil {
		return err
	}

	// Check permission and organization for the "get" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "get", template.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.Delete(args.ID) // Pass the OrganizationID parameter
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

func (h *adaptor) GetAllInspectionTemplates(r *http.Request, args *GetAllInspectionTemplatesRequest, reply *GetAllInspectionTemplatesResponse) error {
	// Check permission and organization for the "list" action on the "inspectiontemplates" resource.
	ok, err := h.authz.CheckPermissionAndOrgs(r, "inspectiontemplates", "GetAll", args.OrganizationID)
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
