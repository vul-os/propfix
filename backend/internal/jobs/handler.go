package jobs

import (
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/columns/columnJobLinks"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

type adaptor struct {
	store               *Store
	authz               *authz.Authz
	columnJobLinksStore *columnJobLinks.Store
}

const Name = "Jobs"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	store *Store,
	authz *authz.Authz,
	cjls *columnJobLinks.Store,
) *adaptor {
	return &adaptor{
		store:               store,
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
	// Use the jobs package to update a job
	err = a.store.UpdateJob(&args.Job)
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
