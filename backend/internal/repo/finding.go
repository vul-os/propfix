package repo

// Findings: append-only condition records.
//
// There is no update path, for the same reason there is none on cost_entry, but
// with a sharper edge. A finding is the evidence in a move-out damage dispute.
// If an outgoing finding could be edited after the tenant disputed it, the
// record proves nothing about what the inspector actually saw on the day — and
// the ingoing/outgoing comparison, which is this product's differentiator (§1),
// would be an argument again rather than evidence.
//
// A revision is a new finding. The comparison reads the latest per item, and
// the superseded row stays in the record.

import (
	"database/sql"
	"fmt"

	"github.com/vul-os/propfix/backend/internal/domain"
	"github.com/vul-os/propfix/backend/internal/store"
)

const findingCols = `id, org_id, inspection_id, item_id, label, condition, comment,
	photo_refs, hlc, created_at`

// AddFinding appends a finding to an inspection the org owns.
func (r *Repo) AddFinding(orgID string, f domain.Finding) (domain.Finding, error) {
	insp, err := r.GetInspection(orgID, f.InspectionID)
	if err != nil {
		return domain.Finding{}, err
	}
	f.OrgID = orgID
	if f.ID == "" {
		f.ID = store.NewID()
	}
	if f.Condition == "" {
		f.Condition = domain.ConditionOK
	}
	if f.CreatedAt == "" {
		f.CreatedAt = store.Now()
	}

	// A finding that names a template item must name one from the template the
	// inspection was actually opened with. Otherwise a comparison could pair
	// "kitchen sink" on the ingoing side with an item of the same id from a
	// different checklist entirely.
	if f.ItemID != "" {
		items, err := r.ListTemplateItems(orgID, insp.TemplateID)
		if err != nil {
			return domain.Finding{}, err
		}
		found := false
		for _, it := range items {
			if it.ID == f.ItemID {
				found = true
				if f.Label == "" {
					f.Label = it.Label
				}
				break
			}
		}
		if !found {
			return domain.Finding{}, fmt.Errorf("%w: item does not belong to this inspection's template", ErrConflict)
		}
	}

	if err := f.Validate(); err != nil {
		return domain.Finding{}, err
	}

	err = r.s.Tx(func(tx *sql.Tx) error {
		hlc, err := r.s.Journal(tx, orgID, "finding", f.ID, f, false)
		if err != nil {
			return err
		}
		f.HLC = hlc
		_, err = tx.Exec(
			`INSERT INTO finding (`+findingCols+`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			f.ID, f.OrgID, f.InspectionID, nullable(f.ItemID), f.Label, f.Condition,
			f.Comment, f.PhotoRefs, f.HLC, f.CreatedAt)
		return err
	})
	if err != nil {
		return domain.Finding{}, err
	}
	return f, nil
}

// ListFindings returns an inspection's findings oldest-first, superseded rows
// included — the audit trail is the point.
func (r *Repo) ListFindings(orgID, inspectionID string) ([]domain.Finding, error) {
	if _, err := r.GetInspection(orgID, inspectionID); err != nil {
		return nil, err
	}
	rows, err := r.s.DB().Query(
		`SELECT `+findingCols+` FROM finding WHERE org_id = ? AND inspection_id = ?
		 ORDER BY created_at ASC, id ASC`, orgID, inspectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Finding{}
	for rows.Next() {
		var f domain.Finding
		var item sql.NullString
		if err := rows.Scan(&f.ID, &f.OrgID, &f.InspectionID, &item, &f.Label, &f.Condition,
			&f.Comment, &f.PhotoRefs, &f.HLC, &f.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan finding: %w", err)
		}
		f.ItemID = nullStr(item)
		out = append(out, f)
	}
	return out, rows.Err()
}
