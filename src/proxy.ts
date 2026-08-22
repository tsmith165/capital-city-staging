import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    if (req.nextUrl.pathname.startsWith('/admin')) {
        // Being bounced to the homepage gave no indication of what happened or what to do
        // next. Send people to sign in and return them to the page they asked for.
        if (!userId) {
            const signIn = new URL('/signin', req.url);
            signIn.searchParams.set('redirect_url', `${req.nextUrl.pathname}${req.nextUrl.search}`);
            return NextResponse.redirect(signIn);
        }

        const hasAdminRole = await isClerkUserIdAdmin(userId);
        if (!hasAdminRole) {
            return NextResponse.redirect(new URL('/not-authorized', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Clerk has to run on every rendered route, not just the guarded ones: the sign-in,
         * sign-up and not-authorized pages all read the session server-side, and `auth()`
         * throws outright when the middleware did not run for that request. Static files and
         * Next internals are excluded.
         */
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
