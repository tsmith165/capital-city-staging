import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, isAdmin } from "./authz";
import { availabilityByItem, availabilityForItem, openAssignmentsForItem, openAssignmentsForProject } from "./availability";
import { attentionReasons, highestTier } from "./inventoryRules";

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
    return inventory.sort((a, b) => b.oId - a.oId);
  },
});

/**
 * Creates one catalog item and returns the identifier it was given.
 *
 * `oId` is allocated here rather than by the caller. Both creation surfaces used to read the
 * highest existing id and add one, so two tabs open at the same time handed the same number to two
 * different pieces of furniture, and every lookup by `oId` after that is ambiguous.
 */
export const createInventory = mutation({
  args: {
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
    await requireAdmin(ctx);

    const existing = await ctx.db.query("inventory").collect();
    const oId = existing.reduce((highest, item) => Math.max(highest, item.oId), 0) + 1;

    const inventoryId = await ctx.db.insert("inventory", {
      ...args,
      oId,
      pId: oId,
      inUse: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { inventoryId, oId };
  },
});

/**
 * Moves one item one position toward the front or the back of the catalog.
 *
 * The neighbour is resolved server-side inside the transaction. The old manage screen passed both
 * ids from the client, which meant a stale list could swap an item against a neighbour that had
 * already moved, silently reordering something the operator never touched.
 */
export const moveInventoryPosition = mutation({
  args: {
    id: v.id("inventory"),
    direction: v.union(v.literal("earlier"), v.literal("later")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("That item no longer exists");

    const all = await ctx.db.query("inventory").collect();

    // The catalog reads newest-first, so "earlier" means a higher oId.
    const neighbour = all
      .filter((other) => (args.direction === "earlier" ? other.oId > item.oId : other.oId < item.oId))
      .sort((a, b) => (args.direction === "earlier" ? a.oId - b.oId : b.oId - a.oId))[0];

    if (!neighbour) return { moved: false };

    const now = Date.now();
    await ctx.db.patch(item._id, { oId: neighbour.oId, updatedAt: now });
    await ctx.db.patch(neighbour._id, { oId: item.oId, updatedAt: now });
    return { moved: true };
  },
});

// Update inventory item (admin only)
export const updateInventory = mutation({
  args: {
    id: v.id("inventory"),
    updates: v.object({
      oId: v.optional(v.number()),
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

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    /*
     * This used to guard on `item.inUse`, which was `0` on every row in the table, so the check
     * never fired and deleting a staged item silently orphaned its assignment rows. Ask the join
     * table instead, and name the house so the message is actionable.
     */
    const openRows = await openAssignmentsForItem(ctx, args.id);
    if (openRows.length > 0) {
      const holder = await ctx.db.get(openRows[0].projectId);
      throw new Error(`Cannot delete this item while it is checked out to ${holder?.name ?? "a project"}. Check it in first.`);
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

// Get most recent inventory oId
export const getMostRecentOId = query({
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return null;

    const inventory = await ctx.db.query("inventory").collect();

    if (inventory.length === 0) return null;

    // Find the item with the highest oId
    const mostRecent = inventory.reduce((max, item) => (item.oId > max.oId ? item : max));

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

    const maxOrder = Math.max(...extraImages.map((img) => img.displayOrder || 0), 0);

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
      return path.split("/").pop() || path;
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
      ...extraImages.map((img) => ({
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
      })),
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
    const imagesByInventory = extraImages.reduce(
      (acc, img) => {
        if (!acc[img.inventoryId]) {
          acc[img.inventoryId] = [];
        }
        acc[img.inventoryId].push(img);
        return acc;
      },
      {} as Record<string, typeof extraImages>,
    );

    // Update display order for each inventory's images
    for (const images of Object.values(imagesByInventory)) {
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

/**
 * The catalog grid: every active item with derived availability and the house holding it.
 *
 * Filtering and sorting stay on the client. At ~400 items the whole catalog is one small payload,
 * and keeping it whole is what lets the availability segmented control and the category counts stay
 * in sync without a round trip per keystroke.
 */
export const getCatalog = query({
  /**
   * `projectId` puts the catalog into staging mode: every row gains what that project already holds
   * and the real cap for it, so the grid can be picked from directly instead of sending her to a
   * separate picker screen and back.
   */
  args: { includeInactive: v.optional(v.boolean()), projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;

    const [items, availability, allAssignments, assignedRows] = await Promise.all([
      ctx.db.query("inventory").collect(),
      availabilityByItem(ctx),
      ctx.db.query("projectInventory").collect(),
      args.projectId ? openAssignmentsForProject(ctx, args.projectId) : Promise.resolve([]),
    ]);

    const assignedByItem = new Map(assignedRows.map((row) => [row.inventoryId, row] as const));

    /* Lifetime staging count, including returned rows — this is what "never staged" is read off. */
    const stagedCount = new Map<string, number>();
    for (const row of allAssignments) {
      stagedCount.set(row.inventoryId, (stagedCount.get(row.inventoryId) ?? 0) + 1);
    }

    const visible = args.includeInactive ? items : items.filter((item) => item.active);

    return visible
      .map((item) => {
        const derived = availability.get(item._id);
        const reasons = attentionReasons(item, derived);
        const primaryHolder = derived?.holders[0];
        /* Units this project already holds are spendable by it, so fold them back into its cap. */
        const assignedHere = assignedByItem.get(item._id)?.quantity ?? 0;

        return {
          _id: item._id,
          oId: item.oId,
          name: item.name,
          category: item.category,
          location: item.location,
          price: item.price,
          active: item.active,
          imagePath: item.imagePath,
          smallImagePath: item.smallImagePath,
          owned: item.count,
          out: derived?.out ?? 0,
          awaitingCheckIn: derived?.awaitingCheckIn ?? 0,
          free: derived?.free ?? 0,
          holderName: primaryHolder?.projectName ?? null,
          holderId: primaryHolder?.projectId ?? null,
          holderAwaitingCheckIn: primaryHolder?.awaitingCheckIn ?? false,
          holderCount: derived?.holders.length ?? 0,
          attentionTier: highestTier(reasons),
          timesStaged: stagedCount.get(item._id) ?? 0,
          assignedHere,
          maxForThisProject: (derived?.free ?? 0) + assignedHere,
        };
      })
      .sort((a, b) => b.oId - a.oId);
  },
});

/** Full detail for the catalog's item sheet, including derived availability. */
export const getInventoryDetail = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;

    const item = await ctx.db.get(args.id);
    if (!item) return null;

    const [extraImages, availability] = await Promise.all([
      ctx.db
        .query("extraImages")
        .withIndex("by_inventory", (q) => q.eq("inventoryId", args.id))
        .collect(),
      availabilityForItem(ctx, args.id),
    ]);

    return {
      ...item,
      extraImages: extraImages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      availability,
      attention: attentionReasons(item, availability),
    };
  },
});

/**
 * Set the price on one item without loading the whole editor.
 *
 * The queue's dominant problem is a missing price on an item that is otherwise fine. Routing 102 of
 * those through a full edit page is the reason none of them got fixed, so the queue row edits the
 * field in place.
 */
export const setInventoryPrice = mutation({
  args: { id: v.id("inventory"), price: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (!Number.isFinite(args.price) || args.price < 0) throw new Error("Price must be zero or more");

    await ctx.db.patch(args.id, { price: args.price, updatedAt: Date.now() });
  },
});

/** Same idea for the measurements the will-it-fit categories need. */
export const setInventoryDimensions = mutation({
  args: {
    id: v.id("inventory"),
    realWidth: v.number(),
    realHeight: v.number(),
    realDepth: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...dimensions } = args;
    for (const value of Object.values(dimensions)) {
      if (!Number.isFinite(value) || value < 0) throw new Error("Measurements must be zero or more");
    }

    await ctx.db.patch(id, { ...dimensions, updatedAt: Date.now() });
  },
});

/**
 * Everything the item editor needs, in one subscription.
 *
 * The editor used to stitch this together from four queries — the item, its neighbours, the most
 * recent id, and nothing at all about whether the thing was out on a job. Availability belongs here:
 * it is the number that decides whether lowering the count is safe.
 */
/**
 * Resolves a catalog number to the immutable document id.
 *
 * `oId` doubles as display order, and reordering swaps it between two rows, so it is not a stable
 * handle on a record. Links that still carry `?id=<oId>` resolve through this once and then hold
 * the `_id`, which cannot change underneath an open editor.
 */
export const getInventoryIdByOId = query({
  args: { oId: v.number() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;
    const match = await ctx.db
      .query("inventory")
      .filter((q) => q.eq(q.field("oId"), args.oId))
      .first();
    return match ? match._id : null;
  },
});

export const getInventoryEditor = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;

    const catalog = await ctx.db.query("inventory").collect();
    const item = catalog.find((row) => row._id === args.id);
    if (!item) return null;

    const [extraImages, availability] = await Promise.all([
      ctx.db
        .query("extraImages")
        .withIndex("by_inventory", (q) => q.eq("inventoryId", item._id))
        .collect(),
      availabilityForItem(ctx, item._id),
    ]);

    /* Newest first, matching the order the catalog and the old prev/next arrows walked. */
    const ordered = [...catalog].sort((a, b) => b.oId - a.oId);
    const index = ordered.findIndex((row) => row._id === args.id);

    return {
      ...item,
      extraImages: extraImages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      availability,
      attention: attentionReasons(item, availability),
      newerId: index > 0 ? ordered[index - 1]._id : null,
      olderId: index < ordered.length - 1 ? ordered[index + 1]._id : null,
      position: index + 1,
      total: ordered.length,
      /* Existing values, so the editor can offer what is already in use before inventing a new one. */
      categories: [...new Set(catalog.map((row) => row.category).filter(Boolean))].sort(),
      locations: [...new Set(catalog.map((row) => row.location).filter(Boolean))].sort(),
    };
  },
});

/**
 * One save for the whole item.
 *
 * The old editor had two: a title field that wrote on its own, and a form that also wrote the name,
 * so whichever was submitted last won. It also ran every number through `parseInt`, which silently
 * turned a $12.50 price into $12. Everything is validated here instead of trusted from the form.
 *
 * Lowering the count below what is physically at houses is refused: the catalog would then owe more
 * units than it owns, and every availability figure downstream would go negative.
 */
export const updateInventoryDetails = mutation({
  args: {
    id: v.id("inventory"),
    name: v.string(),
    category: v.string(),
    vendor: v.string(),
    location: v.string(),
    description: v.string(),
    price: v.number(),
    cost: v.number(),
    count: v.number(),
    realWidth: v.number(),
    realHeight: v.number(),
    realDepth: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;

    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");

    if (!updates.name.trim()) throw new Error("An item needs a name");
    if (!updates.category.trim()) throw new Error("An item needs a category");

    for (const [field, value] of Object.entries(updates)) {
      if (typeof value !== "number") continue;
      if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be zero or more`);
    }

    const availability = await availabilityForItem(ctx, id);
    const committed = availability.out + availability.awaitingCheckIn;
    if (updates.count < committed) {
      throw new Error(
        `${committed} of these are at houses right now, so the count cannot go below ${committed} until they are checked in.`,
      );
    }

    await ctx.db.patch(id, {
      ...updates,
      name: updates.name.trim(),
      category: updates.category.trim(),
      vendor: updates.vendor.trim(),
      location: updates.location.trim(),
      description: updates.description.trim(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Retiring an item hides it from the catalog and the picker without losing its staging history. */
export const setInventoryActive = mutation({
  args: { id: v.id("inventory"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    if (!args.active) {
      const availability = await availabilityForItem(ctx, args.id);
      if (availability.out + availability.awaitingCheckIn > 0) {
        throw new Error("This item is still at a house. Check it in before retiring it.");
      }
    }

    await ctx.db.patch(args.id, { active: args.active, updatedAt: Date.now() });
    return { success: true };
  },
});

/** Commits a whole batch of staged photos at once, in the order they were arranged. */
export const addExtraImages = mutation({
  args: {
    inventoryId: v.id("inventory"),
    images: v.array(
      v.object({
        title: v.optional(v.string()),
        imagePath: v.string(),
        width: v.number(),
        height: v.number(),
        smallImagePath: v.optional(v.string()),
        smallWidth: v.optional(v.number()),
        smallHeight: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.inventoryId);
    if (!item) throw new Error("Item not found");

    const existing = await ctx.db
      .query("extraImages")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", args.inventoryId))
      .collect();

    const start = existing.reduce((highest, row) => Math.max(highest, row.displayOrder + 1), 0);
    const now = Date.now();

    const ids = [];
    for (const [offset, image] of args.images.entries()) {
      ids.push(
        await ctx.db.insert("extraImages", {
          ...image,
          inventoryId: args.inventoryId,
          displayOrder: start + offset,
          createdAt: now,
        }),
      );
    }

    return { added: ids.length, ids };
  },
});

/** The caption under a photo, also its alt text. */
export const updateExtraImage = mutation({
  args: { imageId: v.id("extraImages"), title: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const image = await ctx.db.get(args.imageId);
    if (!image) throw new Error("Image not found");

    await ctx.db.patch(args.imageId, { title: args.title.trim() || undefined });
    return { success: true };
  },
});

/** Rewrites the order of an item's extra photos from the arrangement on screen. */
export const reorderInventoryImages = mutation({
  args: { inventoryId: v.id("inventory"), imageIds: v.array(v.id("extraImages")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    for (const [order, imageId] of args.imageIds.entries()) {
      const image = await ctx.db.get(imageId);
      if (!image || image.inventoryId !== args.inventoryId) continue;
      await ctx.db.patch(imageId, { displayOrder: order });
    }

    return { success: true };
  },
});

/**
 * Promotes one of the extra photos to be the item's main image.
 *
 * The main image lives on the inventory row and the rest live in their own table, which is why the
 * old editor offered "Change Main" and "Add Extra" as different actions with different uploaders.
 * They are one list to anyone using it, so this swaps the two rows rather than asking her to
 * re-upload a photo the catalog already has.
 */
export const setMainImage = mutation({
  args: { inventoryId: v.id("inventory"), imageId: v.id("extraImages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const [item, promoted] = await Promise.all([ctx.db.get(args.inventoryId), ctx.db.get(args.imageId)]);
    if (!item) throw new Error("Item not found");
    if (!promoted || promoted.inventoryId !== args.inventoryId) throw new Error("That photo is not on this item");

    const now = Date.now();

    await ctx.db.patch(args.inventoryId, {
      imagePath: promoted.imagePath,
      width: promoted.width,
      height: promoted.height,
      /* Extras predate the small variant, so fall back to the full image rather than storing an empty path. */
      smallImagePath: promoted.smallImagePath ?? promoted.imagePath,
      smallWidth: promoted.smallWidth ?? promoted.width,
      smallHeight: promoted.smallHeight ?? promoted.height,
      updatedAt: now,
    });

    /* The demoted main takes the promoted photo's slot, so the list length and order stay stable. */
    await ctx.db.patch(args.imageId, {
      imagePath: item.imagePath,
      width: item.width,
      height: item.height,
      smallImagePath: item.smallImagePath,
      smallWidth: item.smallWidth,
      smallHeight: item.smallHeight,
      title: undefined,
    });

    return { success: true };
  },
});
