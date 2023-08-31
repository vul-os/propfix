package organizations

import (
	"context"
	"errors"
	"net/http"

	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/user"

	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Organization struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

type adaptor struct {
	dbpool *pgxpool.Pool
	authz  *authz.Authz
}

const Name = "Organizations"

func (a *adaptor) Name() jsonRpcProvider.Name {
	return Name
}

func New(
	dbpool *pgxpool.Pool,
	authz *authz.Authz,
) *adaptor {
	return &adaptor{
		dbpool: dbpool,
		authz:  authz,
	}
}

type CreateOrganizationRequest struct {
	Organization Organization `json:"organization"`
}

type CreateOrganizationResponse struct {
	ID string `json:"id"`
}

func (a *adaptor) CreateOrganization(r *http.Request, args *CreateOrganizationRequest, result *CreateOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "create")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	orgID := uuid.New().String()

	ctx := context.Background()
	query := `
		INSERT INTO organizations (id, name, members)
		VALUES ($1, $2, $3)
	`

	_, err = a.dbpool.Exec(ctx, query, orgID, args.Organization.Name, args.Organization.Members)
	if err != nil {
		return err
	}

	result.ID = orgID
	return nil
}

type UpdateOrganizationRequest struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

type UpdateOrganizationResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) UpdateOrganization(r *http.Request, args *UpdateOrganizationRequest, result *UpdateOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "update")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE organizations
		SET name = $2, members = $3
		WHERE id = $1
	`

	_, err = a.dbpool.Exec(ctx, query, args.ID, args.Name, args.Members)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

type DeleteOrganizationRequest struct {
	ID string `json:"id"`
}

type DeleteOrganizationResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) DeleteOrganization(r *http.Request, args *DeleteOrganizationRequest, result *DeleteOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "delete")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		DELETE FROM organizations
		WHERE id = $1
	`

	_, err = a.dbpool.Exec(ctx, query, args.ID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

type GetOrganizationRequest struct {
	ID string `json:"id"`
}

type GetOrganizationResponse struct {
	Organization Organization `json:"organization"`
}

func (a *adaptor) GetOrganization(r *http.Request, args *GetOrganizationRequest, result *GetOrganizationResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "read")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, name, members
		FROM organizations
		WHERE id = $1
	`

	var org Organization
	row := a.dbpool.QueryRow(ctx, query, args.ID)
	err = row.Scan(&org.ID, &org.Name, &org.Members)
	if err != nil {
		return err
	}

	result.Organization = org
	return nil
}

type AddMemberRequest struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

type AddMemberResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) AddMember(r *http.Request, args *AddMemberRequest, result *AddMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "addmember")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE organizations
		SET members = array_append(members, $2)
		WHERE id = $1
	`

	_, err = a.dbpool.Exec(ctx, query, args.ID, args.UserID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

type RemoveMemberRequest struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
}

type RemoveMemberResponse struct {
	Success bool `json:"success"`
}

func (a *adaptor) RemoveMember(r *http.Request, args *RemoveMemberRequest, result *RemoveMemberResponse) error {
	ok, err := a.authz.CheckPermission(r, "organizations", "removemember")
	if err != nil || !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		UPDATE organizations
		SET members = array_remove(members, $2)
		WHERE id = $1
	`

	_, err = a.dbpool.Exec(ctx, query, args.ID, args.UserID)
	if err != nil {
		return err
	}

	result.Success = true
	return nil
}

type GetAllOrganizationsRequest struct{}

type GetAllOrganizationsResponse struct {
	Organizations []Organization `json:"organizations"`
}

func (a *adaptor) GetAllOrganizations(r *http.Request, args *GetAllOrganizationsRequest, result *GetAllOrganizationsResponse) error {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		return errors.New("not permitted")
	}

	ctx := context.Background()
	query := `
		SELECT id, name, members
		FROM organizations
		WHERE $1 = ANY(members)
	`

	rows, err := a.dbpool.Query(ctx, query, user.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var organizations []Organization
	for rows.Next() {
		var org Organization
		err := rows.Scan(&org.ID, &org.Name, &org.Members)
		if err != nil {
			return err
		}
		organizations = append(organizations, org)
	}

	result.Organizations = organizations
	return nil
}
