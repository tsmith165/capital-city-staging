import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isAdmin, requireAdmin } from "./authz";

// Get or create user from Clerk ID
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "customer", // Default role
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];
    return await ctx.db.query("users").order("desc").collect();
  },
});

/**
 * Role is the authority for every Convex mutation, so an admin who demotes herself loses the
 * data plane while Clerk still admits her to the shell, with no in-app way back. The two guards
 * below are the recovery path: nobody can demote themselves, and the last admin cannot be
 * demoted by anyone.
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("That user no longer exists");

    if (target.role === args.role) return;

    if (args.role === "customer") {
      if (target._id === actor._id) {
        throw new Error("You cannot remove your own admin access. Ask another admin to do it.");
      }

      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      if (admins.length <= 1) {
        throw new Error("This is the only admin account. Promote someone else first.");
      }
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});
