# Capital City Staging - Convex Refactor Specification

## Executive Summary

This document outlines the complete specification for migrating Capital City Staging from PostgreSQL (Neon) to Convex, while maintaining the NextJS framework and adding new project management capabilities. The refactor will introduce real-time data synchronization, improved state management, and enhanced features for both customers and administrators.

## Core Architecture Changes

### Database Migration
- **From**: PostgreSQL (Neon) + Drizzle ORM
- **To**: Convex (real-time database with built-in synchronization)
- **File Storage**: Maintain UploadThing for image uploads
- **Authentication**: Maintain Clerk with Convex integration

### State Management
- **Navigation State**: Keep Zustand for UI navigation
- **Data State**: Replace inventory_store.ts with Convex real-time queries
- **Benefits**: Automatic synchronization, optimistic updates, real-time collaboration

## Database Schema Design

### 1. Users Table
```typescript
users: {
  clerkId: string (unique)        // Clerk user ID
  email: string
  name?: string
  role: "admin" | "customer"
  createdAt: number                // Timestamp
  updatedAt: number                // Timestamp
}
```

### 2. Inventory Table
```typescript
inventory: {
  oId: number                      // Original ID from old system
  pId: number                      // Priority ID for ordering
  active: boolean
  name: string
  cost?: number
  price: number
  vendor: string
  category: string
  description: string
  count: number                    // Total quantity available
  location: string
  realWidth: number
  realHeight: number
  realDepth: number
  imagePath: string
  width: number
  height: number
  smallImagePath: string
  smallWidth: number
  smallHeight: number
  inUse: number                    // Quantity currently in use
  createdAt: number
  updatedAt: number
}
```

### 3. Extra Images Table
```typescript
extraImages: {
  inventoryId: Id<"inventory">
  title?: string
  imagePath: string
  width: number
  height: number
  smallImagePath?: string
  smallWidth?: number
  smallHeight?: number
  createdAt: number
}
```

### 4. Projects Table
```typescript
projects: {
  ownerId: string                  // Clerk user ID
  name: string
  status: "draft" | "active" | "completed" | "cancelled"
  startDate?: number
  endDate?: number
  revenue?: number
  address?: string
  paymentReceivedAt?: number
  paymentProcessedAt?: number
  mlsLink?: string
  invoiceLink?: string
  highlighted: boolean             // Display on homepage portfolio
  inventoryAssigned: boolean       // Has inventory been assigned
  inventoryRentalCost?: number     // Total cost of rented inventory
  notes?: string
  createdAt: number
  updatedAt: number
}
```

### 5. Project Images Table
```typescript
projectImages: {
  projectId: Id<"projects">
  ownerId: string                  // Clerk user ID (for access control)
  imagePath: string
  width: number
  height: number
  thumbnailPath?: string
  thumbnailWidth?: number
  thumbnailHeight?: number
  displayOrder: number             // For ordering images
  createdAt: number
}
```

### 6. Project Inventory Table (Junction)
```typescript
projectInventory: {
  projectId: Id<"projects">
  inventoryId: Id<"inventory">
  quantity: number
  pricePerItem: number             // Price at time of assignment
  assignedAt: number
  returnedAt?: number              // When item was returned
}
```

### 7. Contact Submissions Table
```typescript
contactSubmissions: {
  name: string
  email: string
  phone?: string
  message: string
  createdAt: number
  responded: boolean
  respondedAt?: number
}
```

## Feature Specifications

### 1. Public Website Features

#### Portfolio Display System
- Display highlighted projects on homepage
- Pill navigation for switching between projects
- Show most recent highlighted project by default
- Image gallery with lightbox functionality
- Project details (address, date, etc.) on hover/click

#### Inventory Browsing
- Category filtering with real-time updates
- Search functionality
- Availability status display
- "Request Quote" for items (leads to contact form)

#### Contact System
- Contact form submission
- Store in Convex database
- Email notification via existing Resend integration

### 2. Customer Features

#### User Registration/Login
- Clerk authentication
- Automatic user creation in Convex on first login
- Profile management

#### Project Management
- View own projects
- Project status tracking
- Download invoices
- View assigned inventory
- Project timeline visualization

### 3. Admin Features

#### Project Management
- Create new projects
- Upload project images
- Set project as highlighted for portfolio
- Assign inventory to projects
- Track inventory availability
- Generate invoices
- View all projects (not just own)

#### Inventory Management
- CRUD operations for inventory
- Bulk operations
- Image upload and management
- Real-time availability tracking
- Reorder items (pId management)

#### User Management
- View all users
- Change user roles
- View user projects
- Access analytics

### 4. Real-time Features

#### Live Inventory Updates
- Availability changes reflected instantly
- "In Use" status updates across all clients
- Optimistic UI updates

#### Project Status Updates
- Real-time project status changes
- Inventory assignment notifications
- Payment status updates

## User Interface Specifications

### 1. New Pages Required

#### `/projects` - Customer Project Dashboard
- List of user's projects
- Project cards with status, dates, and preview image
- Quick actions (view details, download invoice)

#### `/projects/[id]` - Project Details
- Project information
- Image gallery
- Assigned inventory list
- Timeline/status tracker
- Invoice download

