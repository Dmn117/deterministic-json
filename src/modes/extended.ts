import type { CanonicalPolicy } from "../core/types.js";


export const extendedPolicy: CanonicalPolicy = {
    allowBigInt: true,
    allowDate: true,
    allowBuffer: true,
    allowCircular: true,
};