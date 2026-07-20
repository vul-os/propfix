package domain

// These tests encode the exact failure §4.1 describes. The legacy system let
// "Flat 3A", "3A", "flat 3a" and "3 A" become four units and fragmented the
// per-unit cost report across them. If any case below regresses, that bug is
// back — and it is a bug that produces plausible-looking numbers rather than an
// error, so this table is the only thing that would catch it.

import "testing"

func TestNormaliseUnitKeyCollapsesSpellings(t *testing.T) {
	// Every spelling a human might type for the same door.
	variants := []string{
		"Flat 3A", "3A", "flat 3a", "3 A", "FLAT 3A", "  Flat  3A  ",
		"flat-3a", "Flat.3A", "flat/3a", "#3A", "No. 3a", "No 3A",
		"Unit 3A", "apt 3a", "Apartment 3A", "door 3a", "3a",
	}
	for _, v := range variants {
		got, err := NormaliseUnitKey(SchemeDefault, v)
		if err != nil {
			t.Fatalf("NormaliseUnitKey(%q) returned error: %v", v, err)
		}
		if got != "3a" {
			t.Errorf("NormaliseUnitKey(%q) = %q, want %q", v, got, "3a")
		}
	}
}

func TestNormaliseUnitKeyDefaultScheme(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"12", "12"},
		{"Flat 12", "12"},
		{"07", "7"},       // leading zeros are the same door
		{"Flat 007", "7"}, //
		{"0", "0"},        // ground floor is not "nothing"
		{"00", "0"},       //
		{"GF", "gf"},      // not numeric at all
		{"Ground Floor", "groundfloor"},
		{"Unit 4B", "4b"},
		{"Shop 2", "2"},  // default scheme: descriptor is noise
		{"Flat", "flat"}, // last token is never stripped away
		{"Room 5", "5"},
		{"Suite 10", "10"},
		{"12A/B", "12ab"},
		{"Erf 1093", "1093"},
	}
	for _, c := range cases {
		got, err := NormaliseUnitKey(SchemeDefault, c.in)
		if err != nil {
			t.Fatalf("NormaliseUnitKey(%q): %v", c.in, err)
		}
		if got != c.want {
			t.Errorf("NormaliseUnitKey(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

// A mixed-use building is the case where collapsing is the WRONG answer: "Shop
// 2" and "Flat 2" are different premises with different tenants, and merging
// their cost history would be the same class of error in the other direction.
func TestNormaliseUnitKeyMixedUseKeepsDescriptor(t *testing.T) {
	shop, err := NormaliseUnitKey(SchemeMixedUse, "Shop 2")
	if err != nil {
		t.Fatal(err)
	}
	flat, err := NormaliseUnitKey(SchemeMixedUse, "Flat 2")
	if err != nil {
		t.Fatal(err)
	}
	if shop == flat {
		t.Fatalf("mixed-use scheme collapsed %q and %q onto the same key %q", "Shop 2", "Flat 2", shop)
	}
	if shop != "shop2" {
		t.Errorf("Shop 2 = %q, want shop2", shop)
	}
	if flat != "flat2" {
		t.Errorf("Flat 2 = %q, want flat2", flat)
	}
	// Case and punctuation still normalise under mixed-use.
	again, _ := NormaliseUnitKey(SchemeMixedUse, "  shop-2 ")
	if again != shop {
		t.Errorf("mixed-use failed to normalise punctuation: %q vs %q", again, shop)
	}
}

func TestNormaliseUnitKeyVerbatim(t *testing.T) {
	got, err := NormaliseUnitKey(SchemeVerbatim, "  Flat   3A ")
	if err != nil {
		t.Fatal(err)
	}
	if got != "flat 3a" {
		t.Errorf("verbatim = %q, want %q", got, "flat 3a")
	}
	// Verbatim deliberately does NOT collapse spellings.
	bare, _ := NormaliseUnitKey(SchemeVerbatim, "3A")
	if bare == got {
		t.Error("verbatim scheme should not collapse Flat 3A and 3A")
	}
}

func TestNormaliseUnitKeyRejectsEmpty(t *testing.T) {
	// A label that normalises to nothing must be an error, never a blank key:
	// blank keys would collide and merge unrelated units into one.
	for _, in := range []string{"", "   ", "###", "-", "..."} {
		if _, err := NormaliseUnitKey(SchemeDefault, in); err != ErrEmptyUnitLabel {
			t.Errorf("NormaliseUnitKey(%q) error = %v, want ErrEmptyUnitLabel", in, err)
		}
	}
	if _, err := NormaliseUnitKey(SchemeVerbatim, "  "); err != ErrEmptyUnitLabel {
		t.Errorf("verbatim empty error = %v, want ErrEmptyUnitLabel", err)
	}
}

func TestNormaliseUnitKeyIsIdempotent(t *testing.T) {
	// Normalising an already-normalised key must be a no-op, or a re-import
	// would keep producing new keys from its own output.
	for _, in := range []string{"Flat 3A", "12", "Shop 2", "GF", "0"} {
		once, err := NormaliseUnitKey(SchemeDefault, in)
		if err != nil {
			t.Fatal(err)
		}
		twice, err := NormaliseUnitKey(SchemeDefault, once)
		if err != nil {
			t.Fatal(err)
		}
		if once != twice {
			t.Errorf("not idempotent for %q: %q then %q", in, once, twice)
		}
	}
}
