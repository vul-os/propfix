package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
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

type JobJson struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	DueDate        time.Time     `json:"dueDate"`
	Priority       string        `json:"priority"`
	Description    string        `json:"description"`
	ReporterID     string        `json:"reporterId"`
	AssigneeIDs    []string      `json:"assigneeIds"`
	UnitIdentifier string        `json:"unitIdentifier"`
	BuildingID     string        `json:"buildingId"`
	Labels         []string      `json:"labels"`
	AttachmentURLs []string      `json:"attachmentUrls"`
	Cost           float64       `json:"cost"`
	CreatedAt      time.Time     `json:"createdAt"`
	Comments       []CommentJson `json:"comments"`
	Assignees      []Member      `json:"assignees"`
	Reporter       Member        `json:"reporter"`
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

	// Fetch the jobs
	query := h.client.Query("SELECT * FROM propfix.main.jobs")
	jobsIterator, err := query.Read(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}

	// Process the jobs and store them in a map by job ID
	jobMap := make(map[string]JobJson)
	reporterIDs := make(map[string]bool)
	assigneeIDs := make(map[string]bool)
	for {
		var job JobJson

		err := jobsIterator.Next(&job)
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to read job data", http.StatusInternalServerError)
			return
		}

		reporterIDs[job.ReporterID] = true
		for _, assigneeID := range job.AssigneeIDs {
			assigneeIDs[assigneeID] = true
		}

		jobMap[job.ID] = job
	}

	// Fetch the reporters
	reporters := fetchMembers(ctx, h.client, reporterIDs)
	if reporters == nil {
		http.Error(w, "Failed to fetch reporters", http.StatusInternalServerError)
		return
	}

	// Fetch the assignees
	assignees := fetchMembers(ctx, h.client, assigneeIDs)
	if assignees == nil {
		http.Error(w, "Failed to fetch assignees", http.StatusInternalServerError)
		return
	}

	// Update the jobs with the reporter and assignee data
	for jobID, job := range jobMap {
		job.Reporter = reporters[job.ReporterID]
		for _, assigneeID := range job.AssigneeIDs {
			job.Assignees = append(job.Assignees, assignees[assigneeID])
		}
		jobMap[jobID] = job
	}

	// Convert the job map to a slice
	var jobsData []JobJson
	for _, job := range jobMap {
		jobsData = append(jobsData, job)
	}

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

func fetchMembers(ctx context.Context, client *bigquery.Client, ids map[string]bool) map[string]Member {
	// Convert the ids map to a slice
	var idList []string
	for id := range ids {
		idList = append(idList, fmt.Sprintf("'%s'", id))
	}

	// Perform the query
	query := client.Query(fmt.Sprintf("SELECT * FROM propfix.main.members WHERE id IN (%s)", strings.Join(idList, ",")))
	memberIterator, err := query.Read(ctx)
	if err != nil {
		return nil
	}

	// Process the members and store them in a map by ID
	memberMap := make(map[string]Member)
	for {
		var member Member

		err := memberIterator.Next(&member)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil
		}

		memberMap[member.ID] = member
	}

	return memberMap
}
