import { CanonicalValues, type CanonicalContext, type CustomType, type SerialFactories } from "./types";



export class Writer {

    //? Custom Types
    protected static customTypes: CustomType[] = [];


    //? Lazy factory map
    protected static factories: SerialFactories = {
        [CanonicalValues.NULL]: Writer.nullFactory,
        [CanonicalValues.BOOLEAN]: Writer.primitiveFactory,
        [CanonicalValues.NUMBER]: Writer.numberFactory,
        [CanonicalValues.BIGINT]: Writer.bigintFactory,
        [CanonicalValues.STRING]: Writer.primitiveFactory,
        [CanonicalValues.ARRAY]: Writer.arrayFactory,
        [CanonicalValues.OBJECT]: Writer.objectFactory,
        [CanonicalValues.DATE]: Writer.dateFactory,
        [CanonicalValues.BUFFER]: Writer.bufferFactory,
    }

    //? Type mapper
    protected static factoryMapper(value: unknown): CanonicalValues {
        if (value === null) return CanonicalValues.NULL;

        const type = typeof value;

        if (type === 'boolean') return CanonicalValues.BOOLEAN;
        if (type === 'number') return CanonicalValues.NUMBER;
        if (type === 'bigint') return CanonicalValues.BIGINT;
        if (type === 'string') return CanonicalValues.STRING;
        if (Array.isArray(value)) return CanonicalValues.ARRAY;
        if (value instanceof Date) return CanonicalValues.DATE;
        if (Buffer.isBuffer(value)) return CanonicalValues.BUFFER;

        if (type === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
            return CanonicalValues.OBJECT;
        }

        throw new TypeError(`Unsupported type "${type}" in canonical serialization`);
    }

    //* FACTORIES

    protected static nullFactory(_value: null, _context: CanonicalContext, _path: string): string {
        return 'null';
    }


    protected static primitiveFactory(value: number | boolean | string, _context: CanonicalContext, _path: string): string {
        return JSON.stringify(value);
    }


    protected static numberFactory(value: number, context: CanonicalContext, path: string): string {
        if (!Number.isFinite(value))
            throw new TypeError('Invalid number in canonical serialization');

        if (Object.is(value, -0))
            return "0";

        return Writer.primitiveFactory(value, context, path);
    }


    protected static bigintFactory(value: bigint, context: CanonicalContext, _path: string): string {
        if (!context.policy.allowBigInt)
            throw new TypeError('BigInt is not supported in this mode');

        return `"bigint:${value.toString()}"`;
    }


    protected static dateFactory(value: Date, context: CanonicalContext, _path: string): string {
        if (!context.policy.allowDate)
            throw new TypeError('Date is not supported in this mode');

        return `"date:${value.toISOString()}"`;
    }


    protected static bufferFactory(value: Buffer, context: CanonicalContext, _path: string): string {
        if (!context.policy.allowBuffer)
            throw new TypeError('Buffer is not supported in this mode');

        return `"buffer:${value.toString('base64')}"`;
    }


    protected static arrayFactory(value: unknown[], context: CanonicalContext, path: string): string {
        if (context.seen.has(value))
            return Writer.handleCircular(value, context, path);

        context.seen.set(value, context.counter++);

        let items = value.map((value, item) => Writer.write(value, context, `${path}[${item}]`));

        Writer.shouldSort(context, path) && items.sort();

        return `[${items.join(',')}]`;
    }


    protected static objectFactory(value: Record<string, unknown>, context: CanonicalContext, path: string): string {
        if (context.seen.has(value))
            return Writer.handleCircular(value, context, path);

        context.seen.set(value, context.counter++);

        const keys = Object.keys(value).sort();

        const props = keys.map(key => {
            const val = Writer.write(value[key], context, path ? `${path}.${key}` : key);

            return `${JSON.stringify(key)}:${val}`;
        });

        return `{${props.join(',')}}`;
    }


    //! HELPERS

    protected static shouldSort = (context: CanonicalContext, path: string): boolean => {
        return (context.options.unorderedArrays || context.options.unorderedPaths?.has(path)) ?? false;
    }


    protected static handleCircular(value: object, context: CanonicalContext, _path: string): string {
        if (!context.policy.allowCircular) 
            throw new TypeError("Circular structure detected");

        return `"__ref:${context.seen.get(value)}"`;
    }

    
    //! PUBLIC API

    public static write(value: unknown, context: CanonicalContext, path: string): string {
        const type = Writer.factoryMapper(value);
        const factory = Writer.factories[type];

        if (!factory)
            throw new TypeError(`No factory registered for type ${type}`);

        return factory.call(Writer, value, context, path);
    }
}