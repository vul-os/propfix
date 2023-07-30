package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
)

type BoardHandler struct {
	client *bigquery.Client
}

func NewBoardHandler(client *bigquery.Client) *BoardHandler {
	return &BoardHandler{
		client: client,
	}
}

type CommentJson struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	AvatarURL string    `json:"avatarUrl"`
	Text      string    `json:"text"`
}

type AssigneeJson struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
}

type ReporterJson struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
}

type JobJson struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	DueDate        time.Time      `json:"dueDate"`
	Priority       string         `json:"priority"`
	Description    string         `json:"description"`
	ReporterID     string         `json:"reporterId"`
	AssigneeIDs    []string       `json:"assigneeIds"`
	UnitIdentifier string         `json:"unitIdentifier"`
	BuildingID     string         `json:"buildingId"`
	Labels         []string       `json:"labels"`
	AttachmentURLs []string       `json:"attachmentUrls"`
	Cost           float64        `json:"cost"`
	CreatedAt      time.Time      `json:"createdAt"`
	Comments       []CommentJson  `json:"comments"`
	Assignees      []AssigneeJson `json:"assignees"`
	Reporter       ReporterJson   `json:"reporter"`
}

func (h *BoardHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Query the columns table
	columnsQuery := h.client.Query("SELECT id, name, jobids FROM propfix.main.columns")
	columnsIterator, err := columnsQuery.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch columns", http.StatusInternalServerError)
		return
	}

	columnsData := make(map[string]Column)
	var orderedColumns []string
	for {
		var col Column
		err := columnsIterator.Next(&col)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read columns data", http.StatusInternalServerError)
			return
		}

		// Construct the Column object
		columnData := Column{
			ID:     col.ID,
			Name:   col.Name,
			JobIDs: col.JobIDs,
		}
		columnsData[col.ID] = columnData
		orderedColumns = append(orderedColumns, col.ID)
	}

	// Sort the ordered columns to ensure consistent order
	sort.Strings(orderedColumns)

	// Query the jobs table
	jobsQuery := h.client.Query("SELECT * FROM propfix.main.jobs")
	jobsIterator, err := jobsQuery.Read(ctx)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	jobsData := make(map[string]JobJson)

	for {
		var job JobJson
		err := jobsIterator.Next(&job)
		if err == iterator.Done {
			break
		}
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}
		// Assuming the job ID is present in the task, use it as the key
		// Create a new JobJson object with the comments field
		jobWithData, err := getData(ctx, h.client, job)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to fetch job data with comments", http.StatusInternalServerError)
			return
		}

		// Add the jobWithComments to jobsData
		jobsData[job.ID] = jobWithData
	}

	// ... (existing code)

	// Marshal jobsData to JSON and send the response
	response := map[string]interface{}{
		"board": map[string]interface{}{
			"columns": columnsData,
			"jobs":    jobsData,
			"ordered": orderedColumns,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Helper function to fetch data for a given job ID
func getData(ctx context.Context, client *bigquery.Client, jobData JobJson) (JobJson, error) {
	// Fetch comments data for the given job ID
	comments, err := getComments(ctx, client, jobData.ID)
	if err != nil {
		return jobData, err
	}

	// Fetch assignees data for the given assignee IDs
	assignees, err := getAssignees(ctx, client, jobData.AssigneeIDs)
	if err != nil {
		return jobData, err
	}
	fmt.Println(assignees)
	// Fetch reporter data for the given reporter ID
	reporter, err := getReporter(ctx, client, jobData.ReporterID)
	if err != nil {
		return jobData, err
	}
	fmt.Println(reporter)

	// Populate the jobData with the fetched data
	jobData.Comments = comments
	jobData.Assignees = assignees
	jobData.Reporter = reporter

	return jobData, nil
}

// Helper function to fetch comments data for a given job ID
func getComments(ctx context.Context, client *bigquery.Client, jobID string) ([]CommentJson, error) {
	query := fmt.Sprintf(`
		SELECT
			c.id, c.text, c.createdat, c.jobid, c.memberId, m.name, m.email, m.role, m.avatarurl
		FROM
			propfix.main.comments AS c
		JOIN
			propfix.main.members AS m
		ON
			c.memberId = m.id
		WHERE
			c.jobid = '%s'
	`, jobID)

	commentQuery := client.Query(query)
	commentIterator, err := commentQuery.Read(ctx)
	if err != nil {
		return nil, err
	}

	var comments []CommentJson
	for {
		var comment CommentJson
		err := commentIterator.Next(&comment)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

// Helper function to fetch assignees data for a given list of assignee IDs
func getAssignees(ctx context.Context, client *bigquery.Client, assigneeIDs []string) ([]AssigneeJson, error) {
	// If there are no assignee IDs, return an empty slice
	if len(assigneeIDs) == 0 {
		return nil, nil
	}

	// Construct the IN clause for the assignee IDs
	assigneeIDStr := "'" + assigneeIDs[0] + "'"
	for i := 1; i < len(assigneeIDs); i++ {
		assigneeIDStr += ",'" + assigneeIDs[i] + "'"
	}

	query := fmt.Sprintf(`
		SELECT
			id, name, avatarurl
		FROM
			propfix.main.members
		WHERE
			id IN (%s)
	`, assigneeIDStr)

	assigneeQuery := client.Query(query)
	assigneeIterator, err := assigneeQuery.Read(ctx)
	if err != nil {
		return nil, err
	}

	var assignees []AssigneeJson
	for {
		var assignee AssigneeJson
		err := assigneeIterator.Next(&assignee)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		assignees = append(assignees, assignee)
	}

	return assignees, nil
}

// Helper function to fetch reporter data for a given reporter ID
func getReporter(ctx context.Context, client *bigquery.Client, reporterID string) (ReporterJson, error) {
	query := fmt.Sprintf(`
		SELECT
			id, name, avatarurl
		FROM
			propfix.main.members
		WHERE
			id = '%s'
	`, reporterID)
	fmt.Println(reporterID)
	reporterQuery := client.Query(query)
	reporterIterator, err := reporterQuery.Read(ctx)
	if err != nil {
		return ReporterJson{}, err
	}

	var reporter ReporterJson
	err = reporterIterator.Next(&reporter)

	if err != nil {
		return ReporterJson{}, err
	}

	return reporter, nil
}
