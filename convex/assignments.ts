import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin, isAdmin } from "./authz";
import { availabilityByItem, isClosedStatus, openAssignmentsForProject, syncItemCounter, syncProjectFlag } from "./availability";

/**
 * Assigning and checking in inventory.
 *
 * Two shapes matter here. Staging a house is a picking task, so `assignItemsToProject` takes the
 * whole pull list and commits it as one transaction; the old per-item mutation meant twenty
 * round trips and twenty chances to end up half-assigned. And a line carries the *total* quantity
 * wanted at that house rather than a delta, which makes the call idempotent and lets the stepper in
 * the picker send the same shape whether the item is new to the project or already there.
 *
 * `checkInAssignments` accepts an explicit `returnedAt` because the first real use of it is
 * reconciling jobs that finished months ago. Stamping those with today's date would put a year of
 * phantom rental duration into every history figure.
 */

/** One requested line: how many units of this item should end up at this project. */
const assignmentLine = v.object({
  inventoryId: v.id("inventory"),
  quantity: v.number(),
});

interface LineProblem {
  inventoryId: Id<"inventory">;
  itemName: string;
  requested: number;
  free: number;
  message: string;
}

function describeShortfall(item: Doc<"inventory">, free: number, holders: { projectName: string; awaitingCheckIn: boolean }[]) {
  if (free <= 0 && holders.length > 0) {
    const stranded = holders.find((holder) => holder.awaitingCheckIn);
    if (stranded) return `All ${item.count} are still checked out to ${stranded.projectName}`;
    return `All ${item.count} are out on ${holders[0].projectName}`;
  }

  const stranded = holders.find((holder) => holder.awaitingCheckIn);
  if (stranded) return `Only ${free} free — the rest is still checked out to ${stranded.projectName}`;

  return `Only ${free} free of ${item.count} owned`;
}

/**
 * Commit a whole pull list at once.
 *
 * Nothing is written unless every line fits. A single operator picking furniture would rather be
 * told "the other lamp is still at Watt Avenue" and fix that one line than discover afterwards that
 * eighteen of twenty items made it.
 */
export const assignItemsToProject = mutation({
  args: {
    projectId: v.id("projects"),
    lines: v.array(assignmentLine),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (args.lines.length === 0) return { ok: true as const, added: 0, updated: 0, removed: 0 };

    const availability = await availabilityByItem(ctx);
    const existing = new Map((await openAssignmentsForProject(ctx, args.projectId)).map((row) => [row.inventoryId, row] as const));

    const problems: LineProblem[] = [];
    const writes: { item: Doc<"inventory">; quantity: number; current: Doc<"projectInventory"> | undefined }[] = [];

    for (const line of args.lines) {
      const item = await ctx.db.get(line.inventoryId);
      if (!item) {
        problems.push({
          inventoryId: line.inventoryId,
          itemName: "Deleted item",
          requested: line.quantity,
          free: 0,
          message: "This item no longer exists",
        });
        continue;
      }

      const quantity = Math.floor(line.quantity);
      if (quantity < 0) {
        problems.push({
          inventoryId: item._id,
          itemName: item.name,
          requested: line.quantity,
          free: 0,
          message: "Quantity cannot be negative",
        });
        continue;
      }

      const current = existing.get(item._id);
      const alreadyHere = current?.quantity ?? 0;
      /* Only the increase needs to come out of free stock; what is already at this house is here. */
      const needed = quantity - alreadyHere;
      const itemAvailability = availability.get(item._id);
      const free = itemAvailability?.free ?? 0;

      if (needed > free) {
        problems.push({
          inventoryId: item._id,
          itemName: item.name,
          requested: quantity,
          free: free + alreadyHere,
          message: describeShortfall(item, free + alreadyHere, itemAvailability?.holders ?? []),
        });
        continue;
      }

      writes.push({ item, quantity, current });
    }

    if (problems.length > 0) return { ok: false as const, problems };

    const now = Date.now();
    let added = 0;
    let updated = 0;
    let removed = 0;

    for (const write of writes) {
      if (write.quantity === 0) {
        /* A stepper taken down to zero means "take it off this job", not an empty assignment row. */
        if (write.current) {
          await ctx.db.patch(write.current._id, { returnedAt: now });
          removed += 1;
        }
        continue;
      }

      if (write.current) {
        if (write.current.quantity !== write.quantity) {
          await ctx.db.patch(write.current._id, { quantity: write.quantity });
          updated += 1;
        }
        continue;
      }

      await ctx.db.insert("projectInventory", {
        projectId: args.projectId,
        inventoryId: write.item._id,
        quantity: write.quantity,
        pricePerItem: write.item.price,
        assignedAt: now,
      });
      added += 1;
    }

    for (const write of writes) await syncItemCounter(ctx, write.item._id);
    await syncProjectFlag(ctx, args.projectId);

    return { ok: true as const, added, updated, removed };
  },
});

