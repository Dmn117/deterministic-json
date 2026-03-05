import type { CanonicalOptions, CanonicalContext, CanonicalPolicy } from "./types.js";


export class Context implements CanonicalContext {

    seen = new WeakMap<object, number>();
    counter = 0;

    constructor(
        public options: CanonicalOptions, 
        public policy: CanonicalPolicy
    ) {}
}