import { parseAsString } from 'nuqs/server';

export const categoryParser = parseAsString.withDefault('None');
export const itemIdParser = parseAsString;

export interface ParsedParams {
    category: string | null;
    item: string | null;
}
