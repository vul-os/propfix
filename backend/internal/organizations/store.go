package organizations

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Organization struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Members        []string `json:"members"`
	PendingMembers []string `json:"pending_members"`
}

type OrganizationStore struct {
	pool *pgxpool.Pool
}

func NewOrganizationStore(pool *pgxpool.Pool) *OrganizationStore {
	return &OrganizationStore{
		pool: pool,
	}
}

func (s *OrganizationStore) CreateOrganization(org *Organization) error {
	ctx := context.Background()

	query := `
		INSERT INTO organizations (id, name, members, pending_members)
		VALUES ($1, $2, $3, $4)
	`

	_, err := s.pool.Exec(ctx, query, org.ID, org.Name, org.Members, org.PendingMembers)
	if err != nil {
		fmt.Println("Error creating organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) UpdateOrganization(org *Organization) error {
	ctx := context.Background()

	query := `
		UPDATE organizations
		SET name = $1, members = $2, pending_members = $3
		WHERE id = $4
	`

	_, err := s.pool.Exec(ctx, query, org.Name, org.Members, org.PendingMembers, org.ID)
	if err != nil {
		fmt.Println("Error updating organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) GetOrganizationByID(orgID string) (*Organization, error) {
	ctx := context.Background()

	query := `
		SELECT id, name, members, pending_members
		FROM organizations
		WHERE id = $1
	`

	var org Organization
	err := s.pool.QueryRow(ctx, query, orgID).Scan(&org.ID, &org.Name, &org.Members, &org.PendingMembers)
	if err != nil {
		fmt.Println("Error getting organization:", err)
		return nil, err
	}

	return &org, nil
}

func (s *OrganizationStore) DeleteOrganization(orgID string) error {
	ctx := context.Background()

	query := `
		DELETE FROM organizations
		WHERE id = $1
	`

	_, err := s.pool.Exec(ctx, query, orgID)
	if err != nil {
		fmt.Println("Error deleting organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) GetOrganizationIDsForUser(userID string) ([]string, error) {
	ctx := context.Background()

	query := `
		SELECT id
		FROM organizations
		WHERE $1 = ANY(members)
	`

	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		fmt.Println("Error getting organization IDs for user:", err)
		return nil, err
	}
	defer rows.Close()

	var orgIDs []string
	for rows.Next() {
		var orgID string
		err := rows.Scan(&orgID)
		if err != nil {
			fmt.Println("Error scanning organization ID:", err)
			return nil, err
		}
		orgIDs = append(orgIDs, orgID)
	}

	return orgIDs, nil
}

func (s *OrganizationStore) AddMember(orgID, userID string) error {
	ctx := context.Background()

	query := `
		UPDATE organizations
		SET members = array_append(members, $1)
		WHERE id = $2
	`

	_, err := s.pool.Exec(ctx, query, userID, orgID)
	if err != nil {
		fmt.Println("Error adding member to organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) RemoveMember(orgID, userID string) error {
	ctx := context.Background()

	query := `
		UPDATE organizations
		SET members = array_remove(members, $1)
		WHERE id = $2
	`

	_, err := s.pool.Exec(ctx, query, userID, orgID)
	if err != nil {
		fmt.Println("Error removing member from organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) AddPendingMember(orgID, email string) error {
	ctx := context.Background()

	query := `
		UPDATE organizations
		SET pending_members = array_append(pending_members, $1)
		WHERE id = $2
	`

	_, err := s.pool.Exec(ctx, query, email, orgID)
	if err != nil {
		fmt.Println("Error adding pending member to organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) RemovePendingMember(orgID, email string) error {
	ctx := context.Background()

	query := `
		UPDATE organizations
		SET pending_members = array_remove(pending_members, $1)
		WHERE id = $2
	`

	_, err := s.pool.Exec(ctx, query, email, orgID)
	if err != nil {
		fmt.Println("Error removing pending member from organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) GetAllOrganizations(userID string) ([]Organization, error) {
	ctx := context.Background()

	query := `
		SELECT id, name, members, pending_members
		FROM organizations
		WHERE $1 = ANY(members)
	`

	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		fmt.Println("Error getting all organizations:", err)
		return nil, err
	}
	defer rows.Close()

	var orgs []Organization
	for rows.Next() {
		var org Organization
		err := rows.Scan(&org.ID, &org.Name, &org.Members, &org.PendingMembers)
		if err != nil {
			fmt.Println("Error scanning organization data:", err)
			return nil, err
		}
		orgs = append(orgs, org)
	}

	return orgs, nil
}

func (s *OrganizationStore) CheckPendingMember(orgID, email string) (bool, error) {
	ctx := context.Background()

	query := `
		SELECT EXISTS(
			SELECT 1 
			FROM organizations 
			WHERE id = $1 AND $2 = ANY(pending_members)
		)
	`

	var exists bool
	err := s.pool.QueryRow(ctx, query, orgID, email).Scan(&exists)
	if err != nil {
		fmt.Println("Error checking pending member:", err)
		return false, err
	}

	return exists, nil
}

func (s *OrganizationStore) GetAllMembers(orgID string) ([]string, []string, error) {
	ctx := context.Background()

	query := `
        SELECT members, pending_members
        FROM organizations
        WHERE id = $1
    `

	var members []string
	var pendingMembers []string
	err := s.pool.QueryRow(ctx, query, orgID).Scan(&members, &pendingMembers)
	if err != nil {
		fmt.Println("Error getting members for organization:", err)
		return nil, nil, err
	}

	return members, pendingMembers, nil
}
