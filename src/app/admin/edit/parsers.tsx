import { parseAsString } from 'nuqs/server';

// Create parser for inventory ID
export const idParser = parseAsString.withDefault('');

// Type for parsed parameters
export type ParsedParams = {
    id: NonNullable<ReturnType<typeof idParser.parseServerSide>>;
};
