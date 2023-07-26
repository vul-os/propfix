package bi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"text/template"

	"cloud.google.com/go/bigquery"
	scraperAuth "github.com/exolutionza/propfix-backend-go/internal/auth"
)

type BigQueryProcessor struct {
	Client *bigquery.Client
}

func NewBigQueryProcessor(client *bigquery.Client) *BigQueryProcessor {
	return &BigQueryProcessor{
		Client: client,
	}
}

func (bp *BigQueryProcessor) TemplateAndExecuteOne(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Parse the request body
	var data map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Get the user ID from the authenticated user
	user, ok := r.Context().Value("user").(scraperAuth.User)
	if !ok {
		http.Error(w, "Failed to retrieve user from context", http.StatusInternalServerError)
		return
	}
	// Extract the name and template_dict from the data
	name, _ := data["name"].(string)
	templateDict, _ := data["template_dict"].(map[string]interface{})

	templateDict["userId"] = user.ID

	// Process the file contents
	fileContents := ProcessFile(name)
	if fileContents == "" {
		http.Error(w, "File does not exist", http.StatusNotFound)
		return
	}

	// Apply the template substitution
	tmpl, err := template.New("query").Parse(fileContents)
	if err != nil {
		http.Error(w, "Failed to parse query template", http.StatusInternalServerError)
		return
	}

	var queryBuilder strings.Builder
	err = tmpl.Execute(&queryBuilder, templateDict)
	if err != nil {
		http.Error(w, "Failed to execute query template", http.StatusInternalServerError)
		return
	}

	query := queryBuilder.String()
	fmt.Println(query)
	q := bp.Client.Query(query)
	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Bigquery job run", http.StatusInternalServerError)
		return
	}
	status, err := job.Wait(ctx)
	if err != nil {
		http.Error(w, fmt.Sprintf("Bigquery error run wait %s", status), http.StatusInternalServerError)
		return
	}
	it, err := job.Read(ctx)
	if err != nil {
		http.Error(w, "Bigquery job run", http.StatusInternalServerError)
		return
	}
	data, columns, err := BqSQLToJSON(it)
	type ExecuteOneResponse struct {
		Columns []string    `json:"columns"`
		Data    interface{} `json:"data"`
		Error   interface{} `json:"error"`
	}
	response := ExecuteOneResponse{
		Data:    data,
		Columns: columns,
	}
	// Set the response headers
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
