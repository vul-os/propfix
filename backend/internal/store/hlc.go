package store

// Hybrid logical clocks give PropFix a total order over writes that were made
// on machines which never spoke to each other — a contractor's tablet in a
// basement and the office laptop both stamping the same job. Wall clocks alone
// cannot do this: a tablet whose clock is three hours slow would have its edits
// silently lose to every office edit, forever, with no error anywhere.

import (
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"
)

// HLC is a hybrid logical clock. Timestamps are strings that sort lexically in
// causal order: "{unix_ms:013d}-{counter:04x}-{author_hex}".
//
// The third field is the AUTHOR's Ed25519 public key, not a node identifier.
// That is deliberate and differs from FlowStock: it keeps the order a property
// of the object itself, so an op relayed through a third node orders identically
// to one received directly, and the DMTAP-SYNC binding (§7) is lossless because
// its algebra breaks the same tie on the same value. A node-id tie-break would
// mean the built-in engine and the substrate engine could pick different
// winners from identical history.
type HLC struct {
	mu      sync.Mutex
	author  string
	lastMS  int64
	counter uint32
	nowFn   func() int64 // injectable for tests
}

func wallMS() int64 { return time.Now().UnixMilli() }

// NewHLC builds a clock stamping for author (public key hex), seeded past
// lastSeen — an existing maximum timestamp, normally MAX(hlc) from the oplog.
//
// The seeding is what makes a backwards-moving wall clock survivable: a machine
// that reboots with a dead RTC, or an NTP step backwards mid-shift, would
// otherwise mint timestamps below writes it has already journalled and quietly
// lose every subsequent edit to its own history.
func NewHLC(author, lastSeen string) *HLC {
	h := &HLC{author: author, nowFn: wallMS}
	if lastSeen != "" {
		h.Observe(lastSeen)
	}
	return h
}

// ParseHLC splits a timestamp into (unix_ms, counter, author_hex).
func ParseHLC(ts string) (ms int64, counter uint32, author string, ok bool) {
	parts := strings.SplitN(ts, "-", 3)
	if len(parts) != 3 {
		return 0, 0, "", false
	}
	m, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0, 0, "", false
	}
	c, err := strconv.ParseUint(parts[1], 16, 32)
	if err != nil {
		return 0, 0, "", false
	}
	return m, uint32(c), parts[2], true
}

// Tick mints a timestamp strictly greater than every timestamp this clock has
// minted or observed.
func (h *HLC) Tick() string {
	h.mu.Lock()
	defer h.mu.Unlock()
	now := h.nowFn()
	if now > h.lastMS {
		h.lastMS = now
		h.counter = 0
	} else {
		h.counter++
	}
	return fmt.Sprintf("%013d-%04x-%s", h.lastMS, h.counter, h.author)
}

// Observe folds a remote timestamp into the clock so future ticks sort after
// it. This is how causality crosses machines: once we have seen a peer's write,
// everything we write afterwards is ordered after it regardless of whose wall
// clock is ahead.
func (h *HLC) Observe(remote string) {
	ms, counter, _, ok := ParseHLC(remote)
	if !ok {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	if ms > h.lastMS || (ms == h.lastMS && counter >= h.counter) {
		h.lastMS = ms
		h.counter = counter + 1
	}
}
