/**
 * UploadThing surfaces most transport failures as a generic
 * `UploadThingError { code: 'INTERNAL_CLIENT_ERROR', message: 'Failed to parse response from UploadThing server' }`.
 *
 * That happens because the SDK calls `response.json()` before it checks `response.ok`, so when our own
 * `/api/uploadthing` route returns a non-JSON body (an HTML error page from a crashed or misconfigured
 * function, a proxy timeout, an auth redirect) the real HTTP status is discarded before anyone can read it.
 * These helpers recover the status and body that the SDK threw away.
 */

const UPLOADTHING_ENDPOINT = '/api/uploadthing';

/** Mirrors ERROR_CODES in @uploadthing/shared so a code can be shown alongside the status it maps to. */
const ERROR_CODE_STATUS: Record<string, number> = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    INTERNAL_CLIENT_ERROR: 500,
    TOO_LARGE: 413,
    TOO_SMALL: 400,
    TOO_MANY_FILES: 400,
    KEY_TOO_LONG: 400,
    URL_GENERATION_FAILED: 500,
    UPLOAD_FAILED: 500,
    MISSING_ENV: 500,
    INVALID_SERVER_CONFIG: 500,
    FILE_LIMIT_EXCEEDED: 500,
};

const PARSE_FAILURE_MESSAGE = 'Failed to parse response from UploadThing server';

export interface UploadErrorDetails {
    code: string;
    httpStatus?: number;
    message: string;
    /** Whether the SDK swallowed the real HTTP status because the body was not JSON. */
    responseWasNotJson: boolean;
    requestUrl?: string;
    cause?: string;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

function stringifyCause(cause: unknown): string | undefined {
    const record = asRecord(cause);
    if (!record) return typeof cause === 'string' ? cause : undefined;

    // InvalidJsonError -> { _tag: 'InvalidJson', input: requestUrl, error: SyntaxError }
    // BadRequestError  -> the parsed JSON body of a non-2xx response
    // FetchError       -> { _tag: 'FetchError', input: { url, method, ... }, error }
    const inner = record.error ?? record.message ?? record;
    if (inner instanceof Error) return `${inner.name}: ${inner.message}`;

    try {
        return JSON.stringify(inner);
    } catch {
        return String(inner);
    }
}

function extractRequestUrl(cause: unknown): string | undefined {
    const record = asRecord(cause);
    if (!record) return undefined;

    if (typeof record.input === 'string') return record.input;

    const input = asRecord(record.input);
    if (input && typeof input.url === 'string') return input.url;

    return undefined;
}

/** Pulls the useful fields out of whatever `onUploadError` handed us. */
export function describeUploadError(error: unknown): UploadErrorDetails {
    const record = asRecord(error);
    const code = typeof record?.code === 'string' ? record.code : 'UNKNOWN';
    const message = error instanceof Error ? error.message : String(error);
    const cause = record?.cause;

    return {
        code,
        httpStatus: ERROR_CODE_STATUS[code],
        message,
        responseWasNotJson: message === PARSE_FAILURE_MESSAGE,
        requestUrl: extractRequestUrl(cause),
        cause: stringifyCause(cause),
    };
}

/**
 * Re-requests our own upload route to recover the status and body the SDK discarded.
 * Only worth doing when the SDK could not parse the response.
 */
export async function probeUploadEndpoint(): Promise<{ status: number; contentType: string; bodyPreview: string } | undefined> {
    try {
        const response = await fetch(UPLOADTHING_ENDPOINT, { method: 'GET', cache: 'no-store' });
        const body = await response.text();

        return {
            status: response.status,
            contentType: response.headers.get('content-type') ?? 'unknown',
            bodyPreview: body.slice(0, 300),
        };
    } catch {
        return undefined;
    }
}

/** True when the body looks like an HTML error page rather than an API response. */
function looksLikeHtml(body: string): boolean {
    return /^\s*<(!doctype|html)/i.test(body);
}

function explainStatus(status: number, contentType: string, bodyPreview: string): string {
    if (status >= 500) {
        return looksLikeHtml(bodyPreview)
            ? `The /api/uploadthing route returned HTTP ${status} with an HTML error page instead of JSON, which means the server function itself failed before UploadThing ran. Check the server logs for this route.`
            : `The /api/uploadthing route returned HTTP ${status}. Check the server logs for this route.`;
    }
    if (status === 401 || status === 403) {
        return `The /api/uploadthing route returned HTTP ${status}, so the upload was rejected before it reached UploadThing. Sign in again as an admin and retry.`;
    }
    if (status === 404) {
        return `The /api/uploadthing route returned HTTP ${status}. The upload API route is not reachable at ${UPLOADTHING_ENDPOINT}.`;
    }
    return `The /api/uploadthing route returned HTTP ${status} with content-type ${contentType}.`;
}

/**
 * Builds an operator-readable failure description. Always logs the structured details to the console,
 * and returns a string suitable for showing to the admin performing the upload.
 */
export async function formatUploadError(error: unknown): Promise<string> {
    const details = describeUploadError(error);
    const lines: string[] = [];

    if (details.responseWasNotJson) {
        const probe = await probeUploadEndpoint();

        if (probe) {
            lines.push(`Upload failed: HTTP ${probe.status}`);
            lines.push(explainStatus(probe.status, probe.contentType, probe.bodyPreview));
        } else {
            lines.push('Upload failed: the upload API could not be reached');
            lines.push(
                'The request to /api/uploadthing did not return a readable response. Check your network connection and the server logs.',
            );
        }

        lines.push(`UploadThing code: ${details.code}${details.httpStatus ? ` (${details.httpStatus})` : ''}`);
        console.error('[uploadthing] upload failed', { ...details, probe });
    } else {
        lines.push(`Upload failed: ${details.message}`);
        lines.push(`UploadThing code: ${details.code}${details.httpStatus ? ` (${details.httpStatus})` : ''}`);
        if (details.requestUrl) lines.push(`Request: ${details.requestUrl}`);
        if (details.cause) lines.push(`Cause: ${details.cause}`);
        console.error('[uploadthing] upload failed', details);
    }

    lines.push('Full details are in the browser console.');
    return lines.join('\n\n');
}

/** Convenience wrapper for `onUploadError` handlers, which cannot be async. */
export function reportUploadError(error: unknown, notify: (message: string) => void): void {
    void formatUploadError(error).then(notify);
}