#### `/admin/projects` - Admin Project Management
- All projects table
- Filtering and search
- Quick actions (edit, highlight, delete)
- Bulk operations

#### `/admin/projects/new` - Create Project
- Project information form
- Image upload area
- Inventory assignment interface
- Save as draft or activate

#### `/admin/projects/[id]/edit` - Edit Project
- Edit all project details
- Manage images (add/remove/reorder)
- Manage inventory assignments
- Update status

### 2. Updated Components

#### Portfolio Component
- Replace hardcoded images with dynamic project data
- Add pill navigation for highlighted projects
- Implement smooth transitions between projects
- Add loading states

#### Inventory Grid
- Add availability indicators
- Show "in use" count
- Real-time updates via Convex subscriptions

#### Admin Inventory Editor
- Add "in use" tracking
- Show which projects are using each item
- Prevent deletion of items in active projects

## Authentication & Authorization

### User Roles
1. **Guest** (not logged in)
   - View public pages
   - Browse inventory
   - Submit contact form

2. **Customer** (logged in)
   - All guest permissions
   - View own projects
   - Download own invoices
   - Update profile

3. **Admin**
   - All customer permissions
   - Create/edit/delete inventory
   - Create/edit/delete all projects
   - Manage users
   - Access analytics

### Clerk Integration
- Webhook for user creation in Convex
- Role management via Clerk metadata
- Session validation in Convex functions

## Data Migration Strategy

### Phase 1: Setup
1. Initialize Convex in project
2. Create schema files
3. Set up Clerk webhook

### Phase 2: Data Export
1. Export existing inventory data
2. Export existing images metadata
3. Create migration scripts

### Phase 3: Import to Convex
1. Import inventory items
2. Import extra images
3. Verify data integrity

### Phase 4: Feature Development
1. Implement project management
2. Update portfolio component
3. Add real-time features

### Phase 5: Testing & Deployment
1. Test all CRUD operations
2. Verify real-time updates
3. Test authentication flows
4. Deploy to production

## Technical Implementation Notes

### Convex Setup
- Use Convex npm package
- Configure with Clerk auth
- Set up file storage references

### Type Safety
- Generate TypeScript types from Convex schema
- Use zod for runtime validation
- Maintain strict typing throughout

### Performance Considerations
- Implement pagination for large datasets
- Use Convex indexes for queries
- Optimize image loading with lazy loading
- Cache static content appropriately

### Security Considerations
- Validate all inputs
- Implement proper access control in Convex functions
- Sanitize user-generated content
- Secure file upload process

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- Real-time update latency < 100ms
- 99.9% uptime
- Zero data loss during migration

### Business Metrics
- Improved inventory management efficiency
- Faster project creation workflow
- Better customer engagement via project tracking
- Increased portfolio visibility

## Timeline Estimate

### Week 1
- Convex setup and schema creation
- Authentication integration
- Data migration scripts

### Week 2
- Project management features
- Inventory assignment system
- Real-time updates

### Week 3
- UI updates and new pages
- Testing and bug fixes
- Documentation

### Week 4
- Deployment preparation
- Performance optimization
- Final testing and go-live

## Risk Mitigation

### Data Migration Risks
- **Risk**: Data loss during migration
- **Mitigation**: Complete backup, staged migration, verification scripts

### Performance Risks
- **Risk**: Slower queries than PostgreSQL
- **Mitigation**: Proper indexing, pagination, caching strategies

### User Experience Risks
- **Risk**: Confusion during transition
- **Mitigation**: Maintain similar UI, provide training/documentation

## Appendices

### A. Convex Function Examples

```typescript
// Example: Get highlighted projects for portfolio
export const getHighlightedProjects = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("highlighted"), true))
      .order("desc")
      .take(10);
  },
});

// Example: Assign inventory to project
export const assignInventoryToProject = mutation({
  args: {
    projectId: v.id("projects"),
    inventoryId: v.id("inventory"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check availability
    const inventory = await ctx.db.get(args.inventoryId);
    if (!inventory) throw new Error("Inventory not found");
    
    const available = inventory.count - inventory.inUse;
    if (available < args.quantity) {
      throw new Error("Insufficient inventory");
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
    });
  },
});
```

### B. Required Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk (existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# UploadThing (existing)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Resend (existing)
RESEND_API_KEY=
```

### C. File Structure Changes

```
src/
├── convex/
│   ├── schema.ts          # Database schema
│   ├── auth.config.ts     # Clerk integration
│   ├── inventory.ts       # Inventory functions
│   ├── projects.ts        # Project functions
│   ├── users.ts           # User functions
│   └── _generated/        # Auto-generated files
├── app/
│   ├── projects/          # New customer pages
│   ├── admin/
│   │   └── projects/      # New admin pages
│   └── api/
│       └── webhooks/
│           └── clerk.ts   # User sync webhook
└── components/
    └── projects/          # New project components
```

## Conclusion

This refactor will modernize the Capital City Staging application with real-time capabilities, improved project management, and better user experience while maintaining the existing NextJS framework and design aesthetic. The migration to Convex will provide automatic synchronization, type safety, and simplified state management.