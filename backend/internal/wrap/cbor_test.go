package wrap

import (
	"bytes"
	"testing"
)

// TestCanonicalEncodingByteStable proves the property the whole binding
// depends on (04-signing.md §5.1): encoding the same logical object twice —
// including rebuilding the Go map, whose iteration order Go deliberately
// randomises — produces byte-identical output every time.
func TestCanonicalEncodingByteStable(t *testing.T) {
	build := func() M {
		return M{
			5: "1784500000000-0000-abcdef",
			1: uint64(0),
			4: []byte{0xaa, 0xbb, 0xcc},
			2: uint64(1),
			15: M{
				32: "plumbing",
				33: "za:pirb",
			},
		}
	}

	first, err := Encode(build())
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 50; i++ {
		got, err := Encode(build())
		if err != nil {
			t.Fatal(err)
		}
		if !bytes.Equal(got, first) {
			t.Fatalf("encoding run %d differs from the first:\n  first=%x\n  got=%x", i, first, got)
		}
	}
}

// TestMapKeysSortedAscending checks the encoder actually reorders keys
// (rather than merely happening to be stable because Go's map iteration was
// already sorted) by comparing against a hand-built expectation for a small
// map whose insertion/iteration order is very unlikely to already be sorted.
func TestMapKeysSortedAscending(t *testing.T) {
	got, err := Encode(M{5: uint64(1), 1: uint64(1), 3: uint64(1)})
	if err != nil {
		t.Fatal(err)
	}
	// map(3 pairs) = 0xa3, then keys 1,3,5 each as (key byte, value byte 0x01).
	want := []byte{0xa3, 0x01, 0x01, 0x03, 0x01, 0x05, 0x01}
	if !bytes.Equal(got, want) {
		t.Fatalf("got % x, want % x", got, want)
	}
}

// TestKeyZeroForbidden: WRAP reserves key 0 as a deliberate trap for an
// encoder bug (03-wire-format.md §4.5).
func TestKeyZeroForbidden(t *testing.T) {
	_, err := Encode(M{0: "boom", 1: uint64(1)})
	if err != ErrForbiddenKey {
		t.Fatalf("got %v, want ErrForbiddenKey", err)
	}
}

// TestDecodeRoundTrip: decoding what we encoded reproduces an equivalent
// value, and canonicality passes.
func TestDecodeRoundTrip(t *testing.T) {
	enc, err := Encode(M{1: uint64(0), 2: "hello", 3: true, 4: []byte{1, 2, 3}})
	if err != nil {
		t.Fatal(err)
	}
	v, err := DecodeCBOR(enc)
	if err != nil {
		t.Fatal(err)
	}
	m, ok := v.(map[any]any)
	if !ok {
		t.Fatalf("decoded value is %T, want map[any]any", v)
	}
	if m[uint64(1)] != uint64(0) {
		t.Errorf("key 1 = %v, want uint64(0)", m[uint64(1)])
	}
	if m[uint64(2)] != "hello" {
		t.Errorf("key 2 = %v, want \"hello\"", m[uint64(2)])
	}
	if m[uint64(3)] != true {
		t.Errorf("key 3 = %v, want true", m[uint64(3)])
	}
}

// TestDecodeRejectsNonCanonical: a manually-crafted non-shortest-form integer
// (encoding 1 using the 2-byte form instead of the 1-byte direct form) must
// be rejected, per 04-signing.md §5.4 step 1 — not silently accepted and
// re-encoded.
func TestDecodeRejectsNonCanonical(t *testing.T) {
	// major type 0 (uint), additional info 24 (1-byte follows) encoding the
	// value 1 — which has a valid direct-encoded shortest form (0x01) and so
	// must never appear as 0x18 0x01.
	nonCanonical := []byte{0x18, 0x01}
	_, err := DecodeCBOR(nonCanonical)
	if err != ErrNotCanonical {
		t.Fatalf("got %v, want ErrNotCanonical", err)
	}
}

// TestDecodeRejectsTrailingBytes: extra bytes after a complete top-level
// value are a malformed message, not something to silently ignore.
func TestDecodeRejectsTrailingBytes(t *testing.T) {
	enc, err := Encode(uint64(1))
	if err != nil {
		t.Fatal(err)
	}
	_, err = DecodeCBOR(append(enc, 0xff))
	if err == nil {
		t.Fatal("expected an error for trailing bytes, got nil")
	}
}
