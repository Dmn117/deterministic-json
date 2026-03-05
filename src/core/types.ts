export type CanonicalMode = 'rfc8785' | 'extended';

export interface CanonicalOptions {
    mode?: CanonicalMode;
    unorderedArrays?:   boolean;
    unorderedPaths?:    Set<string>;
}


export interface CanonicalPolicy {
    allowBigInt:    boolean;
    allowDate:      boolean;
    allowBuffer:    boolean;
    allowCircular:  boolean;
}


export interface CanonicalDigest {
    canonical:  string;
    hash:       string;
}

export enum CanonicalValues {
    NULL = 'NULL',
    BOOLEAN = 'BOOLEAN',
    NUMBER = 'NUMBER',
    BIGINT = 'BIGINT',
    STRING = 'STRING',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    DATE = 'DATE',
    BUFFER = 'BUFFER',
}

export interface CanonicalContext {
    seen:       WeakMap<object, number>;
    counter:    number;
    options:    CanonicalOptions;
    policy:     CanonicalPolicy;
}


export type SerialFactory = (value: any, context: CanonicalContext, path: string) => string;

export type SerialFactories = Record<CanonicalValues, SerialFactory>;

export interface CustomType {
    name:       string;
    check:      (value: unknown) => boolean;
    factory:    SerialFactory;
}