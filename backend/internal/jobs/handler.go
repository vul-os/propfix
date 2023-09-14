package jobs

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"firebase.google.com/go/v4/auth"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columns/columnJobLinks"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/teris-io/shortid"
)

type Job struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	OrganizationID   string    `json:"organizationId"`
	Priority         string    `json:"priority"`
	Description      string    `json:"description"`
	TenantIdentifier string    `json:"tenantIdentifier"`
	AssigneeIDs      []string  `json:"assigneeIds"`
	UnitIdentifier   string    `json:"unitIdentifier"`
	BuildingID       string    `json:"buildingId"`
	Labels           []string  `json:"labels"`
	Attachments      []string  `json:"attachments"`
	Cost             float64   `json:"cost"`
	Hours            int       `json:"hours"`
	DueDate          time.Time `json:"dueDate"`
	CreatedAt        time.Time `json:"createdAt"`
}

type adaptor struct {
	dbpool              *pgxpool.Pool
	authz               *authz.Authz
	authClient          *auth.Client
	columnJobLinksStore *columnJobLinks.Store
	labelsStore         *labels.Store
	buildingsStore      *buildings.Store
}

const Name = "Jobs"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
	authClient *auth.Client,
	cjls *columnJobLinks.Store,
	ls *labels.Store,
	bs *buildings.Store,
) *adaptor {
	return &adaptor{
		dbpool:              dbpool,
		authClient:          authClient,
		authz:               authz,
		columnJobLinksStore: cjls,
		labelsStore:         ls,
		buildingsStore:      bs,
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
	ctx := context.Background()

	accessType, err := a.authz.CheckJobPermission(r, args.ID, "jobs", "get")
	if err != nil || accessType == "" {
		return errors.New("not permitted")
	}

	sqlQuery := `
		SELECT id, name, organization_id, priority, description, tenant_identifier,
		assignee_ids, unit_identifier, building_id, labels, attachments,
		cost, hours, due_date, created_at
		FROM jobs
		WHERE id = $1
	`

	row := a.dbpool.QueryRow(ctx, sqlQuery, args.ID)

	var job Job
	err = row.Scan(
		&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
		&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
		&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
		&job.DueDate, &job.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return errors.New("Job not found")
	} else if err != nil {
		return err
	}

	result.Job = job
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
	ctx := r.Context()

	// accessType, err := a.authz.CheckJobPermission(r, args.Job.ID, "jobs", "create")
	// if err != nil || accessType == "" {
	// 	return errors.New("not permitted")
	// }

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}

	id, err := shortid.Generate()
	if err != nil {
		return err
	}

	args.Job.ID = id
	args.Job.CreatedAt = time.Now()
	args.Job.TenantIdentifier = user.ID

	sqlQuery := `
		INSERT INTO jobs (id, name, organization_id, priority, description, tenant_identifier,
		assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours,
		due_date, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = a.dbpool.Exec(ctx, sqlQuery,
		args.Job.ID, args.Job.Name, args.Job.OrganizationID, args.Job.Priority,
		args.Job.Description, args.Job.TenantIdentifier, args.Job.AssigneeIDs,
		args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.Labels,
		args.Job.Attachments, args.Job.Cost, args.Job.Hours, args.Job.DueDate,
		args.Job.CreatedAt)

	if err != nil {
		return err
	}
	// Get the ID of the first column and add the job to it
	err = a.columnJobLinksStore.AddJobToFirstColumn(args.Job.OrganizationID, args.Job.ID)
	if err != nil {
		return err
	}
	result.ID = args.Job.ID
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
	ctx := context.Background()

	ok, err := a.authz.CheckPermissionAndOrgs(r, args.Job.ID, "jobs", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	sqlQuery := `
		UPDATE jobs
		SET name = $1, organization_id = $2, priority = $3, description = $4,
		tenant_identifier = $5, assignee_ids = $6, unit_identifier = $7,
		building_id = $8, labels = $9, attachments = $10, cost = $11, hours = $12,
		due_date = $13
		WHERE id = $14
	`

	_, err = a.dbpool.Exec(ctx, sqlQuery,
		args.Job.Name, args.Job.OrganizationID, args.Job.Priority,
		args.Job.Description, args.Job.TenantIdentifier, args.Job.AssigneeIDs,
		args.Job.UnitIdentifier, args.Job.BuildingID, args.Job.Labels,
		args.Job.Attachments, args.Job.Cost, args.Job.Hours, args.Job.DueDate,
		args.Job.ID)

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
	ctx := context.Background()

	ok, err := a.authz.CheckPermissionAndOrgs(r, args.ID, "jobs", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	sqlQuery := `DELETE FROM jobs WHERE id = $1`

	_, err = a.dbpool.Exec(ctx, sqlQuery, args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

// Define the KanbanBoard struct for the response
type KanbanBoard struct {
	Columns   map[string]columnJobLinks.ColumnWithJobIds `json:"columns"`
	Jobs      map[string]Job                             `json:"jobs"`
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
	jobs, err := a.GetJobsByOrganization(identifier, hasPermissions)
	if err != nil {
		fmt.Println(err)
		return err
	}
	orgId := args.OrganizationID
	if len(orgId) == 0 && len(jobs) > 0 {
		orgId = jobs[0].OrganizationID
	} else if len(orgId) == 0 && len(jobs) == 0 {
		return nil
	}
	// Fetch columns using the ColumnsStore
	cols, err := a.columnJobLinksStore.GetAllColumns(orgId)
	if err != nil {
		fmt.Println(err)
		return err
	}

	members, err := a.GetAllMemberIDs(orgId, a.authClient)
	if err != nil {
		fmt.Println(err)
		return err
	}

	allBuildings, err := a.buildingsStore.GetAll("", 0, 0, orgId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	retBuildings := make(map[string]buildings.Building)
	for _, b := range allBuildings {
		retBuildings[b.ID] = b
	}

	allLabels, err := a.labelsStore.GetAllLabels(orgId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	retLabels := make(map[string]labels.Label)
	for _, l := range allLabels {
		retLabels[l.ID] = l
	}

	// Create a map to store jobs by their IDs
	jobsMap := make(map[string]Job)
	for _, job := range jobs {
		jobsMap[job.ID] = job
	}

	// Create a map to store columns by their IDs
	columnsMap := make(map[string]columnJobLinks.ColumnWithJobIds)
	for _, col := range cols {
		columnsMap[col.ID] = columnJobLinks.ColumnWithJobIds{
			ID:         col.ID,
			Name:       col.Name,
			JobIds:     col.JobIds,
			OrderIndex: col.OrderIndex,
		}
	}

	// Sort columns by OrderIndex
	sort.Slice(cols, func(i, j int) bool {
		return cols[i].OrderIndex < cols[j].OrderIndex
	})

	// Create an ordered list of column IDs
	var orderedColumns []string
	for _, col := range cols {
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

func (a *adaptor) GetJobsByOrganization(identifier string, permitted bool) ([]Job, error) {
	ctx := context.Background()
	fmt.Println(identifier, permitted)
	// Initialize query based on permissions
	query := ""
	if permitted {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at FROM jobs WHERE organization_id = '%s'`, identifier)
	} else {
		query = fmt.Sprintf(`SELECT id, name, organization_id, priority, description, tenant_identifier, assignee_ids, unit_identifier, building_id, labels, attachments, cost, hours, due_date, created_at FROM jobs WHERE tenant_identifier = '%s'`, identifier)
	}
	rows, err := a.dbpool.Query(ctx, query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(
			&job.ID, &job.Name, &job.OrganizationID, &job.Priority, &job.Description,
			&job.TenantIdentifier, &job.AssigneeIDs, &job.UnitIdentifier,
			&job.BuildingID, &job.Labels, &job.Attachments, &job.Cost, &job.Hours,
			&job.DueDate, &job.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Clear cost and hours if hasPermissions is false
		if !permitted {
			job.Cost = 0
			job.Hours = 0
			job.Priority = ""
		}

		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return jobs, nil
}

// TODO: Move somewhere else
func (s *adaptor) GetAllMemberIDs(organizationID string, authClient *auth.Client) (map[string]user.User, error) {
	ctx := context.Background()
	query := `
		SELECT DISTINCT unnest(members) AS unique_member_id
		FROM organizations
		WHERE id = $1
	`
	rows, err := s.dbpool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, fmt.Errorf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	var memberIDs []string
	for rows.Next() {
		var memberID string
		if err := rows.Scan(&memberID); err != nil {
			return nil, fmt.Errorf("Failed to scan row: %v", err)
		}
		memberIDs = append(memberIDs, memberID)
	}
	fmt.Println(memberIDs)

	users := make(map[string]user.User) // Initialize the map
	for _, userID := range memberIDs {
		u, err := authClient.GetUser(ctx, userID)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		name := u.DisplayName
		if name == "" {
			name = ExtractEmailUsername(u.Email)
		}
		newU := user.User{
			ID:          u.UID,
			DisplayName: name,
			Email:       u.Email,
			PhotoURL:    u.PhotoURL,
		}
		users[u.UID] = newU
	}

	return users, nil
}

// ExtractEmailUsername extracts the username from an email address
func ExtractEmailUsername(email string) string {
	if email == "" {
		return ""
	}
	// Split the email by '@' and take the first part
	splitEmail := strings.Split(email, "@")
	if len(splitEmail) == 0 {
		return ""
	}
	username := splitEmail[0]

	// Trim the spaces
	return strings.TrimSpace(username)
}
