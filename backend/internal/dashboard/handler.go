package dashboard

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"text/template"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/jackc/pgx/v4/pgxpool"
)

const Name = "Dashboard"

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

func New(dbpool *pgxpool.Pool, az *authz.Authz) *adaptor {
	return &adaptor{
		dbpool: dbpool,
		authz:  az,
	}
}

func (h *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

type ExecuteQueryRequest struct {
	Name           string                 `json:"name"`
	TemplateDict   map[string]interface{} `json:"templateDict"`
	OrganizationID string                 `json:"organizationId"`
}

type ExecuteQueryResponse struct {
	Data    map[string][]interface{} `json:"data"`
	Columns []string                 `json:"columns"`
}

func (h *adaptor) ExecuteQuery(r *http.Request, args *ExecuteQueryRequest, reply *ExecuteQueryResponse) error {
	ctx := context.Background()

	// ok, err := h.authz.CheckPermissionAndOrgs(r, "dashboard", "all", args.OrganizationID)
	// if err != nil || !ok {
	// 	return errors.New("not permitted")
	// }

	user, ok := r.Context().Value("user").(user.User)
	if !ok || user.ID == "" {
		return errors.New("not permitted")
	}

	td := args.TemplateDict
	td["userId"] = user.ID
	td["organizationId"] = args.OrganizationID

	// Process the file contents
	fileContents := ProcessFile(args.Name)
	if fileContents == "" {
		return errors.New("process query file error")
	}

	// Apply the template substitution
	tmpl, err := template.New("query").Parse(fileContents)
	if err != nil {
		return errors.New("parse query template error")
	}

	var queryBuilder strings.Builder
	err = tmpl.Execute(&queryBuilder, td)
	if err != nil {
		return errors.New("execute query template error")
	}

	query := queryBuilder.String()

	// Execute the query
	rows, err := h.dbpool.Query(ctx, query)
	if err != nil {
		return fmt.Errorf("execute SQL query error: %w", err)
	}
	defer rows.Close()

	// Fetch columns names
	var columns []string
	for _, fd := range rows.FieldDescriptions() {
		columns = append(columns, string(fd.Name))
	}

	// Create a placeholder for each column
	columnData := make(map[string][]interface{})
	for _, col := range columns {
		columnData[col] = []interface{}{}
	}

	// Fetch rows and map values
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return fmt.Errorf("fetching row values error: %w", err)
		}

		for index, value := range values {
			columnName := columns[index]
			columnData[columnName] = append(columnData[columnName], value)
		}
	}

	if rows.Err() != nil {
		return fmt.Errorf("reading rows error: %w", rows.Err())
	}

	reply.Data = columnData
	reply.Columns = columns

	return nil
}
