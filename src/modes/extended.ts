import type { CanonicalPolicy } from "../core/types";


export const extendedPolicy: CanonicalPolicy = {
    allowBigInt: true,
    allowDate: true,
    allowBuffer: true,
    allowCircular: true,
};