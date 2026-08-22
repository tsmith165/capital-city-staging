import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { isAdmin, requireAdmin } from "./authz";
import { openAssignments, syncItemCounter, syncProjectFlag } from "./availability";
import { paymentState } from "./payments";

// Get highlighted projects for portfolio
export const getHighlightedProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_highlighted", (q) => q.eq("highlighted", true))
      .collect();

    // Sort by display order and get images for each project
    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    const projectsWithImages = await Promise.all(
      sortedProjects.map(async (project) => {
        const images = await ctx.db
          .query("projectImages")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          images: images.sort((a, b) => a.displayOrder - b.displayOrder),
        };
      }),
    );

    return projectsWithImages;
  },
});

// Get all projects (admin only)
/**
 * The project list behind the catalog's "staging for" picker.
 *
 * Returns [] rather than throwing while Clerk is still handing over the token, so the picker renders
 * its empty state instead of taking the page down. Live jobs sort first because those are the ones
 * being staged; finished ones stay reachable for correcting a manifest after the fact.
 */
export const getProjectOptions = query({
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    const [projects, openRows] = await Promise.all([ctx.db.query("projects").collect(), openAssignments(ctx)]);

    const unitsByProject = new Map<Id<"projects">, number>();
    for (const row of openRows) {
      unitsByProject.set(row.projectId, (unitsByProject.get(row.projectId) ?? 0) + row.quantity);
    }

    const rank = (status: string) => (status === "active" ? 0 : status === "draft" ? 1 : 2);

    return projects
      .map((project) => ({
        _id: project._id,
        name: project.name,
        address: project.address ?? "",
        status: project.status ?? "draft",
        openUnits: unitsByProject.get(project._id) ?? 0,
      }))
      .sort((a, b) => rank(a.status) - rank(b.status) || a.name.localeCompare(b.name));
  },
});

export const getAllProjects = query({
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    return await ctx.db.query("projects").withIndex("by_order").collect();
  },
});

/**
 * The projects list, with everything the list and its detail column need in one subscription.
 *
 * The list used to render raw project rows, so the only way to learn that a job still had furniture
 * out or money outstanding was to open it. Those are the two facts worth chasing, so they belong on
 * the row.
 */
export const getProjectsOverview = query({
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    const projects = await ctx.db.query("projects").withIndex("by_order").collect();

    return await Promise.all(
      projects.map(async (project) => {
        const [open, images] = await Promise.all([
          ctx.db
            .query("projectInventory")
            .withIndex("by_active", (q) => q.eq("projectId", project._id).eq("returnedAt", undefined))
            .collect(),
          ctx.db
            .query("projectImages")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect(),
        ]);

        return {
          _id: project._id,
          name: project.name,
          status: project.status,
          address: project.address,
          startDate: project.startDate,
          endDate: project.endDate,
          revenue: project.revenue,
          notes: project.notes,
          highlighted: project.highlighted,
          displayOrder: project.displayOrder,
          createdAt: project.createdAt,
          imageCount: images.length,
          openUnits: open.reduce((total, row) => total + row.quantity, 0),
          openValue: open.reduce((total, row) => total + row.quantity * row.pricePerItem, 0),
          payment: paymentState(project),
        };
      }),
    );
  },
});

/**
 * Records money against a project.
 *
 * Marking a job paid is the moment to capture the rest of it, so this takes the date and the amount
 * together rather than flipping a flag and leaving the amount to be reconstructed later. Passing an
 * amount that covers the invoice settles the job outright even when "partial" was chosen, because
 * the number is the fact and the radio button is a guess.
 */
export const recordProjectPayment = mutation({
  args: {
    projectId: v.id("projects"),
    paidOn: v.number(),
    amountPaid: v.number(),
    /* What she selected. Reconciled against the invoice below. */
    intent: v.union(v.literal("partial"), v.literal("paid")),
    method: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (args.amountPaid < 0) throw new Error("A payment cannot be negative");

    const invoiced = project.revenue ?? 0;
    const settled = invoiced > 0 ? args.amountPaid >= invoiced : args.intent === "paid";

    await ctx.db.patch(args.projectId, {
      paymentStatus: settled ? "paid" : "partial",
      paymentReceivedAt: args.paidOn,
      amountPaid: args.amountPaid,
      paymentMethod: args.method?.trim() || undefined,
      paymentNotes: args.notes?.trim() || undefined,
      updatedAt: Date.now(),
    });

    return { status: settled ? "paid" : "partial", outstanding: Math.max(0, invoiced - args.amountPaid) };
  },
});

/** Undoes a payment record — the way back from a wrong date or a mistaken toggle. */
export const clearProjectPayment = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(args.projectId, {
      paymentStatus: "unpaid",
      paymentReceivedAt: undefined,
      amountPaid: undefined,
      paymentMethod: undefined,
      paymentNotes: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get projects (for admin - used by edit page)
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      return [];
    }

    return await ctx.db.query("projects").order("desc").collect();
  },
});

// Get user's projects
export const getUserProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();

    return projects;
  },
});

