package domain

// Money is int64 minor units, everywhere, with no exceptions (§3).
//
// The reason is not pedantry. A float64 cannot represent 0.1, so a schedule of
// recoverable costs summed as floats drifts by cents, and a landlord recovering
// costs from a deposit has to defend that drift to a tenant, a body corporate,
// or an ombud. "The computer rounded it" is not a defence. Integers in minor
// units have no rounding behaviour to explain: the sum of exact numbers is
// exact.
//
// There is a test (money_test.go) that fails if float64 appears on a money path
// in this package.

import (
	"errors"
	"strconv"
	"strings"
)

// Money is an amount in minor units (cents). Negative values are legal and
// meaningful: a correction is a new entry with a negative amount, never an edit
// to an existing one (§6).
type Money int64

// ErrBadAmount means a string could not be read as a decimal amount.
var ErrBadAmount = errors.New("not a valid amount")

// ParseMoney reads a decimal amount ("1234.50", "-99", "1 234,50") into minor
// units.
//
// It parses digit by digit rather than going via strconv.ParseFloat, because
// ParseFloat("1234.55") * 100 is 123454.99999999999 and truncating that loses a
// cent — the exact failure this type exists to prevent, reintroduced at the
// front door.
func ParseMoney(s string) (Money, error) {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, ",", ".")
	if s == "" {
		return 0, ErrBadAmount
	}

	neg := false
	switch s[0] {
	case '-':
		neg, s = true, s[1:]
	case '+':
		s = s[1:]
	}
	if s == "" {
		return 0, ErrBadAmount
	}

	whole, frac, hasFrac := strings.Cut(s, ".")
	if whole == "" {
		whole = "0"
	}
	if hasFrac && strings.Contains(frac, ".") {
		return 0, ErrBadAmount
	}
	// Both parts must be bare digits. strconv.ParseInt would happily accept a
	// second sign here ("--1" parses as -1 and then flips to +100), so the
	// check has to be explicit rather than delegated.
	if !allDigits(whole) || (hasFrac && !allDigits(frac)) {
		return 0, ErrBadAmount
	}

	major, err := strconv.ParseInt(whole, 10, 64)
	if err != nil {
		return 0, ErrBadAmount
	}

	// Pad or truncate to exactly two decimal places. Truncation (not rounding)
	// is deliberate: an input with more precision than the currency has is a
	// mistake at the source, and inventing a cent by rounding it up is worse
	// than dropping the noise.
	switch {
	case len(frac) > 2:
		frac = frac[:2]
	case len(frac) == 1:
		frac += "0"
	case frac == "":
		frac = "00"
	}
	minor, err := strconv.ParseInt(frac, 10, 64)
	if err != nil {
		return 0, ErrBadAmount
	}

	total := major*100 + minor
	if neg {
		total = -total
	}
	return Money(total), nil
}

// String renders minor units as a decimal string, using integer arithmetic
// only.
func (m Money) String() string {
	neg := m < 0
	v := int64(m)
	if neg {
		v = -v
	}
	out := strconv.FormatInt(v/100, 10) + "." + pad2(v%100)
	if neg {
		return "-" + out
	}
	return out
}

// allDigits reports whether s is non-empty and entirely ASCII digits.
func allDigits(s string) bool {
	if s == "" {
		return false
	}
	for i := 0; i < len(s); i++ {
		if s[i] < '0' || s[i] > '9' {
			return false
		}
	}
	return true
}

func pad2(v int64) string {
	s := strconv.FormatInt(v, 10)
	if len(s) < 2 {
		return "0" + s
	}
	return s
}
