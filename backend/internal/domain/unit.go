package domain

// Unit key normalisation. This file exists because of a specific, expensive
// failure in the legacy system (§4.1).
//
// That system stored the unit as free text on the job (`unitIdentifier`) with
// no unit table, and its analytics grouped by that text. So "Flat 3A", "3A",
// "flat 3a" and "3 A" became four units. Per-unit cost — the product's main
// analytical claim, and the number a landlord uses to decide whether to
// refurbish or re-let — was fragmented across them, and nothing in the system
// looked wrong. Nobody gets an error. The report just quietly understates every
// unit by however many spellings the last three years of staff used.
//
// The fix is that identity is the normalised key and the typed text is only a
// display label. A unit is created on first use and matched by key thereafter,
// with a UNIQUE(building_id, key) index making the collapse a database
// guarantee rather than an application convention.

import (
	"errors"
	"strings"
	"unicode"
)

// ErrEmptyUnitLabel means a label normalised to nothing at all — "Flat ", "###".
// It is an error rather than a blank key because a blank key would collide with
// every other blank key in the building and merge unrelated units into one.
var ErrEmptyUnitLabel = errors.New("unit label is empty after normalisation")

// Unit scheme constants. A building's unit_scheme drives normalisation rather
// than replacing it (§4.1).
const (
	// SchemeDefault strips a leading descriptor word, so "Flat 3A" and "3A"
	// are the same unit. This is right for the overwhelming majority of
	// residential blocks, where the word is noise a person typed out of habit.
	SchemeDefault = ""

	// SchemeMixedUse keeps the descriptor as part of the key, so "Shop 1" and
	// "Flat 1" stay two units. Required for mixed-use buildings, where they
	// are genuinely different premises with different tenants — collapsing
	// them would be the same class of error in the opposite direction, and a
	// worse one, because it merges two real units' cost history.
	SchemeMixedUse = "mixed-use"

	// SchemeVerbatim normalises case and whitespace only. An escape hatch for
	// numbering conventions nobody anticipated; a building using it accepts
	// that "Flat 3A" and "3A" are two units.
	SchemeVerbatim = "verbatim"
)

// unitPrefixes are descriptor words that precede the actual identifier. They
// are dropped under SchemeDefault.
var unitPrefixes = map[string]bool{
	"flat": true, "apt": true, "apartment": true, "unit": true,
	"no": true, "num": true, "number": true, "nr": true,
	"door": true, "room": true, "rm": true,
	"shop": true, "office": true, "suite": true, "ste": true,
	"house": true, "stand": true, "erf": true, "site": true,
	"bay": true, "garage": true, "parking": true, "store": true,
}

// NormaliseUnitKey turns a typed unit label into the stable key that identifies
// the unit within its building.
//
// Under the default scheme all of "Flat 3A", "3A", "flat 3a", "3 A", "FLAT-3A"
// and "No. 3a" normalise to "3a".
func NormaliseUnitKey(scheme, label string) (string, error) {
	lowered := strings.ToLower(strings.TrimSpace(label))

	if scheme == SchemeVerbatim {
		key := strings.Join(strings.Fields(lowered), " ")
		if key == "" {
			return "", ErrEmptyUnitLabel
		}
		return key, nil
	}

	// Every non-alphanumeric rune is a separator. This is what collapses
	// "FLAT-3A", "Flat.3A", "flat/3a" and "#3a" onto the same token list —
	// punctuation in a unit identifier is always noise, never meaning.
	tokens := strings.FieldsFunc(lowered, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	if len(tokens) == 0 {
		return "", ErrEmptyUnitLabel
	}

	if scheme != SchemeMixedUse {
		// Drop leading descriptor words, but never the last token: "Flat"
		// alone as a label is a data-entry mistake, and turning it into an
		// empty key would silently merge it with every other mistake in the
		// building. Keeping it as "flat" leaves one visibly odd unit that
		// somebody can find and fix.
		for len(tokens) > 1 && unitPrefixes[tokens[0]] {
			tokens = tokens[1:]
		}
	}

	key := strings.Join(tokens, "")

	// "07" and "7" are the same door. Strip leading zeros from a key that
	// starts with digits, but never strip the whole thing away — "0" and "00"
	// are the ground-floor unit, not nothing.
	trimmed := strings.TrimLeft(key, "0")
	if trimmed == "" {
		return "0", nil
	}
	if key != trimmed && key[0] == '0' && unicode.IsDigit(rune(trimmed[0])) {
		key = trimmed
	}

	if key == "" {
		return "", ErrEmptyUnitLabel
	}
	return key, nil
}

// Unit is a real entity, not a string on a job.
type Unit struct {
	ID         string `json:"id"`
	OrgID      string `json:"org_id"`
	BuildingID string `json:"building_id"`
	Key        string `json:"key"`   // normalised identity
	Label      string `json:"label"` // as typed, for display
	HLC        string `json:"hlc"`
	Deleted    bool   `json:"deleted"`
	CreatedAt  string `json:"created_at"`
}
