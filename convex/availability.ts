import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Availability is derived from `projectInventory`, never read from a counter.
 *
 * `inventory.inUse` used to be the source of truth and was wrong for every row in the table: it
 * was written once as `0` when an item was created and no mutation ever touched it again, so the
 * catalog reported the whole warehouse as free while 96 units sat in client houses. The join table
 * always knew the truth, so everything here reads it. `inUse` and `projects.inventoryAssigned` are
 * still written, by `syncItemCounter` and `syncProjectFlag` below, so that anything reading them
 * gets a true answer, but nothing in the app derives a decision from them.
 *
 * A unit is unavailable while an assignment row has no `returnedAt`, regardless of the holding
 * project's status. A chair in a house that sold last March is still in that house. Splitting those
 * units out as `awaitingCheckIn` is what makes the bookkeeping gap visible instead of silently
 * inflating what looks free.
 */

type Ctx = QueryCtx | MutationCtx;

/** Project statuses that mean the job is over, so anything still assigned was never checked in. */
const CLOSED_STATUSES: ReadonlySet<Doc<"projects">["status"]> = new Set(["completed", "cancelled"]);

export interface Holder {
  assignmentId: Id<"projectInventory">;
  projectId: Id<"projects">;
  projectName: string;
  projectStatus: Doc<"projects">["status"];
  quantity: number;
  pricePerItem: number;
  assignedAt: number;
  /** True when the holding project is finished, so this row is bookkeeping debt. */
  awaitingCheckIn: boolean;
}

export interface ItemAvailability {
  owned: number;
  /** Units at a house that is still being staged. */
  out: number;
  /** Units still assigned to a finished job. Physically out, but nobody recorded the return. */
  awaitingCheckIn: number;
  /** Units that can be put on a new job. Never negative, even if the data says otherwise. */
  free: number;
  /** Every open assignment, newest first. Drives the "Out · Watt Avenue" badge. */
  holders: Holder[];
}

export const EMPTY_AVAILABILITY: ItemAvailability = {
  owned: 0,
  out: 0,
  awaitingCheckIn: 0,
  free: 0,
  holders: [],
};

/** Every assignment row that has not been checked back in. */
export async function openAssignments(ctx: Ctx): Promise<Doc<"projectInventory">[]> {
  const rows = await ctx.db.query("projectInventory").collect();
  return rows.filter((row) => row.returnedAt === undefined);
}

/** Open assignment rows for one item, using the index so a single card does not scan the table. */
export async function openAssignmentsForItem(ctx: Ctx, inventoryId: Id<"inventory">) {
  return ctx.db
    .query("projectInventory")
    .withIndex("by_inventory_active", (q) => q.eq("inventoryId", inventoryId).eq("returnedAt", undefined))
    .collect();
}

/** Open assignment rows for one project, newest first. */
export async function openAssignmentsForProject(ctx: Ctx, projectId: Id<"projects">) {
  const rows = await ctx.db
    .query("projectInventory")
    .withIndex("by_active", (q) => q.eq("projectId", projectId).eq("returnedAt", undefined))
    .collect();

  return rows.sort((a, b) => b.assignedAt - a.assignedAt);
}

function toHolder(row: Doc<"projectInventory">, project: Doc<"projects"> | null): Holder {
  const status = project?.status ?? "completed";

  return {
    assignmentId: row._id,
    projectId: row.projectId,
    projectName: project?.name ?? "Deleted project",
    projectStatus: status,
    quantity: row.quantity,
    pricePerItem: row.pricePerItem,
    assignedAt: row.assignedAt,
    awaitingCheckIn: CLOSED_STATUSES.has(status),
  };
}

function summarise(owned: number, holders: Holder[]): ItemAvailability {
  let out = 0;
  let awaiting = 0;

  for (const holder of holders) {
    if (holder.awaitingCheckIn) awaiting += holder.quantity;
    else out += holder.quantity;
  }

  return { owned, out, awaitingCheckIn: awaiting, free: Math.max(0, owned - out - awaiting), holders };
}

/**
 * Availability for the whole catalog in one pass.
 *
 * Deliberately a single `collect()` over the join table rather than one indexed read per item: at
 * a hundred-odd assignment rows the whole table is smaller than the index reads it would replace,
 * and the alternative is 400+ round trips to render one grid.
 */
export async function availabilityByItem(ctx: Ctx): Promise<Map<Id<"inventory">, ItemAvailability>> {
  const [items, rows] = await Promise.all([ctx.db.query("inventory").collect(), openAssignments(ctx)]);

  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const projects = new Map(
    (await Promise.all(projectIds.map((id) => ctx.db.get(id)))).flatMap((project) => (project ? [[project._id, project] as const] : [])),
  );

  const holdersByItem = new Map<Id<"inventory">, Holder[]>();
  for (const row of rows) {
    const holder = toHolder(row, projects.get(row.projectId) ?? null);
    const existing = holdersByItem.get(row.inventoryId);
    if (existing) existing.push(holder);
    else holdersByItem.set(row.inventoryId, [holder]);
  }

  const availability = new Map<Id<"inventory">, ItemAvailability>();
  for (const item of items) {
    const holders = (holdersByItem.get(item._id) ?? []).sort((a, b) => b.assignedAt - a.assignedAt);
    availability.set(item._id, summarise(item.count, holders));
  }

  return availability;
}

/** Availability for a single item. Used by detail views and by assignment validation. */
export async function availabilityForItem(ctx: Ctx, inventoryId: Id<"inventory">): Promise<ItemAvailability> {
  const item = await ctx.db.get(inventoryId);
  if (!item) return EMPTY_AVAILABILITY;

  const rows = await openAssignmentsForItem(ctx, inventoryId);
  const holders = await Promise.all(rows.map(async (row) => toHolder(row, await ctx.db.get(row.projectId))));

  return summarise(
    item.count,
    holders.sort((a, b) => b.assignedAt - a.assignedAt),
  );
}

/**
 * Rewrite `inventory.inUse` from the join table.
 *
 * Call this in the same mutation as any write to `projectInventory` so the two can never disagree.
 * The join table stays authoritative; this only stops the stored number from being a lie.
 */
export async function syncItemCounter(ctx: MutationCtx, inventoryId: Id<"inventory">) {
  const item = await ctx.db.get(inventoryId);
  if (!item) return;

  const rows = await openAssignmentsForItem(ctx, inventoryId);
  const committed = rows.reduce((total, row) => total + row.quantity, 0);

  if (item.inUse !== committed) await ctx.db.patch(inventoryId, { inUse: committed });
}

/** Same idea for `projects.inventoryAssigned`, which was set on assign and never cleared. */
export async function syncProjectFlag(ctx: MutationCtx, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project) return;

  const rows = await openAssignmentsForProject(ctx, projectId);
  const assigned = rows.length > 0;
  const rentalCost = rows.reduce((total, row) => total + row.quantity * row.pricePerItem, 0);

  if (project.inventoryAssigned !== assigned || project.inventoryRentalCost !== rentalCost) {
    await ctx.db.patch(projectId, {
      inventoryAssigned: assigned,
      inventoryRentalCost: rentalCost,
      updatedAt: Date.now(),
    });
  }
}

export function isClosedStatus(status: Doc<"projects">["status"]) {
  return CLOSED_STATUSES.has(status);
}
