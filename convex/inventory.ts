import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get all inventory (admin only)
export const getAllInventory = query({
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

    const inventory = await ctx.db.query("inventory").collect();
    return inventory.sort((a, b) => b.pId - a.pId);
  },
});

// Get all inventory with filters
export const getInventory = query({
  args: {
    category: v.optional(v.string()),
    active: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let inventoryQuery = ctx.db.query("inventory");

    if (args.active !== undefined) {
      inventoryQuery = inventoryQuery.filter((q) =>
        q.eq(q.field("active"), args.active)
      );
    }

    if (args.category) {
      inventoryQuery = inventoryQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    const inventory = await inventoryQuery.collect();

    // Apply search filter if provided
    let filtered = inventory;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by pId descending
    return filtered.sort((a, b) => b.pId - a.pId);
  },
});

// Get single inventory item with images
export const getInventoryItem = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    const extraImages = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", args.id))
      .collect();

    // Sort extra images by display order
    extraImages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      ...item,
      extraImages,
    };
  },
});

// Get single inventory item by original ID (oId)
export const getInventoryItemByOId = query({
  args: { oId: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("inventory")
      .filter((q) => q.eq(q.field("oId"), args.oId))
      .first();
    
    if (!item) return null;

    const extraImages = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", item._id))
      .collect();

    // Sort extra images by display order
    extraImages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      ...item,
      extraImages,
    };
  },
});

// Create inventory item (admin only)
export const createInventory = mutation({
  args: {
    oId: v.number(),
    pId: v.number(),
    active: v.boolean(),
    name: v.string(),
    cost: v.optional(v.number()),
    price: v.number(),
    vendor: v.string(),
    category: v.string(),
    description: v.string(),
    count: v.number(),
    location: v.string(),
    realWidth: v.number(),
    realHeight: v.number(),
    realDepth: v.number(),
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    smallImagePath: v.string(),
    smallWidth: v.number(),
    smallHeight: v.number(),
  },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Create inventory item
    const inventoryId = await ctx.db.insert("inventory", {
      ...args,
      inUse: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return inventoryId;
  },
});

// Update inventory item (admin only)
export const updateInventory = mutation({
  args: {
    id: v.id("inventory"),
    updates: v.object({
      pId: v.optional(v.number()),
      active: v.optional(v.boolean()),
      name: v.optional(v.string()),
      cost: v.optional(v.number()),
      price: v.optional(v.number()),
      vendor: v.optional(v.string()),
      category: v.optional(v.string()),
      description: v.optional(v.string()),
      count: v.optional(v.number()),
      location: v.optional(v.string()),
      realWidth: v.optional(v.number()),
      realHeight: v.optional(v.number()),
      realDepth: v.optional(v.number()),
      imagePath: v.optional(v.string()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      smallImagePath: v.optional(v.string()),
      smallWidth: v.optional(v.number()),
      smallHeight: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Update inventory item
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete inventory item (admin only)
export const deleteInventory = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Check if item is in use
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    if (item.inUse > 0) {
      throw new Error("Cannot delete item that is currently in use");
    }

    // Delete extra images first
    const extraImages = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", args.id))
      .collect();

    for (const image of extraImages) {
      await ctx.db.delete(image._id);
    }

    // Delete inventory item
    await ctx.db.delete(args.id);
  },
});

// Get inventory availability
export const getInventoryAvailability = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      total: item.count,
      inUse: item.inUse,
      available: item.count - item.inUse,
    };
  },
});

// Get inventory categories
export const getInventoryCategories = query({
  handler: async (ctx) => {
    const inventory = await ctx.db.query("inventory").collect();
    const categories = [...new Set(inventory.map(item => item.category))];
    return categories.sort();
  },
});

// Get adjacent inventory oIds for navigation
export const getAdjacentInventoryOIds = query({
  args: { oId: v.number() },
  handler: async (ctx, args) => {
    const inventory = await ctx.db
      .query("inventory")
      .collect();
    
    // Sort by oId descending (most recent first)
    const sorted = inventory.sort((a, b) => b.oId - a.oId);
    
    // Find current index
    const currentIndex = sorted.findIndex(item => item.oId === args.oId);
    
    if (currentIndex === -1) {
      return { nextOId: null, prevOId: null };
    }
    
    // Get adjacent oIds
    const nextOId = currentIndex > 0 ? sorted[currentIndex - 1].oId : null;
    const prevOId = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1].oId : null;
    
    return { nextOId, prevOId };
  },
});

// Get most recent inventory oId
export const getMostRecentOId = query({
  handler: async (ctx) => {
    const inventory = await ctx.db
      .query("inventory")
      .collect();
    
    if (inventory.length === 0) return null;
    
    // Find the item with the highest oId
    const mostRecent = inventory.reduce((max, item) => 
      item.oId > max.oId ? item : max
    );
    
    return mostRecent.oId;
  },
});

