package domain

// Condition ordering is what makes "the carpet got worse" a computed fact
// rather than an inspector's opinion — see the comment on conditionRank.
// These tests pin the ranking down so a reordering (accidental or not) that
// would flip "deteriorated" and "improved" fails loudly here rather than in a
// deposit dispute.

import "testing"

func TestDeterioratedOrdersTheConditionScale(t *testing.T) {
	cases := []struct {
		from, to       string
		wantWorse      bool
		wantComparable bool
	}{
		{ConditionOK, ConditionWear, true, true},
		{ConditionWear, ConditionDamage, true, true},
		{ConditionDamage, ConditionMissing, true, true},
		{ConditionOK, ConditionMissing, true, true},
		{ConditionOK, ConditionOK, false, true},
		{ConditionDamage, ConditionOK, false, true}, // improved, not worse
		{ConditionMissing, ConditionWear, false, true},
	}
	for _, c := range cases {
		worse, comparable := Deteriorated(c.from, c.to)
		if worse != c.wantWorse || comparable != c.wantComparable {
			t.Errorf("Deteriorated(%q, %q) = (%v, %v), want (%v, %v)",
				c.from, c.to, worse, comparable, c.wantWorse, c.wantComparable)
		}
	}
}

// ConditionNA ("not applicable") is deliberately unranked. Treating it as
// either end of the scale would report a fitting removed between inspections
// as either pristine or destroyed depending on which end it landed on.
func TestDeterioratedTreatsNotApplicableAsIncomparable(t *testing.T) {
	cases := [][2]string{
		{ConditionNA, ConditionOK},
		{ConditionOK, ConditionNA},
		{ConditionNA, ConditionNA},
		{ConditionNA, ConditionDamage},
	}
	for _, c := range cases {
		_, comparable := Deteriorated(c[0], c[1])
		if comparable {
			t.Errorf("Deteriorated(%q, %q) reported comparable, want not comparable", c[0], c[1])
		}
	}
}

func TestInspectionValidateAcceptsPeriodicWithNoUnit(t *testing.T) {
	i := Inspection{BuildingID: "b1", Kind: InspectionPeriodic, Status: InspectionScheduled}
	if err := i.Validate(); err != nil {
		t.Errorf("periodic inspection with no unit rejected: %v", err)
	}
}

func TestInspectionValidateRejectsIngoingWithNoUnit(t *testing.T) {
	i := Inspection{BuildingID: "b1", Kind: InspectionIngoing, Status: InspectionScheduled}
	if err := i.Validate(); err == nil {
		t.Error("ingoing inspection with no unit was accepted")
	}
}
