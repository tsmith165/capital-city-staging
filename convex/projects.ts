import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get highlighted projects for portfolio
export const getHighlightedProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_highlighted", (q) => q.eq("highlighted", true))
      .order("desc")
      .take(10);

    // Get images for each project
    const projectsWithImages = await Promise.all(
      projects.map(async (project) => {
        const images = await ctx.db
          .query("projectImages")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          images: images.sort((a, b) => a.displayOrder - b.displayOrder),
        };
      })
    );

    return projectsWithImages;
  },
});

// Get all projects (admin only)
export const getAllProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    return await ctx.db.query("projects").order("desc").collect();
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
      })
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
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    revenue: v.optional(v.number()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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

// Assign inventory to project
export const assignInventoryToProject = mutation({
  args: {
    projectId: v.id("projects"),
    inventoryId: v.id("inventory"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check project ownership or admin
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    if (project.ownerId !== identity.subject && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Check inventory availability
    const inventory = await ctx.db.get(args.inventoryId);
    if (!inventory) throw new Error("Inventory not found");

    const available = inventory.count - inventory.inUse;
    if (available < args.quantity) {
      throw new Error(`Only ${available} items available`);
    }

    // Create assignment
    await ctx.db.insert("projectInventory", {
      projectId: args.projectId,
      inventoryId: args.inventoryId,
      quantity: args.quantity,
      pricePerItem: inventory.price,
      assignedAt: Date.now(),
    });

    // Update inventory inUse count
    await ctx.db.patch(args.inventoryId, {
      inUse: inventory.inUse + args.quantity,
      updatedAt: Date.now(),
    });

    // Update project
    await ctx.db.patch(args.projectId, {
      inventoryAssigned: true,
      updatedAt: Date.now(),
    });
  },
});

// Return inventory from project
export const returnInventoryFromProject = mutation({
  args: {
    projectInventoryId: v.id("projectInventory"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const assignment = await ctx.db.get(args.projectInventoryId);
    if (!assignment) throw new Error("Assignment not found");

    // Check project ownership or admin
    const project = await ctx.db.get(assignment.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    if (project.ownerId !== identity.subject && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Update inventory inUse count
    const inventory = await ctx.db.get(assignment.inventoryId);
    if (!inventory) throw new Error("Inventory not found");

    await ctx.db.patch(assignment.inventoryId, {
      inUse: Math.max(0, inventory.inUse - assignment.quantity),
      updatedAt: Date.now(),
    });

    // Mark assignment as returned
    await ctx.db.patch(args.projectInventoryId, {
      returnedAt: Date.now(),
    });
  },
});

// Get project by ID with images (admin only)
export const getProjectById = query({
  args: { projectId: v.id("projects") },
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

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get project images ordered by displayOrder
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Sort images by displayOrder
    images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      ...project,
      images,
    };
  },
});

// Update project (admin only)
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

    const { projectId, ...updates } = args;

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

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
    imageIds: v.array(v.id("projectImages"))
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

// Get project inventory assignments (admin only)
export const getProjectInventory = query({
  args: { projectId: v.id("projects") },
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

    // Get all inventory assignments for this project
    const assignments = await ctx.db
      .query("projectInventory")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get inventory details for each assignment
    const assignmentsWithInventory = [];
    for (const assignment of assignments) {
      const inventory = await ctx.db.get(assignment.inventoryId);
      if (inventory) {
        assignmentsWithInventory.push({
          ...assignment,
          inventory,
        });
      }
    }

    return assignmentsWithInventory;
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

    // Return all assigned inventory
    const assignments = await ctx.db
      .query("projectInventory")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const assignment of assignments) {
      if (!assignment.returnedAt) {
        const inventory = await ctx.db.get(assignment.inventoryId);
        if (inventory) {
          await ctx.db.patch(assignment.inventoryId, {
            inUse: Math.max(0, inventory.inUse - assignment.quantity),
            updatedAt: Date.now(),
          });
        }
      }
      await ctx.db.delete(assignment._id);
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