/**
 * Record inventory as physically back.
 *
 * `returnedAt` is caller-supplied so the one-time reconciliation can backdate a check-in to the day
 * the job actually ended.
 */
export const checkInAssignments = mutation({
  args: {
    assignmentIds: v.array(v.id("projectInventory")),
    returnedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const stamp = args.returnedAt ?? Date.now();
    const touchedItems = new Set<Id<"inventory">>();
    const touchedProjects = new Set<Id<"projects">>();
    let units = 0;

    for (const assignmentId of args.assignmentIds) {
      const row = await ctx.db.get(assignmentId);
      if (!row || row.returnedAt !== undefined) continue;

      await ctx.db.patch(assignmentId, { returnedAt: stamp });
      touchedItems.add(row.inventoryId);
      touchedProjects.add(row.projectId);
      units += row.quantity;
    }

    for (const inventoryId of touchedItems) await syncItemCounter(ctx, inventoryId);
    for (const projectId of touchedProjects) await syncProjectFlag(ctx, projectId);

    return { checkedIn: touchedItems.size, units };
  },
});

/** Undo a check-in recorded by mistake. The row goes back to being open. */
export const reopenAssignment = mutation({
  args: { assignmentId: v.id("projectInventory") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const row = await ctx.db.get(args.assignmentId);
    if (!row) throw new Error("Assignment not found");

    await ctx.db.patch(args.assignmentId, { returnedAt: undefined });
    await syncItemCounter(ctx, row.inventoryId);
    await syncProjectFlag(ctx, row.projectId);
  },
});

/** Re-snapshot `pricePerItem` from the item's current price. Fixes rows priced at $0. */
export const repriceAssignments = mutation({
  args: { assignmentIds: v.array(v.id("projectInventory")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const touchedProjects = new Set<Id<"projects">>();
    let repriced = 0;

    for (const assignmentId of args.assignmentIds) {
      const row = await ctx.db.get(assignmentId);
      if (!row) continue;

      const item = await ctx.db.get(row.inventoryId);
      if (!item || item.price === row.pricePerItem) continue;

      await ctx.db.patch(assignmentId, { pricePerItem: item.price });
      touchedProjects.add(row.projectId);
      repriced += 1;
    }

    for (const projectId of touchedProjects) await syncProjectFlag(ctx, projectId);

    return { repriced };
  },
});

/**
 * Everything the picker needs in one read: the catalog with derived availability, plus what this
 * project already holds. Three separate queries meant three separate loading states for one screen.
 */
export const getPickerData = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const [availability, assignedRows] = await Promise.all([availabilityByItem(ctx), openAssignmentsForProject(ctx, args.projectId)]);

    const assignedByItem = new Map(assignedRows.map((row) => [row.inventoryId, row] as const));

    const items = (
      await ctx.db
        .query("inventory")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect()
    )
      .map((item) => {
        const derived = availability.get(item._id);
        const mine = assignedByItem.get(item._id);
        /* Units this project holds are spendable by this project, so fold them back into the cap. */
        const assignedHere = mine?.quantity ?? 0;

        return {
          _id: item._id,
          oId: item.oId,
          name: item.name,
          category: item.category,
          price: item.price,
          location: item.location,
          description: item.description,
          imagePath: item.imagePath,
          smallImagePath: item.smallImagePath,
          owned: item.count,
          free: derived?.free ?? 0,
          out: derived?.out ?? 0,
          awaitingCheckIn: derived?.awaitingCheckIn ?? 0,
          maxForThisProject: (derived?.free ?? 0) + assignedHere,
          assignedHere,
          assignmentId: mine?._id,
          holders: (derived?.holders ?? [])
            .filter((holder) => holder.projectId !== args.projectId)
            .map((holder) => ({
              projectId: holder.projectId,
              projectName: holder.projectName,
              quantity: holder.quantity,
              awaitingCheckIn: holder.awaitingCheckIn,
            })),
        };
      })
      .sort((a, b) => b.oId - a.oId);

    return {
      project: { _id: project._id, name: project.name, status: project.status, address: project.address },
      items,
    };
  },
});

