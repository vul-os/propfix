package organizations

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4/pgxpool"
)

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
		INSERT INTO organizations (id, name, members)
		VALUES ($1, $2, $3)
	`

	_, err := s.pool.Exec(ctx, query, org.ID, org.Name, org.Members)
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
		SET name = $1, members = $2
		WHERE id = $3
	`

	_, err := s.pool.Exec(ctx, query, org.Name, org.Members, org.ID)
	if err != nil {
		fmt.Println("Error updating organization:", err)
		return err
	}

	return nil
}

func (s *OrganizationStore) GetOrganizationByID(orgID string) (*Organization, error) {
	ctx := context.Background()

	query := `
		SELECT id, name, members
		FROM organizations
		WHERE id = $1
	`

	var org Organization
	err := s.pool.QueryRow(ctx, query, orgID).Scan(&org.ID, &org.Name, &org.Members)
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
