package api

// Inspection templates, inspections and findings.

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/vul-os/propfix/backend/internal/domain"
	"github.com/vul-os/propfix/backend/internal/repo"
)

func (s *Server) handleListTemplates(w http.ResponseWriter, r *http.Request) {
	list, err := s.Repo.ListTemplates(orgOf(r))
	if err != nil {
		writeServerErr(w, "list templates", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

type templateReq struct {
	Name  string `json:"name"`
	Kind  string `json:"kind"`
	Items []struct {
		Section string `json:"section"`
		Label   string `json:"label"`
		Sort    int64  `json:"sort"`
	} `json:"items"`
}

func (s *Server) handleCreateTemplate(w http.ResponseWriter, r *http.Request) {
	var req templateReq
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	t := domain.InspectionTemplate{Name: req.Name, Kind: req.Kind}
	for _, it := range req.Items {
		t.Items = append(t.Items, domain.TemplateItem{
			Section: it.Section, Label: it.Label, Sort: it.Sort,
		})
	}
	created, err := s.Repo.CreateTemplate(orgOf(r), t)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s *Server) handleGetTemplate(w http.ResponseWriter, r *http.Request) {
	t, err := s.Repo.GetTemplate(orgOf(r), chi.URLParam(r, "id"))
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, t)
}

func (s *Server) handleListInspections(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	list, err := s.Repo.ListInspections(orgOf(r), repo.InspectionFilter{
		BuildingID: q.Get("building_id"),
		UnitID:     q.Get("unit_id"),
		Kind:       q.Get("kind"),
		Status:     q.Get("status"),
	})
	if err != nil {
		writeServerErr(w, "list inspections", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

type inspectionReq struct {
	BuildingID   string `json:"building_id"`
	UnitID       string `json:"unit_id"`
	UnitLabel    string `json:"unit_label"`
	TemplateID   string `json:"template_id"`
	Kind         string `json:"kind"`
	ScheduledFor string `json:"scheduled_for"`
	InspectorID  string `json:"inspector_party_id"`
	Notes        string `json:"notes"`
}

func (s *Server) handleCreateInspection(w http.ResponseWriter, r *http.Request) {
	var req inspectionReq
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	i, err := s.Repo.CreateInspection(orgOf(r), domain.Inspection{
		BuildingID: req.BuildingID, UnitID: req.UnitID, TemplateID: req.TemplateID,
		Kind: req.Kind, ScheduledFor: req.ScheduledFor, InspectorID: req.InspectorID,
		Notes: req.Notes,
	}, req.UnitLabel)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, i)
}

func (s *Server) handleGetInspection(w http.ResponseWriter, r *http.Request) {
	org := orgOf(r)
	id := chi.URLParam(r, "id")
	i, err := s.Repo.GetInspection(org, id)
	if err != nil {
		writeErr(w, err)
		return
	}
	findings, err := s.Repo.ListFindings(org, id)
	if err != nil {
		writeServerErr(w, "list findings", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"inspection": i, "findings": findings})
}

func (s *Server) handleSetInspectionStatus(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Status string `json:"status"`
	}
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	i, err := s.Repo.SetInspectionStatus(orgOf(r), chi.URLParam(r, "id"), req.Status)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, i)
}

func (s *Server) handleListFindings(w http.ResponseWriter, r *http.Request) {
	list, err := s.Repo.ListFindings(orgOf(r), chi.URLParam(r, "id"))
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

type findingReq struct {
	ItemID    string `json:"item_id"`
	Label     string `json:"label"`
	Condition string `json:"condition"`
	Comment   string `json:"comment"`
	PhotoRefs string `json:"photo_refs"`
}

func (s *Server) handleAddFinding(w http.ResponseWriter, r *http.Request) {
	var req findingReq
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	f, err := s.Repo.AddFinding(orgOf(r), domain.Finding{
		InspectionID: chi.URLParam(r, "id"), ItemID: req.ItemID, Label: req.Label,
		Condition: req.Condition, Comment: req.Comment, PhotoRefs: req.PhotoRefs,
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, f)
}
