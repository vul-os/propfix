package columnJobLinks

import (
	"errors"
	"net/http"
	"time"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
)

type ColumnJobLink struct {
	ID          string    `json:"id"`
	ColumnID    string    `json:"columnId"`
	JobID       string    `json:"jobId"`
	OrderIndex  int       `json:"orderIndex"`
	DateUpdated time.Time `json:"dateUpdated"`
}

type ColumnWithJobIds struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	OrderIndex int      `json:"orderIndex"`
	JobIds     []string `json:"jobIds"`
}

const Name = "ColumnJobLinks"

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

// MoveJob
type MoveJobRequest struct {
	SourceColumnId      string `json:"sourceColumnId"`
	DestinationColumnId string `json:"destinationColumnId"`
	JobID               string `json:"jobId"`
	NewOrderIndex       int    `json:"newOrderIndex"`
}

type MoveJobResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) MoveJob(r *http.Request, args *MoveJobRequest, reply *MoveJobResponse) error {
	ok, err := h.authz.CheckPermission(r, "columnjoblinks", "movejob")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.MoveJob(args.SourceColumnId, args.DestinationColumnId, args.JobID, args.NewOrderIndex)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

// AddJobToFirstColumn
type AddJobToFirstColumnRequest struct {
	OrganizationID string `json:"organizationId"`
	JobID          string `json:"jobId"`
}

type AddJobToFirstColumnResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) AddJobToFirstColumn(r *http.Request, args *AddJobToFirstColumnRequest, reply *AddJobToFirstColumnResponse) error {
	ok, err := h.authz.CheckPermissionAndOrgs(r, "columnjoblinks", "addfirstcolumn", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.AddJobToFirstColumn(args.OrganizationID, args.JobID)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

// RemoveJobs
type RemoveJobsRequest struct {
	ColumnID       string   `json:"columnId"`
	JobIDsToRemove []string `json:"jobIdsToRemove"`
}

type RemoveJobsResponse struct {
	Success bool `json:"success"`
}

func (h *adaptor) RemoveJobs(r *http.Request, args *RemoveJobsRequest, reply *RemoveJobsResponse) error {
	ok, err := h.authz.CheckPermission(r, "columnjoblinks", "removejobs")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	err = h.store.RemoveJobs(args.ColumnID, args.JobIDsToRemove)
	if err != nil {
		return err
	}

	reply.Success = true
	return nil
}

// GetAllColumnsRequest
type GetAllColumnsRequest struct {
	OrganizationID string `json:"organizationId"`
}

// GetAllColumnsResponse
type GetAllColumnsResponse struct {
	Columns []ColumnWithJobIds `json:"columns"`
}

// GetAllColumns
func (h *adaptor) GetAllColumns(r *http.Request, args *GetAllColumnsRequest, reply *GetAllColumnsResponse) error {
	// Check permission
	ok, err := h.authz.CheckPermissionAndOrgs(r, "columnjoblinks", "getall", args.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	// Fetch columns and job IDs
	columns, err := h.store.GetAllColumns(args.OrganizationID)
	if err != nil {
		return err
	}

	// Populate reply
	reply.Columns = columns

	return nil
}
