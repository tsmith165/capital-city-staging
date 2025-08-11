import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("customer")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  inventory: defineTable({
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
    inUse: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_pId", ["pId"]),

  extraImages: defineTable({
    inventoryId: v.id("inventory"),
    title: v.optional(v.string()),
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    smallImagePath: v.optional(v.string()),
    smallWidth: v.optional(v.number()),
    smallHeight: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_inventory", ["inventoryId"]),

  projects: defineTable({
    ownerId: v.string(),
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
    paymentReceivedAt: v.optional(v.number()),
    paymentProcessedAt: v.optional(v.number()),
    mlsLink: v.optional(v.string()),
    invoiceLink: v.optional(v.string()),
    highlighted: v.boolean(),
    inventoryAssigned: v.boolean(),
    inventoryRentalCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_highlighted", ["highlighted"])
    .index("by_created", ["createdAt"]),

  projectImages: defineTable({
    projectId: v.id("projects"),
    ownerId: v.string(),
    imagePath: v.string(),
    width: v.number(),
    height: v.number(),
    thumbnailPath: v.optional(v.string()),
    thumbnailWidth: v.optional(v.number()),
    thumbnailHeight: v.optional(v.number()),
    displayOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  projectInventory: defineTable({
    projectId: v.id("projects"),
    inventoryId: v.id("inventory"),
    quantity: v.number(),
    pricePerItem: v.number(),
    assignedAt: v.number(),
    returnedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_inventory", ["inventoryId"])
    .index("by_active", ["projectId", "returnedAt"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    createdAt: v.number(),
    responded: v.boolean(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_created", ["createdAt"])
    .index("by_responded", ["responded"]),
});