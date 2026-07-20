// Package wrap implements PropFix's binding to WRAP (github.com/vul-os/wrap),
// the open work-coordination protocol: object encoding, content addressing,
// signing, and the `trades/v0` mapping onto a PropFix job
// (ARCHITECTURE.md §8, docs/WRAP.md).
//
// This file is a small, self-contained deterministic CBOR (RFC 8949 §4.2.1)
// codec, hand-written rather than pulled from a general-purpose CBOR library.
// WRAP's correctness properties — the object `id` and its signature are both
// computed over these exact bytes (WRAP 04-signing.md §5.1) — depend on two
// implementations of the encoder always producing byte-identical output for
// the same object, so the encoder's rules need to be simple enough to state
// and verify rather than inherited from a library's general-purpose options.
package wrap

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"math"
	"sort"
)

// M is a WRAP integer-keyed map: the shape of the common object header and of
// Place, Window, Compensation and profile `body` maps (WRAP 02-objects.md
// §3.2–3.11). A nil-valued entry is treated as absent and omitted by the
// encoder — WRAP's MAY fields are absent, never present-with-null.
type M map[uint64]any

// RM is a WRAP text-keyed map, used only for `refs` — opaque external
// identifiers such as {"order": "BB-4417"} (WRAP 02-objects.md §3.3).
type RM map[string]any

// ErrForbiddenKey is returned when a map contains key 0, which WRAP reserves
// as a deliberate trap for an encoder bug (03-wire-format.md §4.5): it is the
// value produced when a field name fails to resolve to a registered number.
var ErrForbiddenKey = errors.New("wrap: cbor: key 0 is forbidden")

// ErrNotCanonical is returned by Decode when the input, though valid CBOR, is
// not the unique deterministic encoding of the value it represents — for
// example a non-shortest-form integer or unsorted map keys
// (03-wire-format.md §4.1, 04-signing.md §5.4 step 1).
var ErrNotCanonical = errors.New("wrap: cbor: not canonical")

func encodeHead(major byte, n uint64) []byte {
	mt := major << 5
	switch {
	case n < 24:
		return []byte{mt | byte(n)}
	case n <= 0xff:
		return []byte{mt | 24, byte(n)}
	case n <= 0xffff:
		b := make([]byte, 3)
		b[0] = mt | 25
		binary.BigEndian.PutUint16(b[1:], uint16(n))
		return b
	case n <= 0xffffffff:
		b := make([]byte, 5)
		b[0] = mt | 26
		binary.BigEndian.PutUint32(b[1:], uint32(n))
		return b
	default:
		b := make([]byte, 9)
		b[0] = mt | 27
		binary.BigEndian.PutUint64(b[1:], n)
		return b
	}
}

func tstrBytes(s string) []byte {
	return append(encodeHead(3, uint64(len(s))), s...)
}

// kv is one already-key-encoded map entry, ready to be sorted bytewise and
// written — the single mechanism behind M, RM and the generic map decode
// produces (map[any]any), so there is exactly one place that implements
// RFC 8949 §4.2.1's "sort by the bytewise lexicographic order of the encoded
// key" rule.
type kv struct {
	keyBytes []byte
	value    any
}

func encodeMapEntries(buf *bytes.Buffer, entries []kv) error {
	sort.Slice(entries, func(i, j int) bool {
		return bytes.Compare(entries[i].keyBytes, entries[j].keyBytes) < 0
	})
	buf.Write(encodeHead(5, uint64(len(entries))))
	for _, e := range entries {
		buf.Write(e.keyBytes)
		if err := encodeValue(buf, e.value); err != nil {
			return err
		}
	}
	return nil
}

