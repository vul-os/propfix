package pendingMembers

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"
)

type PendingMember struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	OrganizationID string `json:"organizationId"`
	RoleID         string `json:"roleId"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewPendingMemberStore(pool *pgxpool.Pool) *Store {
	return &Store{
		pool: pool,
	}
}

func (s *Store) AddPendingMember(member PendingMember) (string, error) {
	ctx := context.Background()
	memberID := uuid.New().String()
	query := `
        INSERT INTO pending_members (id, email, organization_id, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	err := s.pool.QueryRow(ctx, query, memberID, member.Email, member.OrganizationID, member.RoleID).Scan(&memberID)
	if err != nil {
		return "", errors.New("Failed to add pending member")
	}

	return memberID, nil
}

func (s *Store) DeletePendingMember(organizationID string, email string) error {
	ctx := context.Background()
	query := `
        DELETE FROM pending_members
        WHERE organization_id = $1 AND email = $2
    `

	_, err := s.pool.Exec(ctx, query, organizationID, email)
	if err != nil {
		return errors.New("Failed to delete pending member by organization ID and email")
	}

	return nil
}

func (s *Store) GetAllPendingMembers(organizationID string) ([]PendingMember, error) {
	ctx := context.Background()
	query := `
        SELECT id, email, organization_id, role_id
        FROM pending_members
        WHERE organization_id = $1
    `

	rows, err := s.pool.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]PendingMember, 0)
	for rows.Next() {
		var member PendingMember
		err := rows.Scan(&member.ID, &member.Email, &member.OrganizationID, &member.RoleID)
		if err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	return members, nil
}

func (s *Store) GetPendingMember(organizationID string, email string) (*PendingMember, error) {
	ctx := context.Background()
	query := `
        SELECT id, email, organization_id, role_id
        FROM pending_members
        WHERE organization_id = $1 AND email = $2
    `

	var member PendingMember
	err := s.pool.QueryRow(ctx, query, organizationID, email).Scan(&member.ID, &member.Email, &member.OrganizationID, &member.RoleID)
	if err != nil {
		return nil, errors.New("Failed to retrieve pending member by organization ID and email")
	}

	return &member, nil
}
