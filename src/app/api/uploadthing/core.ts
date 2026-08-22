import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getAuth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

/**
 * Without an error formatter UploadThing collapses every server-side failure into a bare
 * "Internal Server Error" on the client. Forwarding the code, message and cause makes an upload
 * failure diagnosable from the browser without reading the server logs first.
 */
const f = createUploadthing({
    errorFormatter: (err) => {
        console.error(`[uploadthing] ${err.code}: ${err.message}`, err.cause ?? '');

        return {
            code: err.code,
            message: err.message,
            cause: err.cause instanceof Error ? err.cause.message : undefined,
        };
    },
});

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 20 } })
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req);

            if (!userId) {
                throw new UploadThingError({
                    code: 'FORBIDDEN',
                    message: 'You must be signed in as an admin to upload images.',
                });
            }

            const hasAdminRole = await isClerkUserIdAdmin(userId);
            if (!hasAdminRole) {
                throw new UploadThingError({
                    code: 'FORBIDDEN',
                    message: 'Your account does not have the admin role required to upload images.',
                });
            }

            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log('Upload complete for userId:', metadata.userId);
            console.log('file url', file.url);

            const originalFileName = file.name;
            console.log('originalFileName:', originalFileName);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId, uploadedFileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