func encodeValue(buf *bytes.Buffer, v any) error {
	switch x := v.(type) {
	case nil:
		buf.WriteByte(0xf6) // null: only ever reachable inside an array — map
		// builders omit a nil-valued key rather than encode it as null.
	case uint64:
		buf.Write(encodeHead(0, x))
	case int:
		return encodeValue(buf, int64(x))
	case int64:
		if x >= 0 {
			buf.Write(encodeHead(0, uint64(x)))
		} else {
			buf.Write(encodeHead(1, uint64(-1-x)))
		}
	case bool:
		if x {
			buf.WriteByte(0xf5)
		} else {
			buf.WriteByte(0xf4)
		}
	case float64:
		buf.WriteByte(0xfb)
		var b [8]byte
		binary.BigEndian.PutUint64(b[:], math.Float64bits(x))
		buf.Write(b[:])
	case []byte:
		buf.Write(encodeHead(2, uint64(len(x))))
		buf.Write(x)
	case string:
		buf.Write(tstrBytes(x))
	case []any:
		buf.Write(encodeHead(4, uint64(len(x))))
		for _, e := range x {
			if err := encodeValue(buf, e); err != nil {
				return err
			}
		}
	case M:
		entries := make([]kv, 0, len(x))
		for k, val := range x {
			if val == nil {
				continue
			}
			if k == 0 {
				return ErrForbiddenKey
			}
			entries = append(entries, kv{encodeHead(0, k), val})
		}
		return encodeMapEntries(buf, entries)
	case RM:
		entries := make([]kv, 0, len(x))
		for k, val := range x {
			if val == nil {
				continue
			}
			entries = append(entries, kv{tstrBytes(k), val})
		}
		return encodeMapEntries(buf, entries)
	case map[any]any: // the shape Decode produces, for round-trip re-encoding
		entries := make([]kv, 0, len(x))
		for k, val := range x {
			if val == nil {
				continue
			}
			switch kk := k.(type) {
			case uint64:
				if kk == 0 {
					return ErrForbiddenKey
				}
				entries = append(entries, kv{encodeHead(0, kk), val})
			case string:
				entries = append(entries, kv{tstrBytes(kk), val})
			default:
				return fmt.Errorf("wrap: cbor: unsupported map key type %T", k)
			}
		}
		return encodeMapEntries(buf, entries)
	default:
		return fmt.Errorf("wrap: cbor: unsupported value type %T", v)
	}
	return nil
}

