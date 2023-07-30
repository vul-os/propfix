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
		jobWithComments := JobJson{
			ID:             job.ID,
			Name:           job.Name,
			DueDate:        job.DueDate,
			Priority:       job.Priority,
			Description:    job.Description,
			ReporterID:     job.ReporterID,
			AssigneeIDs:    job.AssigneeIDs,
			UnitIdentifier: job.UnitIdentifier,
			BuildingID:     job.BuildingID,
			Labels:         job.Labels,
			AttachmentURLs: job.AttachmentURLs,
			Cost:           job.Cost,
			CreatedAt:      job.CreatedAt,
		}

		// Fetch comments data for the given job ID and store it in the job data
		comments, err := getCommentsForJobID(ctx, h.client, job.ID)
		if err != nil {
			fmt.Println(err)
		}

		// Update the jobWithComments with comments data
		jobWithComments.Comments = comments

		// Add the jobWithComments to jobsData
		jobsData[job.ID] = jobWithComments
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

// Helper function to fetch comments data for a given job ID
func getCommentsForJobID(ctx context.Context, client *bigquery.Client, jobID string) ([]CommentJson, error) {
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
