# deterministic-json

![npm version](https://img.shields.io/npm/v/@manrp/deterministic-json)
![node version](https://img.shields.io/node/v/@manrp/deterministic-json)
![license](https://img.shields.io/npm/l/@manrp/deterministic-json)

Deterministic canonical JSON serialization and hashing for Node.js.

`@manrp/deterministic-json` converts JavaScript values into a **stable canonical JSON representation**, ensuring that logically identical objects always produce the **same serialized output and hash**, regardless of key order.

This is useful for:

* hashing
* caching
* structural comparison
* content-addressable storage
* deterministic testing
* signing payloads

---

## Installation

```bash
npm install @manrp/deterministic-json
```

### Requirements

* Node.js **>= 20**

---

# Quick Example

```ts
import { Canonical } from "@manrp/deterministic-json";

const obj = {
  b: 2,
  a: 1
};

const canonical = Canonical.canonicalize(obj);

console.log(canonical);
```

Output

```json
{"a":1,"b":2}
```

The output is **deterministic**, meaning the same logical object always produces the same serialization.

---

# Deterministic Hashing

Objects with the same structure produce the same hash even if key order differs.

```ts
import { Canonical } from "@manrp/deterministic-json";

const obj1 = { a: 1, b: 2 };
const obj2 = { b: 2, a: 1 };

const hash1 = Canonical.hash(obj1);
const hash2 = Canonical.hash(obj2);

console.log(hash1 === hash2);
```

Output

```ts
true
```

---

# Structural Equality

You can compare objects deterministically.

```ts
import { Canonical } from "@manrp/deterministic-json";

const obj1 = { a: 1, b: 2 };
const obj2 = { b: 2, a: 1 };

const equal = Canonical.equal(obj1, obj2);

console.log(equal);
```

Output

```ts
true
```

---

# API

## `Canonical.canonicalize(value, options?)`

Serializes a JavaScript value into **canonical JSON**.

```ts
import { Canonical } from "@manrp/deterministic-json";

Canonical.canonicalize({
  z: 3,
  a: 1
});
```

Output

```json
{"a":1,"z":3}
```

---

## `Canonical.hash(value, options?)`

Generates a **deterministic hash** based on canonical serialization.

```ts
import { Canonical } from "@manrp/deterministic-json";

const hash = Canonical.hash({
  a: 1,
  b: 2
});

console.log(hash);
```

---

## `Canonical.equals(value1, value2, options?)`

Determines if two values are structurally equal.

```ts
Canonical.equals(
  { a: 1, b: 2 },
  { b: 2, a: 1 }
);
```

---

# Options

Serialization behavior can be customized.

```ts
Canonical.canonicalize(data, {
  unorderedArrays: true
});
```

### Available Options

| Option            | Description                                 |
| ----------------- | ------------------------------------------- |
| `unorderedArrays` | Sort array items to make them deterministic |
| `unorderedPaths`  | Treat specific paths as unordered arrays    |
| `policy`          | Enable extended type serialization          |

---

# Extended Types

The serializer supports additional types when enabled via policy.

| Type   | Canonical Encoding                |
| ------ | --------------------------------- |
| BigInt | `"bigint:123"`                    |
| Date   | `"date:2025-01-01T00:00:00.000Z"` |
| Buffer | `"buffer:BASE64"`                 |

Example:

```ts
import { Canonical } from "@manrp/deterministic-json";

Canonical.canonicalize(
  {
    created: new Date()
  },
  {
    policy: {
      allowDate: true
    }
  }
);
```

Output

```json
{"created":"date:2025-01-01T00:00:00.000Z"}
```

---

# Circular Structures

By default circular references are not allowed.

```ts
const obj: any = {};
obj.self = obj;

Canonical.canonicalize(obj);
```

Throws

```
TypeError: Circular structure detected
```

Circular serialization can be enabled via policy.

```ts
Canonical.canonicalize(obj, {
  policy: {
    allowCircular: true
  }
});
```

Circular references are encoded as:

```
"__ref:index"
```

---

# Deterministic Arrays

Arrays normally preserve order.

```ts
Canonical.canonicalize([3,2,1]);
```

Output

```json
[3,2,1]
```

If arrays are configured as unordered:

```ts
Canonical.canonicalize([3,2,1], {
  unorderedArrays: true
});
```

Output

```json
[1,2,3]
```

---

# Why Deterministic JSON?

Standard `JSON.stringify()` is **not deterministic** for objects.

```ts
JSON.stringify({ a:1, b:2 })
JSON.stringify({ b:2, a:1 })
```

Depending on insertion order, results may differ.

`deterministic-json` guarantees **stable canonical output**.

---

# Development

Clone the repository and install dependencies.

```bash
npm install
```

---

# License

MIT

---

# Author

Juan Manuel Romero Proa
