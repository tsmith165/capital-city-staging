import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get active homepage images for the public homepage hero slideshow
export const getHomepageImages = query({
  handler: async (ctx) => {
    const images = await ctx.db
      .query("homepageImages")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();

    return images.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Get all homepage images for admin management (active + inactive)
export const getAllHomepageImages = query({
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

    const images = await ctx.db.query("homepageImages").collect();
    return images.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Get available project images for admin to browse and add to homepage
export const getAvailableProjectImages = query({
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

    // Get highlighted projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_highlighted", (q) => q.eq("highlighted", true))
      .collect();

    const sortedProjects = projects.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    // Get existing homepage images to detect duplicates
    const existingHomepageImages = await ctx.db.query("homepageImages").collect();

    const existingProjectImageIds = new Set(
      existingHomepageImages.filter((img) => img.sourceProjectImageId).map((img) => img.sourceProjectImageId!.toString()),
    );

    // Build result with images and alreadyOnHomepage flag
    const projectsWithImages = await Promise.all(
      sortedProjects.map(async (project) => {
        const images = await ctx.db
          .query("projectImages")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const sortedImages = images.sort((a, b) => a.displayOrder - b.displayOrder);

        return {
          projectId: project._id,
          projectName: project.name,
          images: sortedImages.map((img) => ({
            ...img,
            alreadyOnHomepage: existingProjectImageIds.has(img._id.toString()),
          })),
        };
      }),
    );

    return projectsWithImages;
  },
});

// Add a single image to the homepage
export const addHomepageImage = mutation({
  args: {
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    thumbnailPath: v.optional(v.string()),
    thumbnailWidth: v.optional(v.number()),
    thumbnailHeight: v.optional(v.number()),
    title: v.optional(v.string()),
    sourceType: v.union(v.literal("upload"), v.literal("project")),
    sourceProjectId: v.optional(v.id("projects")),
    sourceProjectImageId: v.optional(v.id("projectImages")),
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

    const existingImages = await ctx.db.query("homepageImages").collect();
    const maxOrder = existingImages.length > 0 ? Math.max(...existingImages.map((img) => img.displayOrder)) : 0;

    const imageId = await ctx.db.insert("homepageImages", {
      imagePath: args.imagePath,
      width: args.width,
      height: args.height,
      thumbnailPath: args.thumbnailPath,
      thumbnailWidth: args.thumbnailWidth,
      thumbnailHeight: args.thumbnailHeight,
      title: args.title,
      active: true,
      displayOrder: maxOrder + 1,
      sourceType: args.sourceType,
      sourceProjectId: args.sourceProjectId,
      sourceProjectImageId: args.sourceProjectImageId,
      createdAt: Date.now(),
    });

    return imageId;
  },
});

// Batch add multiple project images to the homepage
export const addProjectImagesToHomepage = mutation({
  args: {
    projectImageIds: v.array(v.id("projectImages")),
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

    const existingImages = await ctx.db.query("homepageImages").collect();
    let maxOrder = existingImages.length > 0 ? Math.max(...existingImages.map((img) => img.displayOrder)) : 0;

    // Track existing source project image IDs to skip duplicates
    const existingProjectImageIds = new Set(
      existingImages.filter((img) => img.sourceProjectImageId).map((img) => img.sourceProjectImageId!.toString()),
    );

    let added = 0;

    for (const projectImageId of args.projectImageIds) {
      if (existingProjectImageIds.has(projectImageId.toString())) {
        continue;
      }

      const projectImage = await ctx.db.get(projectImageId);
      if (!projectImage) continue;

      const project = await ctx.db.get(projectImage.projectId);

      maxOrder += 1;

      await ctx.db.insert("homepageImages", {
        imagePath: projectImage.imagePath,
        width: projectImage.width,
        height: projectImage.height,
        thumbnailPath: projectImage.thumbnailPath,
        thumbnailWidth: projectImage.thumbnailWidth,
        thumbnailHeight: projectImage.thumbnailHeight,
        title: project ? project.name : undefined,
        active: true,
        displayOrder: maxOrder,
        sourceType: "project",
        sourceProjectId: projectImage.projectId,
        sourceProjectImageId: projectImage._id,
        createdAt: Date.now(),
      });

      added++;
    }

    return { added, skipped: args.projectImageIds.length - added };
  },
});

// Remove a homepage image and re-normalize display order
export const removeHomepageImage = mutation({
  args: { id: v.id("homepageImages") },
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

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Homepage image not found");

    await ctx.db.delete(args.id);

    // Re-normalize displayOrder to prevent gaps
    const remainingImages = await ctx.db.query("homepageImages").collect();
    const sorted = remainingImages.sort((a, b) => a.displayOrder - b.displayOrder);

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].displayOrder !== i + 1) {
        await ctx.db.patch(sorted[i]._id, { displayOrder: i + 1 });
      }
    }

    return { success: true };
  },
});

// Update homepage image properties (title, active status)
export const updateHomepageImage = mutation({
  args: {
    id: v.id("homepageImages"),
    title: v.optional(v.string()),
    active: v.optional(v.boolean()),
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

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Homepage image not found");

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.active !== undefined) updates.active = args.active;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }

    return { success: true };
  },
});

// Toggle active/inactive status on a homepage image
export const toggleHomepageImageActive = mutation({
  args: { id: v.id("homepageImages") },
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

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Homepage image not found");

    await ctx.db.patch(args.id, {
      active: !image.active,
    });
  },
});

// Reorder homepage images by receiving ordered array of IDs (for drag-and-drop)
export const reorderHomepageImages = mutation({
  args: {
    imageIds: v.array(v.id("homepageImages")),
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

    for (let i = 0; i < args.imageIds.length; i++) {
      await ctx.db.patch(args.imageIds[i], {
        displayOrder: i + 1,
      });
    }

    return { success: true };
  },
});

// Move a homepage image one position up
export const moveHomepageImageUp = mutation({
  args: { id: v.id("homepageImages") },
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

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Homepage image not found");

    const allImages = await ctx.db.query("homepageImages").collect();
    const sortedImages = allImages.sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sortedImages.findIndex((img) => img._id === args.id);

    if (currentIndex > 0) {
      const prevImage = sortedImages[currentIndex - 1];
      const currentOrder = image.displayOrder;
      const prevOrder = prevImage.displayOrder;

      await ctx.db.patch(args.id, { displayOrder: prevOrder });
      await ctx.db.patch(prevImage._id, { displayOrder: currentOrder });
    }
  },
});

// Move a homepage image one position down
export const moveHomepageImageDown = mutation({
  args: { id: v.id("homepageImages") },
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

    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Homepage image not found");

    const allImages = await ctx.db.query("homepageImages").collect();
    const sortedImages = allImages.sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sortedImages.findIndex((img) => img._id === args.id);

    if (currentIndex < sortedImages.length - 1) {
      const nextImage = sortedImages[currentIndex + 1];
      const currentOrder = image.displayOrder;
      const nextOrder = nextImage.displayOrder;

      await ctx.db.patch(args.id, { displayOrder: nextOrder });
      await ctx.db.patch(nextImage._id, { displayOrder: currentOrder });
    }
  },
});
