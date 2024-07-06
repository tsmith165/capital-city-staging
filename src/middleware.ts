import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPrivateRoute = createRouteMatcher(['/admin(.*)', '/admin/inventory(.*)', '/admin/tools(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const route_is_private = isPrivateRoute(req);
    console.log('Current route: ' + req.url);
    console.log('Route is private? ' + route_is_private);

    if (route_is_private === true) {
        console.log('Route is private.  Protecting with admin role.');
        try {
            auth().protect(has => {
                return (
                  has({ role: 'org:admin' })
                )
              })
        } catch (error) {
            console.error('Error protecting route with admin role:', error);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
