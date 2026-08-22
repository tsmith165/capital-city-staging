import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// The contact form previously only sent email. A Resend outage or the daily send cap
// silently lost the lead, so every submission is now persisted before the email is attempted.
export const createSubmission = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      message: args.message,
      createdAt: Date.now(),
      responded: false,
    });
  },
});

export const getSubmissions = query({
  args: {
    responded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.responded !== undefined) {
      return await ctx.db
        .query("contactSubmissions")
        .withIndex("by_responded", (q) => q.eq("responded", args.responded as boolean))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("contactSubmissions").withIndex("by_created").order("desc").collect();
  },
});

export const getRecentSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contactSubmissions")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 5);
  },
});

export const getNewSubmissionCount = query({
  args: {},
  handler: async (ctx) => {
    const unanswered = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_responded", (q) => q.eq("responded", false))
      .collect();

    return unanswered.length;
  },
});

export const setResponded = mutation({
  args: {
    id: v.id("contactSubmissions"),
    responded: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      responded: args.responded,
      respondedAt: args.responded ? Date.now() : undefined,
    });
  },
});

export const deleteSubmission = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
