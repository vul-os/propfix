// handler.go in the inspectionTemplates package
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
	ok, err := h.authz.CheckPermission(r, "inspectiontemplates", "create")
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
	Template InspectionTemplate `json:"template"`
}

type UpdateInspectionTemplateResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateInspectionTemplate(r *http.Request, args *UpdateInspectionTemplateRequest, reply *UpdateInspectionTemplateResponse) error {
	ok, err := h.authz.CheckPermission(r, "inspectiontemplates", "update")
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
	TemplateID string `json:"templateID"`
}

type GetInspectionTemplateResponse struct {
	Template InspectionTemplate `json:"template"`
}

func (h *adaptor) GetInspectionTemplate(r *http.Request, args *GetInspectionTemplateRequest, reply *GetInspectionTemplateResponse) error {
	template, err := h.store.Get(args.TemplateID)
	if err != nil {
		return err
	}

	ok, err := h.authz.CheckPermission(r, "inspectiontemplates", "get")
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
	ok, err := h.authz.CheckPermission(r, "inspectiontemplates", "delete")
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

type ListInspectionTemplatesRequest struct{}

type ListInspectionTemplatesResponse struct {
	Templates []InspectionTemplate `json:"templates"`
}

func (h *adaptor) ListInspectionTemplates(r *http.Request, _ *ListInspectionTemplatesRequest, reply *ListInspectionTemplatesResponse) error {
	templates, err := h.store.List()
	if err != nil {
		return err
	}

	reply.Templates = templates
	return nil
}