// Get single project with images and inventory
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(args.id);
    if (!project) return null;

    // Check access - owner or admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (project.ownerId !== identity.subject && (!user || user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    // Get project images
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    // Get assigned inventory
    const inventoryAssignments = await ctx.db
      .query("projectInventory")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    const assignedInventory = await Promise.all(
      inventoryAssignments.map(async (assignment) => {
        const inventory = await ctx.db.get(assignment.inventoryId);
        return {
          ...assignment,
          inventory,
        };
      }),
    );

    return {
      ...project,
      images: images.sort((a, b) => a.displayOrder - b.displayOrder),
      assignedInventory,
    };
  },
});

// Create new project
export const createProject = mutation({
  args: {
    name: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    revenue: v.optional(v.number()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the highest display order to append new project to end
    const projects = await ctx.db.query("projects").collect();
    const maxOrder = Math.max(...projects.map((p) => p.displayOrder || 0), 0);

    const projectId = await ctx.db.insert("projects", {
      ownerId: identity.subject,
      name: args.name,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      revenue: args.revenue,
      address: args.address,
      notes: args.notes,
      highlighted: false,
      inventoryAssigned: false,
      displayOrder: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Add image to project
export const addProjectImage = mutation({
  args: {
    projectId: v.id("projects"),
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    thumbnailPath: v.optional(v.string()),
    thumbnailWidth: v.optional(v.number()),
    thumbnailHeight: v.optional(v.number()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Check access - owner or admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (project.ownerId !== identity.subject && (!user || user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const imageId = await ctx.db.insert("projectImages", {
      projectId: args.projectId,
      ownerId: identity.subject,
      imagePath: args.imagePath,
      width: args.width,
      height: args.height,
      thumbnailPath: args.thumbnailPath,
      thumbnailWidth: args.thumbnailWidth,
      thumbnailHeight: args.thumbnailHeight,
      displayOrder: args.displayOrder,
      createdAt: Date.now(),
    });

    return imageId;
  },
});

// Delete project image
/**
 * Commit a whole batch of uploaded images in one transaction.
 *
 * The old flow inserted each image the moment it finished uploading, one mutation per file, so a
 * ten-image drop was ten separate writes with no way to reorder, retitle, or back out of any of them
 * first. Here nothing is written until she submits, and then it is all written or none of it is.
 */
export const addProjectImages = mutation({
  args: {
    projectId: v.id("projects"),
    images: v.array(
      v.object({
        title: v.optional(v.string()),
        imagePath: v.string(),
        width: v.number(),
        height: v.number(),
        thumbnailPath: v.optional(v.string()),
        thumbnailWidth: v.optional(v.number()),
        thumbnailHeight: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    /* New images land after whatever is already there, in the order she arranged them. */
    const existing = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const start = existing.reduce((highest, row) => Math.max(highest, row.displayOrder + 1), 0);

    const ids = [];
    for (const [index, image] of args.images.entries()) {
      ids.push(
        await ctx.db.insert("projectImages", {
          projectId: args.projectId,
          ownerId: admin.clerkId,
          title: image.title?.trim() || undefined,
          imagePath: image.imagePath,
          width: image.width,
          height: image.height,
          thumbnailPath: image.thumbnailPath,
          thumbnailWidth: image.thumbnailWidth,
          thumbnailHeight: image.thumbnailHeight,
          displayOrder: start + index,
          createdAt: Date.now(),
        }),
      );
    }

    return { added: ids.length, ids };
  },
});

/** Retitle an image that is already on the project. */
export const updateProjectImage = mutation({
  args: { imageId: v.id("projectImages"), title: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const image = await ctx.db.get(args.imageId);
    if (!image) throw new Error("Image not found");

    await ctx.db.patch(args.imageId, { title: args.title.trim() || undefined });
    return { success: true };
  },
});

export const deleteProjectImage = mutation({
  args: { id: v.id("projectImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Image not found");

    const project = await ctx.db.get(image.projectId);
    if (!project) throw new Error("Project not found");

    // Check access - owner or admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (project.ownerId !== identity.subject && (!user || user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Get project by ID with images (admin only)
export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      ...project,
      images,
      /* Derived rather than raw: the stored columns predate partial payments. */
      payment: paymentState(project),
    };
  },
});

// Update project (admin only)
/**
 * Save a project, optionally checking its inventory in as part of the same transaction.
 *
 * The check-in is folded in here rather than fired as a second mutation because the two have to
 * agree: a project that reads "completed" while its furniture still reads "at this house" is exactly
 * the state that left 75 units stranded across five finished jobs. `checkInAssignmentIds` is the
 * subset the operator confirmed is physically back — anything omitted stays assigned on purpose, so
 * an item that sold with the house is not silently marked as returned to the warehouse.
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    address: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    revenue: v.optional(v.number()),
    notes: v.optional(v.string()),
    highlighted: v.boolean(),
    checkInAssignmentIds: v.optional(v.array(v.id("projectInventory"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { projectId, checkInAssignmentIds, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(projectId, { ...updates, updatedAt: now });

    if (checkInAssignmentIds && checkInAssignmentIds.length > 0) {
      /* Stamp the return with the job's end date when there is one, not the date of the paperwork. */
      const returnedAt = updates.endDate ?? now;
      const touchedItems = new Set<Id<"inventory">>();

      for (const assignmentId of checkInAssignmentIds) {
        const row = await ctx.db.get(assignmentId);
        if (!row || row.projectId !== projectId || row.returnedAt !== undefined) continue;

        await ctx.db.patch(assignmentId, { returnedAt });
        touchedItems.add(row.inventoryId);
      }

      for (const inventoryId of touchedItems) await syncItemCounter(ctx, inventoryId);
    }

    await syncProjectFlag(ctx, projectId);

    return { success: true };
  },
});

// Remove project image (admin only)
export const removeProjectImage = mutation({
  args: { imageId: v.id("projectImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.imageId);
    return { success: true };
  },
});

// Reorder project images (admin only)
export const reorderProjectImages = mutation({
  args: {
    projectId: v.id("projects"),
    imageIds: v.array(v.id("projectImages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Update display order for each image
    for (let i = 0; i < args.imageIds.length; i++) {
      await ctx.db.patch(args.imageIds[i], {
        displayOrder: i,
      });
    }

    return { success: true };
  },
});

// Toggle project highlight (admin only)
export const toggleProjectHighlight = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(args.projectId, {
      highlighted: !project.highlighted,
      updatedAt: Date.now(),
    });
  },
});

// Delete project (admin only)
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Delete all project inventory assignments, then rewrite the counters they were feeding.
    const assignments = await ctx.db
      .query("projectInventory")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    for (const inventoryId of new Set(assignments.map((assignment) => assignment.inventoryId))) {
      await syncItemCounter(ctx, inventoryId);
    }

    // Delete project images
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const image of images) {
      await ctx.db.delete(image._id);
    }

    // Delete project
    await ctx.db.delete(args.id);
  },
});

// Move project up in order (admin only)
export const moveProjectUp = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Find the project with the next lower order
    const projects = await ctx.db.query("projects").collect();
    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    const currentIndex = sortedProjects.findIndex((p) => p._id === args.projectId);

    if (currentIndex > 0) {
      const prevProject = sortedProjects[currentIndex - 1];
      const currentOrder = project.displayOrder || currentIndex + 1;
      const prevOrder = prevProject.displayOrder || currentIndex;

      // Swap display orders
      await ctx.db.patch(args.projectId, { displayOrder: prevOrder });
      await ctx.db.patch(prevProject._id, { displayOrder: currentOrder });
    }
  },
});

