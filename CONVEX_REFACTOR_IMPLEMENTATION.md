# Capital City Staging - Convex Implementation Guide

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Schema Implementation](#schema-implementation)
3. [Authentication Setup](#authentication-setup)
4. [Data Migration](#data-migration)
5. [Core Functions Implementation](#core-functions-implementation)
6. [UI Components Update](#ui-components-update)

## Initial Setup

### Step 1: Install Convex

```bash
pnpm add convex
```

### Step 2: Initialize Convex Project

```bash
pnpm dlx convex dev
```

This will:
- Create a new Convex project (or connect to existing)
- Generate `convex/` directory
- Add `.env.local` variables
- Start Convex development server

### Step 3: Update Environment Variables

Add to `.env.local`:
```env
# Convex (auto-generated)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Webhook Secret (new)
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 4: Configure Next.js

Update `src/app/layout.tsx`:
```typescript
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

Create `src/components/ConvexClientProvider.tsx`:
```typescript
'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

## Schema Implementation

### Step 1: Create Main Schema File

Create `convex/schema.ts`:
```typescript
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
```

### Step 2: Create Auth Configuration

Create `convex/auth.config.ts`:
```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

## Authentication Setup

### Step 1: Create User Functions

Create `convex/users.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Update user role
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});
```

### Step 2: Create Clerk Webhook

Create `src/app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    if (email) {
      await convexClient.mutation(api.users.getOrCreateUser, {
        clerkId: id,
        email,
        name: name || undefined,
      });
    }
  }

  return new Response('', { status: 200 });
}
```

## Data Migration

### Step 1: Create Migration Script

Create `scripts/migrate-to-convex.ts`:
```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { db, inventoryTable, extraImagesTable } from '@/db/db';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function migrateInventory() {
  console.log('Starting inventory migration...');
  
  // Fetch all inventory from PostgreSQL
  const inventory = await db.select().from(inventoryTable);
  
  for (const item of inventory) {
    await convexClient.mutation(api.inventory.create, {
      oId: item.o_id,
      pId: item.p_id,
      active: item.active ?? true,
      name: item.name,
      cost: item.cost ?? undefined,
      price: item.price,
      vendor: item.vendor,
      category: item.category,
      description: item.description,
      count: item.count,
      location: item.location,
      realWidth: item.real_width,
      realHeight: item.real_height,
      realDepth: item.real_depth,
      imagePath: item.image_path,
      width: item.width,
      height: item.height,
      smallImagePath: item.small_image_path,
      smallWidth: item.small_width,
      smallHeight: item.small_height,
      inUse: 0, // Initialize as not in use
    });
    
    console.log(`Migrated inventory item: ${item.name}`);
  }
  
  console.log('Inventory migration complete!');
}

async function migrateExtraImages() {
  console.log('Starting extra images migration...');
  
  // Fetch all extra images
  const extraImages = await db.select().from(extraImagesTable);
  
  for (const image of extraImages) {
    // Need to map old inventory IDs to new Convex IDs
    // This requires maintaining a mapping during migration
    // Implementation depends on your specific needs
  }
  
  console.log('Extra images migration complete!');
}

async function main() {
  await migrateInventory();
  await migrateExtraImages();
  console.log('Migration complete!');
}

main().catch(console.error);
```

### Step 2: Add Migration Script to package.json

Update `package.json`:
```json
{
  "scripts": {
    "migrate": "tsx scripts/migrate-to-convex.ts"
  }
}
```

### Step 3: Run Migration

```bash
pnpm run migrate
```

## Core Functions Implementation

### Step 1: Inventory Functions

Create `convex/inventory.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
```

### Step 2: Project Functions

Create `convex/projects.ts`:
```typescript
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
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.insert("projectImages", {
      projectId: args.projectId,
      ownerId: identity.subject,
      imagePath: args.imagePath,
      width: args.width,
      height: args.height,
      displayOrder: args.displayOrder,
      createdAt: Date.now(),
    });
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
```

## UI Components Update

### Step 1: Update Portfolio Component

Update `src/app/_main_components/portfolio.tsx`:
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Portfolio() {
  const projects = useQuery(api.projects.getHighlightedProjects);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState(false);

  const currentProject = projects?.[selectedProjectIndex];
  const images = currentProject?.images || [];

  if (!projects || projects.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-50px)] flex-col items-center justify-center space-y-4 p-4">
        <h1 className="text-4xl font-bold gradient-secondary-main-text">
          Portfolio Coming Soon
        </h1>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setFullScreenImage(true);
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedImageIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      return (prevIndex + 1) % images.length;
    });
  };

  const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedImageIndex((prevIndex) => {
      if (prevIndex === null) return images.length - 1;
      return (prevIndex - 1 + images.length) % images.length;
    });
  };

  return (
    <div className="flex min-h-[calc(100dvh-50px)] flex-col items-center justify-center space-y-4 p-4">
      <h1 className="h-fit text-4xl font-bold gradient-secondary-main-text">
        Staged by Mia
      </h1>
      
      {/* Project Pills */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {projects.map((project, index) => (
            <button
              key={project._id}
              onClick={() => setSelectedProjectIndex(index)}
              className={`px-4 py-2 rounded-full transition-all ${
                index === selectedProjectIndex
                  ? 'bg-yellow-600 text-white'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      )}

      {/* Project Info */}
      {currentProject && (
        <div className="text-center mb-4">
          {currentProject.address && (
            <p className="text-stone-400">{currentProject.address}</p>
          )}
          {currentProject.startDate && (
            <p className="text-stone-400 text-sm">
              {new Date(currentProject.startDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Image Grid */}
      <div className="x2l:px-48 grid grid-cols-1 gap-4 px-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-24 2xl:grid-cols-4">
        {images.map((image, index) => (
          <div key={image._id} className="relative">
            <Image
              src={image.thumbnailPath || image.imagePath}
              alt={`${currentProject?.name} - Image ${index + 1}`}
              width={image.thumbnailWidth || image.width}
              height={image.thumbnailHeight || image.height}
              className="w-full cursor-pointer rounded-lg object-cover"
              onClick={() => handleImageClick(index)}
              priority={index < 4}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {fullScreenImage && selectedImageIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 m-0 flex h-full w-full bg-black bg-opacity-85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullScreenImage(false)}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={images[selectedImageIndex].imagePath}
                  alt={`Full-screen image ${selectedImageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    aria-label="Previous"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
                  >
                    <IoIosArrowBack className="text-4xl text-white" />
                  </button>
                  <button
                    aria-label="Next"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
                  >
                    <IoIosArrowForward className="text-4xl text-white" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Step 2: Create Project Management Page

Create `src/app/admin/projects/page.tsx`:
```typescript
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminProjectsPage() {
  const projects = useQuery(api.projects.getAllProjects);
  const toggleHighlight = useMutation(api.projects.toggleProjectHighlight);

  const handleToggleHighlight = async (projectId: string) => {
    await toggleHighlight({ projectId: projectId as any });
  };

  if (!projects) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <Link
          href="/admin/projects/new"
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Create New Project
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-stone-800 rounded-lg">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Highlighted</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id} className="border-b border-stone-700">
                <td className="px-4 py-3">{project.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.status === 'active'
                        ? 'bg-green-600'
                        : project.status === 'completed'
                        ? 'bg-blue-600'
                        : project.status === 'draft'
                        ? 'bg-gray-600'
                        : 'bg-red-600'
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-3">{project.address || '-'}</td>
                <td className="px-4 py-3">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleHighlight(project._id)}
                    className={`px-3 py-1 rounded ${
                      project.highlighted
                        ? 'bg-yellow-600 text-white'
                        : 'bg-stone-600 text-stone-300'
                    }`}
                  >
                    {project.highlighted ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/projects/${project._id}/edit`}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/projects/${project._id}/inventory`}
                    className="text-green-400 hover:text-green-300"
                  >
                    Inventory
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Step 3: Create New Project Form

Create `src/app/admin/projects/new/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useUploadThing } from '@/lib/uploadthing';

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);
  const addProjectImage = useMutation(api.projects.addProjectImage);
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'draft' as const,
    address: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const { startUpload, isUploading } = useUploadThing('imageUploader');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create project
      const projectId = await createProject({
        name: formData.name,
        status: formData.status,
        address: formData.address || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
        notes: formData.notes || undefined,
      });

      // Upload images if any
      if (images.length > 0) {
        const uploadedFiles = await startUpload(images);
        
        if (uploadedFiles) {
          for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            await addProjectImage({
              projectId,
              imagePath: file.url,
              width: 1920, // You'd get actual dimensions
              height: 1080,
              displayOrder: i,
            });
          }
        }
      }

      router.push('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Project Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 bg-stone-800 rounded border border-stone-700 focus:border-yellow-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {isUploading ? 'Creating...' : 'Create Project'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/projects')}
            className="bg-stone-600 text-white px-6 py-2 rounded hover:bg-stone-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```