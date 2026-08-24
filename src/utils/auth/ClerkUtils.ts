async function captureClerkUserOrganizationMemberships(userId: string) {
    console.log("Capturing user's organization memberships...");
    try {
        const response = await fetch(`https://api.clerk.com/v1/users/${userId}/organization_memberships?limit=100`, {
            headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const memberships = await response.json();

        // console.log('User Memberships:', memberships.data);
        return memberships;
    } catch (error) {
        console.error('Error fetching organization memberships:', error);
        throw error;
    }
}

/**
 * Resolves admin status by asking the Clerk Backend API for the user's organisation memberships.
 *
 * `src/proxy.ts` calls this for every request under `/admin`, so each admin page load and
 * navigation costs a round trip to Clerk before anything renders. That is accepted at one operator
 * — well inside the development instance's 100 requests per 10 seconds — but it is a latency cost
 * on every request and the first limit that real load would reach. Moving the admin claim into the
 * session token would keep the check at the edge. See DEPLOYMENTS.md, "Authentication".
 */
export async function isClerkUserIdAdmin(userId: string) {
    let isAdmin = false;
    if (userId) {
        const user_organization_memberships = await captureClerkUserOrganizationMemberships(userId);
        isAdmin = user_organization_memberships.data.some(
            (membership: any) =>
                membership.organization.name === 'ADMIN' &&
                (membership.role === 'org:admin' || membership.permissions.includes('org:sys_domains:manage')),
        );
    }
    // console.log('Is user admin:', isAdmin);
    return isAdmin;
}