// Encode returns the deterministic CBOR encoding of v (RFC 8949 §4.2.1): map
// keys sorted by the bytewise order of their own encoding, shortest-form
// integers, definite-length arrays and maps only. v must be M, RM, or one of
// the scalar/array/map(any) types encodeValue understands.
func Encode(v any) ([]byte, error) {
	var buf bytes.Buffer
	if err := encodeValue(&buf, v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// decoder is a cursor over a CBOR byte string. It decodes leniently — any
// well-formed CBOR value, not only canonical encodings — because canonicality
// is verified once, generically, by Decode re-encoding the result and
// comparing bytes, rather than by every individual rule being re-implemented
// on the read path.
type decoder struct {
	b []byte
	i int
}

func (d *decoder) readN(n int) ([]byte, error) {
	if n < 0 || d.i+n > len(d.b) {
		return nil, io.ErrUnexpectedEOF
	}
	b := d.b[d.i : d.i+n]
	d.i += n
	return b, nil
}

func (d *decoder) readLen(addl byte) (uint64, error) {
	switch {
	case addl < 24:
		return uint64(addl), nil
	case addl == 24:
		b, err := d.readN(1)
		if err != nil {
			return 0, err
		}
		return uint64(b[0]), nil
	case addl == 25:
		b, err := d.readN(2)
		if err != nil {
			return 0, err
		}
		return uint64(binary.BigEndian.Uint16(b)), nil
	case addl == 26:
		b, err := d.readN(4)
		if err != nil {
			return 0, err
		}
		return uint64(binary.BigEndian.Uint32(b)), nil
	case addl == 27:
		b, err := d.readN(8)
		if err != nil {
			return 0, err
		}
		return binary.BigEndian.Uint64(b), nil
	default:
		return 0, fmt.Errorf("wrap: cbor: unsupported or indefinite length (additional info %d)", addl)
	}
}

func (d *decoder) decodeValue() (any, error) {
	head, err := d.readN(1)
	if err != nil {
		return nil, err
	}
	major := head[0] >> 5
	addl := head[0] & 0x1f

	switch major {
	case 0: // unsigned int
		return d.readLen(addl)
	case 1: // negative int
		n, err := d.readLen(addl)
		if err != nil {
			return nil, err
		}
		return -1 - int64(n), nil
	case 2: // byte string
		n, err := d.readLen(addl)
		if err != nil {
			return nil, err
		}
		b, err := d.readN(int(n))
		if err != nil {
			return nil, err
		}
		out := make([]byte, len(b))
		copy(out, b)
		return out, nil
	case 3: // text string
		n, err := d.readLen(addl)
		if err != nil {
			return nil, err
		}
		b, err := d.readN(int(n))
		if err != nil {
			return nil, err
		}
		return string(b), nil
	case 4: // array
		n, err := d.readLen(addl)
		if err != nil {
			return nil, err
		}
		out := make([]any, 0, n)
		for i := uint64(0); i < n; i++ {
			v, err := d.decodeValue()
			if err != nil {
				return nil, err
			}
			out = append(out, v)
		}
		return out, nil
	case 5: // map
		n, err := d.readLen(addl)
		if err != nil {
			return nil, err
		}
		out := make(map[any]any, n)
		for i := uint64(0); i < n; i++ {
			k, err := d.decodeValue()
			if err != nil {
				return nil, err
			}
			v, err := d.decodeValue()
			if err != nil {
				return nil, err
			}
			out[k] = v
		}
		return out, nil
	case 7: // simple values and floats
		switch addl {
		case 20:
			return false, nil
		case 21:
			return true, nil
		case 22:
			return nil, nil
		case 27:
			b, err := d.readN(8)
			if err != nil {
				return nil, err
			}
			return math.Float64frombits(binary.BigEndian.Uint64(b)), nil
		default:
			return nil, fmt.Errorf("wrap: cbor: unsupported simple/float additional info %d", addl)
		}
	default:
		return nil, fmt.Errorf("wrap: cbor: unsupported major type %d", major)
	}
}

// DecodeCBOR parses b as CBOR and verifies it is the unique canonical
// encoding of the value it decodes to, per WRAP's signature-verification
// order (04-signing.md §5.4 step 1): a receiver MUST reject a non-canonical
// encoding rather than accept it and re-encode. It is verified here by doing
// exactly that check — decoding, then re-encoding the result and requiring a
// byte-for-byte match — rather than re-deriving every individual canonicality
// rule on the read path.
//
// The returned value is map[any]any for a CBOR map (keys are uint64 or
// string, matching whichever the encoder used), []any for an array, and
// uint64 / int64 / []byte / string / bool / float64 / nil for scalars.
//
// This is the byte-level primitive. Decode (object.go) is the object-level
// entry point most callers want: it parses a signed envelope, recomputes the
// id and verifies the signature on top of this.
func DecodeCBOR(b []byte) (any, error) {
	d := &decoder{b: b}
	v, err := d.decodeValue()
	if err != nil {
		return nil, err
	}
	if d.i != len(b) {
		return nil, errors.New("wrap: cbor: trailing bytes after top-level value")
	}
	re, err := Encode(v)
	if err != nil {
		return nil, err
	}
	if !bytes.Equal(re, b) {
		return nil, ErrNotCanonical
	}
	return v, nil
}

// ── typed accessors over a decoded map[any]any ─────────────────────────────

func mapGet(m map[any]any, key uint64) (any, bool) {
	v, ok := m[key]
	return v, ok
}

func getUint(m map[any]any, key uint64) (uint64, bool) {
	v, ok := mapGet(m, key)
	if !ok {
		return 0, false
	}
	n, ok := v.(uint64)
	return n, ok
}

func getBytes(m map[any]any, key uint64) ([]byte, bool) {
	v, ok := mapGet(m, key)
	if !ok {
		return nil, false
	}
	b, ok := v.([]byte)
	return b, ok
}

func getString(m map[any]any, key uint64) (string, bool) {
	v, ok := mapGet(m, key)
	if !ok {
		return "", false
	}
	s, ok := v.(string)
	return s, ok
}

func getMapField(m map[any]any, key uint64) (map[any]any, bool) {
	v, ok := mapGet(m, key)
	if !ok {
		return nil, false
	}
	mm, ok := v.(map[any]any)
	return mm, ok
}

func getArray(m map[any]any, key uint64) ([]any, bool) {
	v, ok := mapGet(m, key)
	if !ok {
		return nil, false
	}
	a, ok := v.([]any)
	return a, ok
}
