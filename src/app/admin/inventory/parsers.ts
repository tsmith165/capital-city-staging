import { parseAsStringEnum, parseAsString } from 'nuqs/server';

// Create type-safe parsers for each param
export const categoryParser = parseAsStringEnum(['None', 'Living Room', 'Bedroom', 'Dining Room', 'Kitchen'] as const).withDefault('None');
export const itemIdParser = parseAsString.withDefault('');

// Types for the parsed parameters
export type ParsedParams = {
    category: NonNullable<ReturnType<typeof categoryParser.parseServerSide>>;
    item: NonNullable<ReturnType<typeof itemIdParser.parseServerSide>>;
};

// Update interface for props to match nuqs types
export interface SearchParamsType {
    category: 'None' | 'Living Room' | 'Bedroom' | 'Dining Room' | 'Kitchen';
    item: string;
}
