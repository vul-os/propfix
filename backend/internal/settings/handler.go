package settings

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

const Name = "Settings"

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

type CreateSettingRequest struct {
	Setting Setting `json:"setting"`
}

type CreateSettingResponse struct {
	ID string `json:"id"`
}

func (h *adaptor) CreateSetting(r *http.Request, args *CreateSettingRequest, reply *CreateSettingResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "settings", "create", args.Setting.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	settingID, err := h.store.CreateSetting(args.Setting)
	if err != nil {
		return err
	}

	reply.ID = settingID
	return nil
}

type UpdateSettingRequest struct {
	Setting Setting `json:"setting"`
}

type UpdateSettingResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) UpdateSetting(r *http.Request, args *UpdateSettingRequest, reply *UpdateSettingResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "settings", "update", args.Setting.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.UpdateSetting(args.Setting)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetSettingRequest struct {
	SettingID      string `json:"settingId"`
	OrganizationID string `json:"organizationId"`
}

type GetSettingResponse struct {
	Setting Setting `json:"setting"`
}

func (h *adaptor) GetSetting(r *http.Request, args *GetSettingRequest, reply *GetSettingResponse) error {
	setting, err := h.store.GetSetting(args.SettingID, args.OrganizationID)
	if err != nil {
		return err
	}

	ok, err := h.authz.CheckPermissionAndOrgs(r, "settings", "get", setting.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	reply.Setting = setting
	return nil
}

type DeleteSettingRequest struct {
	ID string `json:"id"`
}

type DeleteSettingResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) DeleteSetting(r *http.Request, args *DeleteSettingRequest, reply *DeleteSettingResponse) error {
	ok, err := h.authz.CheckPermission(r, "settings", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.DeleteSetting(args.ID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

type GetAllSettingsRequest struct {
	OrganizationID string `json:"organizationId"`
}

type GetAllSettingsResponse struct {
	Settings []Setting `json:"settings"`
}

func (h *adaptor) GetAllSettings(r *http.Request, args *GetAllSettingsRequest, reply *GetAllSettingsResponse) error {
	settings, err := h.store.GetAllSettings(args.OrganizationID)
	if err != nil {
		return err
	}

	reply.Settings = settings
	return nil
}