// Move project down in order (admin only)
export const moveProjectDown = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Find the project with the next higher order
    const projects = await ctx.db.query("projects").collect();
    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    const currentIndex = sortedProjects.findIndex((p) => p._id === args.projectId);

    if (currentIndex < sortedProjects.length - 1) {
      const nextProject = sortedProjects[currentIndex + 1];
      const currentOrder = project.displayOrder || currentIndex + 1;
      const nextOrder = nextProject.displayOrder || currentIndex + 2;

      // Swap display orders
      await ctx.db.patch(args.projectId, { displayOrder: nextOrder });
      await ctx.db.patch(nextProject._id, { displayOrder: currentOrder });
    }
  },
});

// Initialize display order for existing projects (admin only - run once)
export const initializeProjectOrder = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const projects = await ctx.db.query("projects").order("desc").collect();

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      if (project.displayOrder === undefined || project.displayOrder === null) {
        await ctx.db.patch(project._id, { displayOrder: i + 1 });
      }
    }

    return { success: true, updated: projects.length };
  },
});

// Move project to first position (admin only)
export const moveProjectToFirst = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Reorder all projects to maintain sequential order
    const projects = await ctx.db.query("projects").collect();
    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    // Find the project being moved
    const movingProject = projects.find((p) => p._id === args.projectId);
    if (!movingProject) throw new Error("Project not found");

    // Remove from current position and add to beginning
    const otherProjects = sortedProjects.filter((p) => p._id !== args.projectId);
    const reorderedProjects = [movingProject, ...otherProjects];

    // Update display orders to be sequential
    for (let i = 0; i < reorderedProjects.length; i++) {
      await ctx.db.patch(reorderedProjects[i]._id, { displayOrder: i + 1 });
    }
  },
});

// Move project to last position (admin only)
export const moveProjectToLast = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Reorder all projects to maintain sequential order
    const projects = await ctx.db.query("projects").collect();
    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    // Find the project being moved
    const movingProject = projects.find((p) => p._id === args.projectId);
    if (!movingProject) throw new Error("Project not found");

    // Remove from current position and add to end
    const otherProjects = sortedProjects.filter((p) => p._id !== args.projectId);
    const reorderedProjects = [...otherProjects, movingProject];

    // Update display orders to be sequential
    for (let i = 0; i < reorderedProjects.length; i++) {
      await ctx.db.patch(reorderedProjects[i]._id, { displayOrder: i + 1 });
    }
  },
});