/** Open and historical assignments for one project, with the item each row points at. */
export const getProjectAssignments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const rows = await ctx.db
      .query("projectInventory")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const lines = await Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.inventoryId);
        return {
          _id: row._id,
          inventoryId: row.inventoryId,
          quantity: row.quantity,
          pricePerItem: row.pricePerItem,
          assignedAt: row.assignedAt,
          returnedAt: row.returnedAt,
          name: item?.name ?? "Deleted item",
          category: item?.category ?? "",
          smallImagePath: item?.smallImagePath ?? "",
          imagePath: item?.imagePath ?? "",
          currentPrice: item?.price ?? 0,
          oId: item?.oId,
        };
      }),
    );

    const open = lines.filter((line) => line.returnedAt === undefined).sort((a, b) => b.assignedAt - a.assignedAt);
    const returned = lines.filter((line) => line.returnedAt !== undefined).sort((a, b) => (b.returnedAt ?? 0) - (a.returnedAt ?? 0));

    return {
      project: {
        _id: project._id,
        name: project.name,
        status: project.status,
        address: project.address,
        endDate: project.endDate,
      },
      open,
      returned,
      openUnits: open.reduce((total, line) => total + line.quantity, 0),
      openValue: open.reduce((total, line) => total + line.quantity * line.pricePerItem, 0),
    };
  },
});

/**
 * Inventory still assigned to jobs that are over, grouped by project.
 *
 * This is the reconciliation queue. Grouping matters: the debt is 65 rows but only five or six
 * houses, and "was everything from Watt Avenue returned?" is a question someone can actually answer.
 */
export const getAwaitingCheckIn = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    const projects = await ctx.db.query("projects").collect();
    const closed = projects.filter((project) => isClosedStatus(project.status));

    const groups = await Promise.all(
      closed.map(async (project) => {
        const rows = await openAssignmentsForProject(ctx, project._id);
        if (rows.length === 0) return null;

        const lines = await Promise.all(
          rows.map(async (row) => {
            const item = await ctx.db.get(row.inventoryId);
            return {
              _id: row._id,
              quantity: row.quantity,
              pricePerItem: row.pricePerItem,
              assignedAt: row.assignedAt,
              name: item?.name ?? "Deleted item",
              category: item?.category ?? "",
              smallImagePath: item?.smallImagePath ?? "",
            };
          }),
        );

        return {
          projectId: project._id,
          projectName: project.name,
          status: project.status,
          address: project.address,
          endDate: project.endDate,
          updatedAt: project.updatedAt,
          lines,
          units: lines.reduce((total, line) => total + line.quantity, 0),
        };
      }),
    );

    return groups.flatMap((group) => (group ? [group] : [])).sort((a, b) => (b.endDate ?? b.updatedAt) - (a.endDate ?? a.updatedAt));
  },
});

/** Every job an item has ever been on. Answers "has this ever earned anything?" before selling it. */
export const getItemHistory = query({
  args: { inventoryId: v.id("inventory") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) return [];

    const rows = await ctx.db
      .query("projectInventory")
      .withIndex("by_inventory", (q) => q.eq("inventoryId", args.inventoryId))
      .collect();

    const lines = await Promise.all(
      rows.map(async (row) => {
        const project = await ctx.db.get(row.projectId);
        return {
          _id: row._id,
          projectId: row.projectId,
          projectName: project?.name ?? "Deleted project",
          projectStatus: project?.status ?? ("completed" as const),
          quantity: row.quantity,
          pricePerItem: row.pricePerItem,
          assignedAt: row.assignedAt,
          returnedAt: row.returnedAt,
        };
      }),
    );

    return lines.sort((a, b) => b.assignedAt - a.assignedAt);
  },
});

/**
 * Recompute `inventory.inUse` and `projects.inventoryAssigned` from the join table.
 *
 * Both fields drifted for the entire life of the old assign/return mutations. Every mutation here
 * keeps them current, so this exists to repair the existing rows once and to give the tools page a
 * way to prove they still agree.
 */
export const reconcileCounters = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [items, projects] = await Promise.all([ctx.db.query("inventory").collect(), ctx.db.query("projects").collect()]);

    let itemsCorrected = 0;
    for (const item of items) {
      const before = item.inUse;
      await syncItemCounter(ctx, item._id);
      const after = await ctx.db.get(item._id);
      if (after && after.inUse !== before) itemsCorrected += 1;
    }

    let projectsCorrected = 0;
    for (const project of projects) {
      const before = project.inventoryAssigned;
      const beforeCost = project.inventoryRentalCost;
      await syncProjectFlag(ctx, project._id);
      const after = await ctx.db.get(project._id);
      if (after && (after.inventoryAssigned !== before || after.inventoryRentalCost !== beforeCost)) {
        projectsCorrected += 1;
      }
    }

    return { itemsChecked: items.length, itemsCorrected, projectsChecked: projects.length, projectsCorrected };
  },
});
