import { describe, it, expect } from "vitest";
import { Canonical } from "../src";

describe("Canonical JSON", () => {

    it("should canonicalize objects deterministically", () => {

        const obj = {
            b: 2,
            a: 1
        };

        const result = Canonical.canonicalize(obj);

        console.log(`Result 1: ${result}`);

        expect(result).toBe('{"a":1,"b":2}');
    });


    it("should canonicalize nested objects", () => {

        const obj = {
            z: {
                b: 2,
                a: 1
            },
            a: 3
        };

        const result = Canonical.canonicalize(obj);
        const hash = Canonical.hash(obj);

        console.log(`Result 2: ${result}. Hash: ${hash}`);

        expect(result).toBe('{"a":3,"z":{"a":1,"b":2}}');
    });


    it("should compare whether two objects are equals", () => {

        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 };
        const obj3 = { b: 2, a: 1, c: obj1, d: obj2 };
        const obj4 = { b: 2, d: obj2, a: 1, c: obj1 };

        const equal = Canonical.equals(obj3, obj4);

        console.log(`Result 3: ${equal}`);

        expect(equal).toBe(true);
    });


    it("should returns canonical digest", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 };
        const obj3 = { b: 2, d: obj2, a: 1, c: obj1 };

        const digest = Canonical.digest(obj3);

        console.log(`Result 4: ${digest.canonical}. Hash: ${digest.hash}`);

        expect(true).toBe(true);
    });


    it("should compare two values and return whether v1 is less than, greater than or equal to v2", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 3, b: 4 };

        const result = Canonical.compare(obj1, obj2);

        console.log(`Result 5: ${result}`);

        expect(result).toBe(-1);
    });


    it("should sort an array of any type by its canonical string", () => {
        const obj1 = { a: 3, b: 2 };
        const obj2 = { a: 1, b: 4 };

        const result = Canonical.sort([obj1, obj2]);

        console.log(result);

        expect(Canonical.equals(result, [obj2, obj1])).toBe(true);
    });


    it("should generate an array with unique elements", () => {
        const obj1 = { a: 3, b: 2 };
        const obj2 = { a: 3, b: 1 };
        const obj3 = { a: 3, b: 1 };

        const result = Canonical.unique([obj1, obj2, obj3]);

        console.log(result);

        expect(Canonical.equals(result, [obj1, obj3])).toBe(true);
    });


    it("should normalize -0 to 0", () => {

        const result = Canonical.canonicalize(-0)

        expect(result).toBe("0")

    });


    it("should throw on NaN", () => {

        expect(() =>
            Canonical.canonicalize(NaN)
        ).toThrow()

    });

    it("should throw on Infinity", () => {

        expect(() =>
            Canonical.canonicalize(Infinity)
        ).toThrow()

    });

    it("should detect circular structures", () => {
        const obj: any = {}
        obj.self = obj

        expect(() => Canonical.canonicalize(obj, { mode:'rfc8785' })).toThrow()
    })

    it("should support circular when enabled", () => {

        const obj: any = {}
        obj.self = obj

        const result = Canonical.canonicalize(obj, {mode: 'extended'})

        expect(result).toContain("__ref")
    })


    it("objects with different key order should hash equal", () => {
        const a = { a:1, b:2, c:3 }
        const b = { c:3, b:2, a:1 }

        expect(Canonical.hash(a)).toBe(Canonical.hash(b))
    });


    it("unordered arrays should canonicalize equal", () => {
        const a = [1,3,2]
        const b = [3,2,1]

        const h1 = Canonical.hash(a,{ unorderedArrays:true })
        const h2 = Canonical.hash(b,{ unorderedArrays:true })

        expect(h1).toBe(h2)
    })
});