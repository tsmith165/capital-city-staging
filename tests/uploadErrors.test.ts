import { afterEach, describe, expect, it, vi } from 'vitest';

import { describeUploadError, formatUploadError } from '@/utils/uploads/uploadErrors';

/** Shape of the error UploadThing hands to `onUploadError`. */
class UploadThingErrorStub extends Error {
    code: string;
    cause?: unknown;

    constructor(code: string, message: string, cause?: unknown) {
        super(message);
        this.code = code;
        this.cause = cause;
    }
}

const PARSE_FAILURE = 'Failed to parse response from UploadThing server';

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('describeUploadError', () => {
    it('maps a known code to its HTTP status', () => {
        const details = describeUploadError(new UploadThingErrorStub('FORBIDDEN', 'Admin access required'));

        expect(details.code).toBe('FORBIDDEN');
        expect(details.httpStatus).toBe(403);
        expect(details.message).toBe('Admin access required');
        expect(details.responseWasNotJson).toBe(false);
    });

    it('flags the parse failure that hides the real status', () => {
        const details = describeUploadError(new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', PARSE_FAILURE));

        expect(details.responseWasNotJson).toBe(true);
    });

    it('recovers the request URL from an InvalidJson cause', () => {
        const details = describeUploadError(
            new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', PARSE_FAILURE, {
                _tag: 'InvalidJson',
                input: 'https://example.com/api/uploadthing',
                error: new SyntaxError('Unexpected token <'),
            }),
        );

        expect(details.requestUrl).toBe('https://example.com/api/uploadthing');
        expect(details.cause).toBe('SyntaxError: Unexpected token <');
    });

    it('recovers the request URL from a nested FetchError cause', () => {
        const details = describeUploadError(
            new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', 'fetch failed', {
                _tag: 'FetchError',
                input: { url: 'https://example.com/api/uploadthing', method: 'POST' },
            }),
        );

        expect(details.requestUrl).toBe('https://example.com/api/uploadthing');
    });

    it('does not throw on an unrecognised value', () => {
        const details = describeUploadError('something went wrong');

        expect(details.code).toBe('UNKNOWN');
        expect(details.httpStatus).toBeUndefined();
        expect(details.message).toBe('something went wrong');
    });
});

describe('formatUploadError', () => {
    it('reports the real status when the SDK could not parse the body', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                status: 500,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: async () => '<!DOCTYPE html><html><body>A server error has occurred</body></html>',
            }),
        );

        const message = await formatUploadError(new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', PARSE_FAILURE));

        expect(message).toContain('HTTP 500');
        expect(message).toContain('HTML error page');
        expect(message).toContain('INTERNAL_CLIENT_ERROR');
    });

    it('tells an admin to sign in again when the route rejects them', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                status: 403,
                headers: new Headers({ 'content-type': 'application/json' }),
                text: async () => '{"error":{"code":"FORBIDDEN"}}',
            }),
        );

        const message = await formatUploadError(new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', PARSE_FAILURE));

        expect(message).toContain('HTTP 403');
        expect(message).toContain('Sign in again as an admin');
    });

    it('falls back to a network message when the probe itself fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        const message = await formatUploadError(new UploadThingErrorStub('INTERNAL_CLIENT_ERROR', PARSE_FAILURE));

        expect(message).toContain('could not be reached');
    });

    it('passes a parseable error straight through without probing', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const message = await formatUploadError(new UploadThingErrorStub('TOO_LARGE', 'File exceeds the 4MB limit'));

        expect(fetchMock).not.toHaveBeenCalled();
        expect(message).toContain('File exceeds the 4MB limit');
        expect(message).toContain('TOO_LARGE (413)');
    });
});