// Add extra image to inventory (admin only)
export const addExtraImage = mutation({
  args: {
    inventoryId: v.id("inventory"),
    title: v.optional(v.string()),
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    smallImagePath: v.optional(v.string()),
    smallWidth: v.optional(v.number()),
    smallHeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Get the highest display order for this inventory item's extra images
    const extraImages = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", args.inventoryId))
      .collect();
    
    const maxOrder = Math.max(...extraImages.map(img => img.displayOrder || 0), 0);

    // Create extra image
    const imageId = await ctx.db.insert("extraImages", {
      ...args,
      displayOrder: maxOrder + 1,
      createdAt: Date.now(),
    });

    return imageId;
  },
});

// Delete extra image (admin only)
export const deleteExtraImage = mutation({
  args: { id: v.id("extraImages") },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Delete the extra image
    await ctx.db.delete(args.id);
  },
});

// Reorder images by swapping two positions (admin only)
export const reorderImagesBySwapping = mutation({
  args: { 
    inventoryId: v.id("inventory"),
    position1: v.number(), // 1-based position (1 = main image, 2+ = extra images)
    position2: v.number(), // 1-based position
  },
  handler: async (ctx, args) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { inventoryId, position1, position2 } = args;
    
    if (position1 === position2) {
      return; // No swap needed
    }

    // Get inventory item and extra images
    const inventoryItem = await ctx.db.get(inventoryId);
    if (!inventoryItem) throw new Error("Inventory item not found");

    const extraImages = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", inventoryId))
      .collect();

    // Sort extra images by display order
    extraImages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Helper function to extract filename from path
    const getFilename = (path: string) => {
      return path.split('/').pop() || path;
    };

    // Create image array: [mainImage, ...extraImages]
    const allImages = [
      {
        isMain: true,
        title: getFilename(inventoryItem.imagePath),
        imagePath: inventoryItem.imagePath,
        width: inventoryItem.width,
        height: inventoryItem.height,
        smallImagePath: inventoryItem.smallImagePath,
        smallWidth: inventoryItem.smallWidth,
        smallHeight: inventoryItem.smallHeight,
        _id: null, // Main image doesn't have an _id in extraImages
        displayOrder: 0,
      },
      ...extraImages.map(img => ({
        isMain: false,
        title: img.title || getFilename(img.imagePath),
        imagePath: img.imagePath,
        width: img.width,
        height: img.height,
        smallImagePath: img.smallImagePath,
        smallWidth: img.smallWidth,
        smallHeight: img.smallHeight,
        _id: img._id,
        displayOrder: img.displayOrder,
      }))
    ];

    // Validate positions
    const maxPosition = allImages.length;
    if (position1 < 1 || position1 > maxPosition || position2 < 1 || position2 > maxPosition) {
      throw new Error(`Invalid positions. Must be between 1 and ${maxPosition}`);
    }

    // Get the images at the specified positions (convert to 0-based)
    const img1 = allImages[position1 - 1];
    const img2 = allImages[position2 - 1];

    // Swap the images
    [allImages[position1 - 1], allImages[position2 - 1]] = [img2, img1];

    // Update the database
    const newMainImage = allImages[0];
    
    // Update main image in inventory table
    await ctx.db.patch(inventoryId, {
      imagePath: newMainImage.imagePath,
      width: newMainImage.width,
      height: newMainImage.height,
      smallImagePath: newMainImage.smallImagePath,
      smallWidth: newMainImage.smallWidth,
      smallHeight: newMainImage.smallHeight,
      updatedAt: Date.now(),
    });

    // Update or create extra images
    const newExtraImages = allImages.slice(1); // All except the first (main) image

    // Delete all existing extra images for this inventory
    for (const img of extraImages) {
      await ctx.db.delete(img._id);
    }

    // Create new extra images with correct display order
    for (let i = 0; i < newExtraImages.length; i++) {
      const img = newExtraImages[i];
      await ctx.db.insert("extraImages", {
        inventoryId,
        title: img.title,
        imagePath: img.imagePath,
        width: img.width,
        height: img.height,
        smallImagePath: img.smallImagePath,
        smallWidth: img.smallWidth,
        smallHeight: img.smallHeight,
        displayOrder: i + 1,
        createdAt: Date.now(),
      });
    }
  },
});

// Initialize display order for existing extra images (run once for migration)
export const initializeImageOrder = mutation({
  args: {},
  handler: async (ctx) => {
    // Check admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Get all extra images that don't have displayOrder set
    const extraImages = await ctx.db.query("extraImages").collect();
    
    // Group by inventory ID
    const imagesByInventory = extraImages.reduce((acc, img) => {
      if (!acc[img.inventoryId]) {
        acc[img.inventoryId] = [];
      }
      acc[img.inventoryId].push(img);
      return acc;
    }, {} as Record<string, typeof extraImages>);

    // Update display order for each inventory's images
    for (const [inventoryId, images] of Object.entries(imagesByInventory)) {
      // Sort by creation time to maintain original order
      const sortedImages = images.sort((a, b) => a.createdAt - b.createdAt);
      
      for (let i = 0; i < sortedImages.length; i++) {
        const img = sortedImages[i];
        if (!img.displayOrder) {
          await ctx.db.patch(img._id, {
            displayOrder: i + 1,
          });
        }
      }
    }
  },
});

