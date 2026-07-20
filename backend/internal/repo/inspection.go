package repo

// Inspections. Linked to a building AND a unit (§4.2), which is what makes the
// ingoing/outgoing comparison possible: the pair to compare is "the ingoing and
// the outgoing inspection of this unit", and a unit-less inspection can never
// be part of one.
//
// Scheduling is a decision the building's owning organisation is the single
// writer for (§5), so it needs no coordination with any peer.

import (
	"database/sql"
	"fmt"

	"github.com/vul-os/propfix/backend/internal/domain"
	"github.com/vul-os/propfix/backend/internal/store"
)

const inspectionCols = `id, org_id, building_id, unit_id, template_id, kind, status,
	scheduled_for, performed_at, inspector_party_id, notes, hlc, deleted, created_at`

// InspectionFilter narrows an inspection listing.
type InspectionFilter struct {
	BuildingID string
	UnitID     string
	Kind       string
	Status     string
}

// CreateInspection inserts an inspection. unitLabel, when given, resolves
// through EnsureUnit so an inspection and a job raised against the same
// physical door land on the same unit row.
func (r *Repo) CreateInspection(orgID string, i domain.Inspection, unitLabel string) (domain.Inspection, error) {
	if _, err := r.GetBuilding(orgID, i.BuildingID); err != nil {
		return domain.Inspection{}, err
	}
	if unitLabel != "" {
		u, err := r.EnsureUnit(orgID, i.BuildingID, unitLabel)
		if err != nil {
			return domain.Inspection{}, err
		}
		i.UnitID = u.ID
	}
	if i.UnitID != "" {
		if _, err := r.GetUnit(orgID, i.UnitID); err != nil {
			return domain.Inspection{}, err
		}
	}
	if i.TemplateID != "" {
		if _, err := r.GetTemplate(orgID, i.TemplateID); err != nil {
			return domain.Inspection{}, err
		}
	}

	i.OrgID = orgID
	if i.ID == "" {
		i.ID = store.NewID()
	}
	if i.Kind == "" {
		i.Kind = domain.InspectionRoutine
	}
	if i.Status == "" {
		i.Status = domain.InspectionScheduled
	}
	if i.CreatedAt == "" {
		i.CreatedAt = store.Now()
	}
	if err := i.Validate(); err != nil {
		return domain.Inspection{}, err
	}

	err := r.s.Tx(func(tx *sql.Tx) error {
		hlc, err := r.s.Journal(tx, orgID, "inspection", i.ID, i, false)
		if err != nil {
			return err
		}
		i.HLC = hlc
		_, err = tx.Exec(
			`INSERT INTO inspection (`+inspectionCols+`)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			i.ID, i.OrgID, i.BuildingID, nullable(i.UnitID), nullable(i.TemplateID),
			i.Kind, i.Status, i.ScheduledFor, i.PerformedAt, nullable(i.InspectorID),
			i.Notes, i.HLC, 0, i.CreatedAt)
		return err
	})
	if err != nil {
		return domain.Inspection{}, err
	}
	return i, nil
}

// SetInspectionStatus advances an inspection. Completing one stamps
// performed_at, because "when was this walked" is the question a deposit
// dispute turns on and reconstructing it from a findings timestamp months later
// is not the same answer.
func (r *Repo) SetInspectionStatus(orgID, id, status string) (domain.Inspection, error) {
	i, err := r.GetInspection(orgID, id)
	if err != nil {
		return domain.Inspection{}, err
	}
	i.Status = status
	if status == domain.InspectionComplete && i.PerformedAt == "" {
		i.PerformedAt = store.Now()
	}
	if err := i.Validate(); err != nil {
		return domain.Inspection{}, err
	}

	err = r.s.Tx(func(tx *sql.Tx) error {
		hlc, err := r.s.Journal(tx, orgID, "inspection", i.ID, i, false)
		if err != nil {
			return err
		}
		i.HLC = hlc
		res, err := tx.Exec(
			`UPDATE inspection SET status = ?, performed_at = ?, hlc = ?
			 WHERE id = ? AND org_id = ?`, i.Status, i.PerformedAt, i.HLC, i.ID, orgID)
		if err != nil {
			return err
		}
		if n, _ := res.RowsAffected(); n == 0 {
			return ErrNotFound
		}
		return nil
	})
	if err != nil {
		return domain.Inspection{}, err
	}
	return i, nil
}

// GetInspection returns one inspection the org owns.
func (r *Repo) GetInspection(orgID, id string) (domain.Inspection, error) {
	row := r.s.DB().QueryRow(
		`SELECT `+inspectionCols+` FROM inspection WHERE id = ? AND org_id = ? AND deleted = 0`,
		id, orgID)
	return scanInspection(row)
}

// ListInspections returns inspections the org owns, newest first.
func (r *Repo) ListInspections(orgID string, f InspectionFilter) ([]domain.Inspection, error) {
	q := `SELECT ` + inspectionCols + ` FROM inspection WHERE org_id = ? AND deleted = 0`
	args := []any{orgID}
	if f.BuildingID != "" {
		q += " AND building_id = ?"
		args = append(args, f.BuildingID)
	}
	if f.UnitID != "" {
		q += " AND unit_id = ?"
		args = append(args, f.UnitID)
	}
	if f.Kind != "" {
		q += " AND kind = ?"
		args = append(args, f.Kind)
	}
	if f.Status != "" {
		q += " AND status = ?"
		args = append(args, f.Status)
	}
	q += " ORDER BY created_at DESC, id DESC"

	rows, err := r.s.DB().Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Inspection{}
	for rows.Next() {
		i, err := scanInspection(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, i)
	}
	return out, rows.Err()
}

func scanInspection(sc scanner) (domain.Inspection, error) {
	var i domain.Inspection
	var unitID, templateID, inspector sql.NullString
	var deleted int
	err := sc.Scan(&i.ID, &i.OrgID, &i.BuildingID, &unitID, &templateID, &i.Kind, &i.Status,
		&i.ScheduledFor, &i.PerformedAt, &inspector, &i.Notes, &i.HLC, &deleted, &i.CreatedAt)
	if err == sql.ErrNoRows {
		return domain.Inspection{}, ErrNotFound
	}
	if err != nil {
		return domain.Inspection{}, fmt.Errorf("scan inspection: %w", err)
	}
	i.UnitID = nullStr(unitID)
	i.TemplateID = nullStr(templateID)
	i.InspectorID = nullStr(inspector)
	i.Deleted = deleted != 0
	return i, nil
}
