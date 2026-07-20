package store

// HLC tests. These cover the three properties the merge order depends on:
// monotonicity, survival of a backwards wall clock, and a tie-break on author
// public key.
//
// All three are silent failures in production. A clock that goes backwards does
// not error — it just makes a tablet's writes lose to every other node's,
// forever. A tie-break that differs between two nodes does not error either —
// the two databases simply disagree about the same job and nobody finds out
// until someone compares screens.

import (
	"fmt"
	"sort"
	"strings"
	"testing"
)

const (
	authorA = "aaaa000000000000000000000000000000000000000000000000000000000001"
	authorB = "bbbb000000000000000000000000000000000000000000000000000000000002"
)

func TestHLCMonotonic(t *testing.T) {
	h := NewHLC(authorA, "")
	// A frozen clock is the hard case: every tick lands in the same
	// millisecond, so only the counter can keep the order strict.
	h.nowFn = func() int64 { return 1_700_000_000_000 }

	prev := ""
	for i := 0; i < 5000; i++ {
		ts := h.Tick()
		if ts <= prev {
			t.Fatalf("tick %d not strictly increasing: %q then %q", i, prev, ts)
		}
		prev = ts
	}
}

func TestHLCMonotonicAcrossAdvancingClock(t *testing.T) {
	h := NewHLC(authorA, "")
	now := int64(1_700_000_000_000)
	h.nowFn = func() int64 { return now }

	prev := ""
	for i := 0; i < 100; i++ {
		if i%3 == 0 {
			now += 7
		}
		ts := h.Tick()
		if ts <= prev {
			t.Fatalf("not increasing across advancing clock: %q then %q", prev, ts)
		}
		prev = ts
	}
}

// A machine reboots with a dead RTC, or NTP steps it backwards mid-shift.
// Without seeding, every write after the step would sort below writes already
// in the oplog and lose to them silently.
func TestHLCSurvivesBackwardsClock(t *testing.T) {
	h := NewHLC(authorA, "")
	now := int64(1_700_000_000_000)
	h.nowFn = func() int64 { return now }

	before := h.Tick()

	now -= 60 * 60 * 1000 // wall clock jumps back an hour
	after := h.Tick()

	if after <= before {
		t.Fatalf("backwards clock produced a stale timestamp: %q then %q", before, after)
	}
}

// Restart case: the clock is rebuilt from MAX(hlc) in the oplog, so it must
// resume above the journal even if the wall clock is behind it.
func TestHLCSeedsPastLastSeen(t *testing.T) {
	future := fmt.Sprintf("%013d-%04x-%s", int64(1_900_000_000_000), 9, authorB)

	h := NewHLC(authorA, future)
	h.nowFn = func() int64 { return 1_700_000_000_000 } // wall clock far behind

	ts := h.Tick()
	if ts <= future {
		t.Fatalf("clock seeded from oplog minted a stale stamp: seed %q, tick %q", future, ts)
	}

	ms, counter, author, ok := ParseHLC(ts)
	if !ok {
		t.Fatalf("cannot parse %q", ts)
	}
	if ms != 1_900_000_000_000 {
		t.Errorf("ms = %d, want the seeded 1900000000000", ms)
	}
	// Observe seeds the counter to 10 (one past the seed's 9); the tick then
	// takes it to 11, because the wall clock is behind the seeded millisecond
	// and only the counter can move the stamp forward.
	if counter != 11 {
		t.Errorf("counter = %d, want 11", counter)
	}
	if author != authorA {
		t.Errorf("author = %q, want the local author %q", author, authorA)
	}
}

// The tie-break is on author public key, not node id (§7). Two nodes stamping
// the same millisecond and counter must order identically on both, and that
// order must be a property of the stamp itself so it survives relaying.
func TestHLCTieBreaksOnAuthorKey(t *testing.T) {
	ha := NewHLC(authorA, "")
	hb := NewHLC(authorB, "")
	frozen := int64(1_700_000_000_000)
	ha.nowFn = func() int64 { return frozen }
	hb.nowFn = func() int64 { return frozen }

	a := ha.Tick()
	b := hb.Tick()

	if a == b {
		t.Fatal("two authors minted an identical timestamp")
	}
	// Same ms, same counter — only the author differs, so the comparison is
	// exactly the tie-break.
	msA, cA, _, _ := ParseHLC(a)
	msB, cB, _, _ := ParseHLC(b)
	if msA != msB || cA != cB {
		t.Fatalf("test setup failed to produce a real tie: %q vs %q", a, b)
	}
	if !(a < b) {
		t.Fatalf("author tie-break wrong: %q should sort before %q (authorA < authorB)", a, b)
	}

	// The order is deterministic regardless of which side does the sorting —
	// this is what makes a relayed op order the same everywhere.
	one := []string{a, b}
	other := []string{b, a}
	sort.Strings(one)
	sort.Strings(other)
	if one[0] != other[0] || one[1] != other[1] {
		t.Fatal("sorting is not deterministic across orderings")
	}
}

func TestHLCObserveFoldsRemote(t *testing.T) {
	h := NewHLC(authorA, "")
	h.nowFn = func() int64 { return 1_700_000_000_000 }

	remote := fmt.Sprintf("%013d-%04x-%s", int64(1_700_000_000_050), 3, authorB)
	h.Observe(remote)

	ts := h.Tick()
	if ts <= remote {
		t.Fatalf("tick after Observe(%q) = %q, must sort after it", remote, ts)
	}
}

func TestHLCObserveIgnoresGarbage(t *testing.T) {
	h := NewHLC(authorA, "")
	h.nowFn = func() int64 { return 1_700_000_000_000 }
	before := h.Tick()

	// Malformed input must not be able to push the clock to the year 9999 and
	// permanently poison every future stamp.
	for _, junk := range []string{"", "nonsense", "abc-def-ghi", "99999999999999999999-0001-x"} {
		h.Observe(junk)
	}
	after := h.Tick()
	if after <= before {
		t.Fatal("clock went backwards after garbage input")
	}
	ms, _, _, _ := ParseHLC(after)
	if ms != 1_700_000_000_000 {
		t.Fatalf("garbage input moved the clock to ms=%d", ms)
	}
}

func TestHLCFormat(t *testing.T) {
	h := NewHLC(authorA, "")
	h.nowFn = func() int64 { return 1_700_000_000_000 }
	ts := h.Tick()

	parts := strings.SplitN(ts, "-", 3)
	if len(parts) != 3 {
		t.Fatalf("expected 3 fields in %q", ts)
	}
	if len(parts[0]) != 13 {
		t.Errorf("ms field %q is not 13 digits — lexical sorting would break past a digit boundary", parts[0])
	}
	if len(parts[1]) != 4 {
		t.Errorf("counter field %q is not 4 hex digits", parts[1])
	}
	if parts[2] != authorA {
		t.Errorf("author field = %q, want %q", parts[2], authorA)
	}
}

func TestParseHLCRejectsMalformed(t *testing.T) {
	for _, bad := range []string{"", "a", "a-b", "notanumber-0001-key", "1700000000000-zz-key"} {
		if _, _, _, ok := ParseHLC(bad); ok {
			t.Errorf("ParseHLC(%q) should have failed", bad)
		}
	}
}
