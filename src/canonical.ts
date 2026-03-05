import { createHash } from 'crypto';

import { Writer } from './core/writer';
import { Context } from './core/context';
import { rfc8785Policy } from './modes/rfc8785';
import { extendedPolicy } from './modes/extended';

import type { CanonicalDigest, CanonicalOptions } from './core/types';



export class Canonical {


    public static canonicalize(value: unknown, options: CanonicalOptions = {}): string {
        const mode = options.mode ?? 'extended';

        const policy = mode === 'rfc8785'
            ? rfc8785Policy
            : extendedPolicy;

        const context = new Context(
            {
                mode,
                unorderedArrays: false,
                ...options
            }, 
            policy
        );

        return Writer.write(value, context, "");
    }



    public static hash(value: unknown, options: CanonicalOptions = {}, algorithm: string = 'sha256'): string {
        const canonical = this.canonicalize(value, options);

        return createHash(algorithm).update(canonical).digest('hex');
    }


    public static equals(value1: unknown, value2: unknown, options: CanonicalOptions = {}): boolean {
        const canonical1 = this.canonicalize(value1, options);
        const canonical2 = this.canonicalize(value2, options);

        return canonical1 === canonical2;
    }


    public static compare(value1: unknown, value2: unknown, options: CanonicalOptions = {}): number {
        const canonical1 = this.canonicalize(value1, options);
        const canonical2 = this.canonicalize(value2, options);

        if (canonical1 === canonical2) return 0;

        return canonical1 < canonical2 ? -1 : 1;
    }


    public static digest(value: unknown, options: CanonicalOptions = {}, algorithm: string = 'sha256'): CanonicalDigest {
        const canonical = this.canonicalize(value, options);
        const hash = createHash(algorithm).update(canonical).digest('hex');

        return { canonical, hash };
    }


    public static sort<T>(arr: T[], options: CanonicalOptions = {}): T[] {
        return arr.sort((a, b) => this.compare(a, b, options));
    }


    public static unique<T>(arr: T[], options: CanonicalOptions = {}): T[] {
        const seen = new Set<string>();

        return arr.filter(item => {
            const canonical = this.canonicalize(item, options);

            if (seen.has(canonical)) return false;

            seen.add(canonical);
            return true;
        });
    }
}