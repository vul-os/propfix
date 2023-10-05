package jobs

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/columnJobLinks"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

type adaptor struct {
	store               *Store
	eventStore          *events.Store
	authz               *authz.Authz
	columnJobLinksStore *columnJobLinks.Store
}

const Name = "Jobs"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	store *Store,
	es *events.Store,
	authz *authz.Authz,
	cjls *columnJobLinks.Store,
) *adaptor {
	return &adaptor{
		store:               store,
		eventStore:          es,
		authz:               authz,
		columnJobLinksStore: cjls,
	}
}

// JSON-RPC request for getting a job
type GetJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for getting a job
type GetJobResponse struct {
	Job Job `json:"job"`
}

func (a *adaptor) GetJob(r *http.Request, args *GetJobRequest, result *GetJobResponse) error {
	ok, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "get")
	if err != nil || ok != "private" {
		return errors.New("not permitted")
	}

	// Use the jobs package to get job details
	job, err := a.store.GetJobByID(args.ID)
	if err != nil {
		return err
	}
	result.Job = *job
	return nil
}

// JSON-RPC request for creating a job
type CreateJobRequest struct {
	Job Job `json:"job"`
}

// JSON-RPC response for creating a job
type CreateJobResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateJob(r *http.Request, args *CreateJobRequest, result *CreateJobResponse) error {
	user, ok := r.Context().Value("user").(user.User)
	if !ok || user.ID == "" {
		return errors.New("not permitted")
	}

	job := &Job{
		Name:           args.Job.Name,
		OrganizationID: args.Job.OrganizationID,
		Priority:       args.Job.Priority,
		RentPaid:       args.Job.RentPaid,
		Description:    args.Job.Description,
		ReporterID:     user.ID,
		AssigneeIDs:    args.Job.AssigneeIDs,
		UnitIdentifier: args.Job.UnitIdentifier,
		BuildingID:     args.Job.BuildingID,
		LabelIDs:       args.Job.LabelIDs,
		Attachments:    args.Job.Attachments,
		Cost:           args.Job.Cost,
		Hours:          args.Job.Hours,
		DueDate:        args.Job.DueDate,
		ClosedAt:       args.Job.ClosedAt,
	}

	// Use the jobs package to create a job
	err := a.store.CreateJob(job)
	if err != nil {
		return err
	}

	// Get the ID of the first column and add the job to it
	err = a.columnJobLinksStore.AddJobToFirstColumn(job.OrganizationID, job.ID)
	if err != nil {
		return err
	}

	// Create an event for job creation
	event := events.Event{
		Type:       "CREATE",
		Visibility: "private", // You can adjust the visibility as needed
		JobID:      job.ID,
		MemberID:   user.ID,
		Data:       nil, // You can pass additional data as needed
	}

	_, _, err = a.eventStore.CreateEvent(event, user.ID)
	if err != nil {
		return err
	}

	result.ID = job.ID
	return nil
}

// JSON-RPC request for updating a job
type UpdateJobRequest struct {
	Job Job `json:"job"`
}

// JSON-RPC response for updating a job
type UpdateJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateJob(r *http.Request, args *UpdateJobRequest, result *UpdateJobResponse) error {
	ok, err := a.authz.CheckPermissionAndOrgs(r, "jobs", "update", args.Job.OrganizationID)
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	user, ok := r.Context().Value("user").(user.User)
	if !ok || user.ID == "" {
		return errors.New("not permitted")
	}

	// Use the jobs package to update a job
	err = a.store.UpdateJob(&args.Job)
	if err != nil {
		return err
	}

	// Create an event for job update
	event := events.Event{
		Type:       "UPDATE",
		Visibility: "private", // You can adjust the visibility as needed
		JobID:      args.Job.ID,
		MemberID:   user.ID,
		Data:       args.Job, // You can pass additional data as needed
	}

	_, _, err = a.eventStore.CreateEvent(event, user.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// JSON-RPC request for deleting a job
type DeleteJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for deleting a job
type DeleteJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteJob(r *http.Request, args *DeleteJobRequest, result *DeleteJobResponse) error {
	ok, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "delete")
	if err != nil || ok != "private" {
		return errors.New("not permitted")
	}

	// Use the jobs package to delete a job
	err = a.store.DeleteJob(args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// JSON-RPC request for closing a job
type CloseJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for closing a job
type CloseJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) CloseJob(r *http.Request, args *CloseJobRequest, result *CloseJobResponse) error {
	ok, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "close")
	if err != nil || ok != "private" {
		return errors.New("not permitted")
	}

	// Use the jobs package to close the job
	err = a.store.CloseJob(args.ID)
	if err != nil {
		return err
	}

	err = a.columnJobLinksStore.RemoveJobFromAllColumns(args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// JSON-RPC request for reopening a job
type ReOpenJobRequest struct {
	ID string `json:"id"`
}

// JSON-RPC response for reopening a job
type ReOpenJobResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) ReOpenJob(r *http.Request, args *ReOpenJobRequest, result *ReOpenJobResponse) error {
	ok, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "reopen")
	if err != nil || ok != "private" {
		return errors.New("not permitted")
	}
	// Use the jobs package to close the job
	j, err := a.store.GetJobByID(args.ID)
	if err != nil {
		return err
	}
	// Use the jobs package to reopen the job
	err = a.store.ReOpenJob(args.ID)
	if err != nil {
		return err
	}

	// Get the ID of the first column and add the job to it
	err = a.columnJobLinksStore.AddJobToFirstColumn(j.OrganizationID, args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}
