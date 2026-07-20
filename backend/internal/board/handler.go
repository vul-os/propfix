package board

import (
	"errors"
	"fmt"
	"net/http"
	"sort"

	"firebase.google.com/go/v4/auth"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columnJobLinks"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/user"
)

type adaptor struct {
	jobStore            *jobs.Store
	authz               *authz.Authz
	authClient          *auth.Client
	columnJobLinksStore *columnJobLinks.Store
	labelsStore         *labels.Store
	buildingsStore      *buildings.Store
}

const Name = "Board"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	jobStore *jobs.Store,
	authz *authz.Authz,
	authClient *auth.Client,
	cjls *columnJobLinks.Store,
	ls *labels.Store,
	bs *buildings.Store,
) *adaptor {
	return &adaptor{
		jobStore:            jobStore,
		authClient:          authClient,
		authz:               authz,
		columnJobLinksStore: cjls,
		labelsStore:         ls,
		buildingsStore:      bs,
	}
}

// Define the KanbanBoard struct for the response
type KanbanBoard struct {
	Columns   map[string]columnJobLinks.ColumnWithJobIds `json:"columns"`
	Jobs      map[string]jobs.Job                        `json:"jobs"`
	Members   map[string]user.User                       `json:"members"`
	Labels    map[string]labels.Label                    `json:"labels"`
	Buildings map[string]buildings.Building              `json:"buildings"`
	Ordered   []string                                   `json:"ordered"`
}

// Define the GetKanbanBoardRequest struct
type GetKanbanBoardRequest struct {
	OrganizationID string `json:"organizationId"`
}

// Define the GetKanbanBoardResponse struct
type GetKanbanBoardResponse struct {
	Board KanbanBoard `json:"board"`
}

func (a *adaptor) GetKanbanBoard(r *http.Request, args *GetKanbanBoardRequest, result *GetKanbanBoardResponse) error {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}
	identifier := user.ID
	hasPermissions := false
	if args.OrganizationID != "" {
		ok, err := a.authz.CheckPermission(r, "jobs", "getall")
		if err != nil || !ok {
			return errors.New("not permitted")
		}
		identifier = args.OrganizationID
		hasPermissions = true
	}

	// Fetch jobs using the organization ID (simplified example)
	jobsList, err := a.jobStore.GetJobsByOrganization(identifier, hasPermissions)
	if err != nil {
		fmt.Println(err)
		return err
	}
	orgID := args.OrganizationID
	if len(orgID) == 0 && len(jobsList) > 0 {
		orgID = jobsList[0].OrganizationID
	} else if len(orgID) == 0 && len(jobsList) == 0 {
		return nil
	}

	// Fetch columns using the ColumnsStore
	columns, err := a.columnJobLinksStore.GetAllColumns(orgID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Fetch members
	members, err := a.jobStore.GetAllMemberIDs(orgID, a.authClient)
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Fetch buildings
	allBuildings, err := a.buildingsStore.GetAll("", 0, 0, orgID)
	if err != nil {
		fmt.Println(err)
		return err
	}
	retBuildings := make(map[string]buildings.Building)
	for _, b := range allBuildings {
		retBuildings[b.ID] = b
	}

	// Fetch labels
	allLabels, err := a.labelsStore.GetAllLabels(orgID)
	if err != nil {
		fmt.Println(err)
		return err
	}
	retLabels := make(map[string]labels.Label)
	for _, l := range allLabels {
		retLabels[l.ID] = l
	}

	// Create a map to store jobs by their IDs
	jobsMap := make(map[string]jobs.Job)
	for _, job := range jobsList {
		jobsMap[job.ID] = job
	}

	// Create a map to store columns by their IDs
	columnsMap := make(map[string]columnJobLinks.ColumnWithJobIds)
	for _, col := range columns {
		columnsMap[col.ID] = columnJobLinks.ColumnWithJobIds{
			ID:         col.ID,
			Name:       col.Name,
			JobIds:     col.JobIds,
			OrderIndex: col.OrderIndex,
		}
	}

	// Sort columns by OrderIndex
	sort.Slice(columns, func(i, j int) bool {
		return columns[i].OrderIndex < columns[j].OrderIndex
	})

	// Create an ordered list of column IDs
	var orderedColumns []string
	for _, col := range columns {
		orderedColumns = append(orderedColumns, col.ID)
	}
	fmt.Println()

	// Build the response structure
	response := GetKanbanBoardResponse{
		Board: KanbanBoard{
			Columns:   columnsMap,
			Jobs:      jobsMap,
			Ordered:   orderedColumns,
			Members:   members,
			Labels:    retLabels,
			Buildings: retBuildings,
		},
	}

	// Set the response
	*result = response
	return nil
}
