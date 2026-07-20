package domain

// Money tests, including the one ARCHITECTURE §3 promises exists: a test that
// fails if a float64 appears on a money path.

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestParseMoney(t *testing.T) {
	cases := []struct {
		in   string
		want Money
	}{
		{"0", 0},
		{"1", 100},
		{"1.5", 150},
		{"1.50", 150},
		{"1234.50", 123450},
		{"-99", -9900},
		{"-1.25", -125},
		{"1 234,50", 123450}, // South African grouping and decimal comma
		{".99", 99},
		{"+5", 500},
		{"0.01", 1},
		{"1234.567", 123456}, // excess precision is truncated, never rounded up
	}
	for _, c := range cases {
		got, err := ParseMoney(c.in)
		if err != nil {
			t.Fatalf("ParseMoney(%q): %v", c.in, err)
		}
		if got != c.want {
			t.Errorf("ParseMoney(%q) = %d, want %d", c.in, got, c.want)
		}
	}

	for _, bad := range []string{"", "abc", "1.2.3", "R50", "--1"} {
		if _, err := ParseMoney(bad); err == nil {
			t.Errorf("ParseMoney(%q) should have failed", bad)
		}
	}
}

// The exact case that motivates integer money: ParseFloat("1234.55")*100 is
// 123454.99999999999, and truncating it loses a cent.
func TestParseMoneyDoesNotLoseACent(t *testing.T) {
	got, err := ParseMoney("1234.55")
	if err != nil {
		t.Fatal(err)
	}
	if got != 123455 {
		t.Fatalf("ParseMoney(\"1234.55\") = %d, want 123455 — a float path has crept in", got)
	}
}

func TestMoneyString(t *testing.T) {
	cases := []struct {
		in   Money
		want string
	}{
		{0, "0.00"},
		{5, "0.05"},
		{100, "1.00"},
		{123450, "1234.50"},
		{-125, "-1.25"},
		{-5, "-0.05"},
	}
	for _, c := range cases {
		if got := c.in.String(); got != c.want {
			t.Errorf("Money(%d).String() = %q, want %q", int64(c.in), got, c.want)
		}
	}
}

func TestMoneyRoundTrip(t *testing.T) {
	for _, v := range []Money{0, 1, -1, 99, 100, 123456789, -123456789} {
		back, err := ParseMoney(v.String())
		if err != nil {
			t.Fatalf("ParseMoney(%q): %v", v.String(), err)
		}
		if back != v {
			t.Errorf("round trip lost value: %d → %q → %d", int64(v), v.String(), int64(back))
		}
	}
}

// TestNoFloatOnMoneyPath is the guard ARCHITECTURE §3 promises.
//
// It parses the domain package and fails if any declared field or function
// signature that names money uses float64. Lat/Lon are legitimately float64 and
// are not money, so the check is by name rather than a blanket ban on the type.
func TestNoFloatOnMoneyPath(t *testing.T) {
	moneyWords := []string{"amount", "minor", "cost", "money", "price", "total", "spend", "currency"}
	isMoneyName := func(name string) bool {
		lower := strings.ToLower(name)
		for _, w := range moneyWords {
			if strings.Contains(lower, w) {
				return true
			}
		}
		return false
	}

	fset := token.NewFileSet()
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") {
			continue
		}
		file, err := parser.ParseFile(fset, filepath.Join(".", e.Name()), nil, 0)
		if err != nil {
			t.Fatalf("parse %s: %v", e.Name(), err)
		}

		ast.Inspect(file, func(n ast.Node) bool {
			// Struct fields: Amount float64 would be the classic regression.
			if field, ok := n.(*ast.Field); ok {
				ident, isIdent := field.Type.(*ast.Ident)
				if isIdent && ident.Name == "float64" {
					for _, name := range field.Names {
						if isMoneyName(name.Name) {
							t.Errorf("%s: field %s is float64 on a money path — money is int64 minor units (ARCHITECTURE §3)",
								fset.Position(field.Pos()), name.Name)
						}
					}
				}
			}
			// Functions named for money must not return or accept float64.
			if fn, ok := n.(*ast.FuncDecl); ok && isMoneyName(fn.Name.Name) {
				ast.Inspect(fn.Type, func(inner ast.Node) bool {
					if ident, ok := inner.(*ast.Ident); ok && ident.Name == "float64" {
						t.Errorf("%s: func %s has a float64 in its signature — money is int64 minor units (ARCHITECTURE §3)",
							fset.Position(fn.Pos()), fn.Name.Name)
					}
					return true
				})
			}
			return true
		})
	}
}

func TestDeteriorated(t *testing.T) {
	worse, ok := Deteriorated(ConditionOK, ConditionDamage)
	if !ok || !worse {
		t.Error("ok → damage should be a deterioration")
	}
	worse, ok = Deteriorated(ConditionDamage, ConditionOK)
	if !ok || worse {
		t.Error("damage → ok should not be a deterioration")
	}
	worse, ok = Deteriorated(ConditionWear, ConditionWear)
	if !ok || worse {
		t.Error("unchanged condition should not be a deterioration")
	}
	// "Not applicable" is not a point on the scale, so a pair involving it is
	// not comparable rather than silently pinned to one end.
	if _, ok := Deteriorated(ConditionNA, ConditionDamage); ok {
		t.Error("na should not be comparable")
	}
	if _, ok := Deteriorated(ConditionOK, "nonsense"); ok {
		t.Error("unknown condition should not be comparable")
	}
}
