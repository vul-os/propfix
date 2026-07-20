package wrap

import (
	"bytes"
	"math"
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

// TestFloatShortestForm pins RFC 8949's preferred serialization for floats
// (03-wire-format.md §4.1, §4.2.1): the encoder MUST choose the narrowest of
// half/single/double precision that represents the value exactly, never
// always emit an 8-byte double. This is the defect this branch fixes — an
// implementation that always emits doubles is byte-stable with itself but
// not with any peer that does minimise, which is exactly the interop trap
// conformance vectors exist to catch (14-conformance.md §15).
func TestFloatShortestForm(t *testing.T) {
	cases := []struct {
		name string
		v    float64
		want []byte
	}{
		// Exact in half precision (2-byte form, major 7 addl 25 = 0xf9).
		{"zero", 0, []byte{0xf9, 0x00, 0x00}},
		{"negative zero", math.Copysign(0, -1), []byte{0xf9, 0x80, 0x00}},
		{"one", 1.0, []byte{0xf9, 0x3c, 0x00}},
		{"one point five", 1.5, []byte{0xf9, 0x3e, 0x00}},
		{"negative two", -2.0, []byte{0xf9, 0xc0, 0x00}},
		{"positive infinity", math.Inf(1), []byte{0xf9, 0x7c, 0x00}},
		{"negative infinity", math.Inf(-1), []byte{0xf9, 0xfc, 0x00}},
		{"NaN canonicalised", math.NaN(), []byte{0xf9, 0x7e, 0x00}},
		// A different NaN bit pattern must ALSO canonicalise to 0x7e00 — WRAP
		// never transmits a NaN payload.
		{"NaN with payload canonicalised", math.Float64frombits(0x7ff800000000dead), []byte{0xf9, 0x7e, 0x00}},
		// Half subnormal range (smallest positive half = 2^-24).
		{"smallest half subnormal", math.Ldexp(1, -24), []byte{0xf9, 0x00, 0x01}},
		// Exact in single precision but not half (100000 exceeds half's max
		// normal ~65504): 4-byte form, major 7 addl 26 = 0xfa.
		{"one hundred thousand", 100000.0, []byte{0xfa, 0x47, 0xc3, 0x50, 0x00}},
		// Not exactly representable in either half or single (an ordinary
		// decimal fraction with no finite binary form): stays the full
		// 8-byte double, major 7 addl 27 = 0xfb.
		{"pi approx", 3.14, nil}, // length checked separately below
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Encode(c.v)
			if err != nil {
				t.Fatal(err)
			}
			if c.want != nil {
				if !bytes.Equal(got, c.want) {
					t.Fatalf("Encode(%v) = % x, want % x", c.v, got, c.want)
				}
			} else {
				if len(got) != 9 || got[0] != 0xfb {
					t.Fatalf("Encode(%v) = % x, want a 9-byte double-precision encoding (0xfb + 8 bytes)", c.v, got)
				}
			}
		})
	}
}

// TestFloatRoundTrip: every minimised width decodes back to the exact
// original value, and re-encoding the decoded value reproduces the same
// bytes — the same byte-stability guarantee TestCanonicalEncodingByteStable
// pins for the rest of the format (04-signing.md §5.1), now covering floats.
func TestFloatRoundTrip(t *testing.T) {
	values := []float64{
		0, 1, 1.5, -2, 100000.0, 3.14, -33.9, 18.4,
		math.Ldexp(1, -24), // smallest positive half subnormal
		math.Ldexp(1, 15),  // largest half exponent range boundary
		65504,              // largest half-precision normal
		math.MaxFloat32,    // exact in single, not in half
		1.0 / 3.0,          // irrational-in-binary; stays double
	}
	for _, v := range values {
		enc, err := Encode(v)
		if err != nil {
			t.Fatalf("Encode(%v): %v", v, err)
		}
		dec, err := DecodeCBOR(enc)
		if err != nil {
			t.Fatalf("DecodeCBOR(Encode(%v)) = _, %v", v, err)
		}
		got, ok := dec.(float64)
		if !ok {
			t.Fatalf("decoded %v is %T, want float64", v, dec)
		}
		if got != v {
			t.Fatalf("round trip of %v produced %v", v, got)
		}
		reenc, err := Encode(got)
		if err != nil {
			t.Fatal(err)
		}
		if !bytes.Equal(reenc, enc) {
			t.Fatalf("re-encoding the round-tripped value of %v is not byte-stable: %x != %x", v, reenc, enc)
		}
	}
}

// TestDecodeRejectsOverwideFloat: an 8-byte double encoding of a value that
// has an exact, shorter representation (here 1.5, exact in half precision)
// is well-formed CBOR but not the *canonical* encoding of that value, and
// MUST be rejected the same way a non-shortest-form integer is
// (04-signing.md §5.4 step 1, 03-wire-format.md §4.1). This is precisely the
// byte-stable-with-itself-but-not-with-a-minimising-peer trap: before this
// fix, this package would emit exactly these 9 bytes for 1.5 itself and so
// never notice it was non-minimal.
func TestDecodeRejectsOverwideFloat(t *testing.T) {
	overwide := []byte{0xfb, 0x3f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00} // 1.5 as a double
	_, err := DecodeCBOR(overwide)
	if err != ErrNotCanonical {
		t.Fatalf("got %v, want ErrNotCanonical", err)
	}
}

// TestDecodeAcceptsMinimalFloatWidths: a peer implementation that does
// minimise floats must be readable — the decoder has to understand half and
// single precision on the wire, not merely reject non-minimal doubles.
func TestDecodeAcceptsMinimalFloatWidths(t *testing.T) {
	half := []byte{0xf9, 0x3e, 0x00} // 1.5
	v, err := DecodeCBOR(half)
	if err != nil {
		t.Fatal(err)
	}
	if v != 1.5 {
		t.Fatalf("decoded half-precision 1.5 as %v", v)
	}

	single := []byte{0xfa, 0x47, 0xc3, 0x50, 0x00} // 100000.0
	v, err = DecodeCBOR(single)
	if err != nil {
		t.Fatal(err)
	}
	if v != 100000.0 {
		t.Fatalf("decoded single-precision 100000.0 as %v", v)
	}
}
