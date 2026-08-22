import { createRouteHandler } from 'uploadthing/next';
import type { NextRequest } from 'next/server';
import { ourFileRouter } from './core';

const handlers = createRouteHandler({
    router: ourFileRouter,
    config: {
        logLevel: 'Info',
    },
});

/**
 * The UploadThing client calls `response.json()` before it checks `response.ok`, so any handler failure that
 * escapes as an unhandled exception becomes Next's HTML 500 page and the client reports only
 * "Failed to parse response from UploadThing server". Wrapping the handlers keeps the response JSON so the
 * real code and message survive the trip to the browser.
 */
function jsonError(code: string, message: string, status: number, detail?: string) {
    return Response.json({ error: { code, message, detail } }, { status });
}

function withErrorReporting(handler: (request: NextRequest) => Promise<Response>, method: string) {
    return async (request: NextRequest): Promise<Response> => {
        if (!process.env.UPLOADTHING_TOKEN) {
            console.error(`[uploadthing] ${method} ${request.url} rejected: UPLOADTHING_TOKEN is missing`);

            return jsonError(
                'MISSING_ENV',
                'UPLOADTHING_TOKEN is not set on the server, so uploads cannot be signed.',
                500,
                'Set UPLOADTHING_TOKEN in the deployment environment using a key generated for the installed UploadThing SDK version.',
            );
        }

        try {
            return await handler(request);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[uploadthing] ${method} ${request.url} failed:`, error);

            return jsonError('INTERNAL_SERVER_ERROR', message, 500, error instanceof Error ? error.stack : undefined);
        }
    };
}

export const GET = withErrorReporting(handlers.GET, 'GET');
export const POST = withErrorReporting(handlers.POST, 'POST');
