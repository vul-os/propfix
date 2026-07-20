package api

// Report endpoints. Each one is a thin pass-through to internal/report, which
// computes every number as a SUM over the append-only ledgers (§6).
//
// The building_id query parameter here narrows a report; it does not scope it.
// Scoping is always orgOf(r), so passing another organisation's building id
// returns an empty result rather than that organisation's numbers.

import (
	"net/http"
)

func (s *Server) handleReportBuildings(w http.ResponseWriter, r *http.Request) {
	out, err := s.Reporter.ByBuilding(orgOf(r))
	if err != nil {
		writeServerErr(w, "report buildings", err)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleReportUnits(w http.ResponseWriter, r *http.Request) {
	out, err := s.Reporter.ByUnit(orgOf(r), r.URL.Query().Get("building_id"))
	if err != nil {
		writeServerErr(w, "report units", err)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleReportJobs(w http.ResponseWriter, r *http.Request) {
	out, err := s.Reporter.ByJob(orgOf(r), r.URL.Query().Get("job_id"))
	if err != nil {
		writeServerErr(w, "report jobs", err)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleReportStatus(w http.ResponseWriter, r *http.Request) {
	out, err := s.Reporter.Status(orgOf(r))
	if err != nil {
		writeServerErr(w, "report status", err)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleReportTimeline(w http.ResponseWriter, r *http.Request) {
	out, err := s.Reporter.Timeline(orgOf(r))
	if err != nil {
		writeServerErr(w, "report timeline", err)
		return
	}
	writeJSON(w, http.StatusOK, out)
}
