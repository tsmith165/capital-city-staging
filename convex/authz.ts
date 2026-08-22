import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Convex functions are reachable by anyone who knows the deployment URL, which ships in the
 * client bundle. The Next proxy only guards page routes, so every function that reads or
 * writes back-office data has to check the caller itself.
 *
 * `role` on the users table is the authority. Clerk organization membership drives page
 * routing, but the data layer must not depend on the client having taken that path.
 */
async function adminUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  return user && user.role === "admin" ? user : null;
}

/** Throws for anyone who is not an admin. Use in mutations and in queries that must not degrade. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await adminUser(ctx);
  if (!user) throw new Error("Not authorized");
  return user;
}

/**
 * True when the caller is an admin. Use for reads that should render an empty admin surface
 * rather than throw while Clerk is still hydrating the token on first paint.
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx) {
  return (await adminUser(ctx)) !== null;
}
