/** @type {import('next').NextConfig} */

/**
 * The only reason to authenticate on this site is the admin console, so every spelling
 * someone is likely to type lands on the one real route instead of a 404. Query strings,
 * including Clerk's `redirect_url`, are preserved by Next across a redirect.
 */
const SIGN_IN_ALIASES = ['/login', '/log-in', '/sign-in', '/sign_in', '/admin-login', '/adminlogin'];
const SIGN_OUT_ALIASES = ['/logout', '/log-out', '/sign-out', '/sign_out'];
const SIGN_UP_ALIASES = ['/register', '/sign-up', '/sign_up', '/create-account'];

const nextConfig = {
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
        ],
        minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
    },
    async redirects() {
        const alias = (sources, destination) => sources.map((source) => ({ source, destination, permanent: false }));

        return [
            ...alias(SIGN_IN_ALIASES, '/signin'),
            ...alias(SIGN_OUT_ALIASES, '/signout'),
            ...alias(SIGN_UP_ALIASES, '/signup'),
        ];
    },
};

export default nextConfig;
