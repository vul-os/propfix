package roles

import (
	"encoding/json"
	"net/http"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/gorilla/mux"
)

type RoleHandler struct {
	store *Store
}

func NewRoleHandler(store *Store) *RoleHandler {
	return &RoleHandler{
		store: store,
	}
}

func (h *RoleHandler) CreateRoleHandler(w http.ResponseWriter, r *http.Request) {
	var role authz.Role
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	roleID, err := h.store.CreateRole(role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"roleID": roleID})
}

func (h *RoleHandler) DeleteRoleHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["roleID"]

	err := h.store.DeleteRole(roleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *RoleHandler) GetRoleByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roleID := vars["roleID"]

	role, err := h.store.GetRoleByID(roleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(role)
}

func (h *RoleHandler) UpdateRoleHandler(w http.ResponseWriter, r *http.Request) {
	var role authz.Role
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.store.UpdateRole(role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
