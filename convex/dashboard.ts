import { query } from "./_generated/server";

const PLACEHOLDER_IMAGE_VALUES = ["", "Not yet uploaded"];

function hasImage(path: string | undefined): boolean {
  return typeof path === "string" && !PLACEHOLDER_IMAGE_VALUES.includes(path.trim());
}

/**
 * Reasons a single inventory item cannot be trusted on the public site.
 * Kept here so the dashboard count and the Needs attention queue can never disagree.
 */
export function inventoryAttentionReasons(item: {
  imagePath: string;
  smallImagePath: string;
  realWidth: number;
  realHeight: number;
  realDepth: number;
  price: number;
  count: number;
  inUse: number;
}): string[] {
  const reasons: string[] = [];

  if (!hasImage(item.imagePath)) reasons.push("Missing photo");
  if (!hasImage(item.smallImagePath)) reasons.push("Missing optimized thumbnail");
  if (!item.realWidth || !item.realHeight || !item.realDepth) reasons.push("Missing real dimensions");
  if (!item.price) reasons.push("No rental price set");
  if (item.inUse > item.count) reasons.push("Assigned out more times than owned");

  return reasons;
}

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const [inventory, projects, submissions] = await Promise.all([
      ctx.db.query("inventory").collect(),
      ctx.db.query("projects").collect(),
      ctx.db.query("contactSubmissions").collect(),
    ]);

    const activeInventory = inventory.filter((item) => item.active);
    const needsAttention = activeInventory.filter((item) => inventoryAttentionReasons(item).length > 0);

    const activeProjects = projects.filter((project) => project.status === "active");
    const completedProjects = projects.filter((project) => project.status === "completed");
    const awaitingPayment = completedProjects.filter((project) => !project.paymentReceivedAt);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    const revenueThisYear = completedProjects
      .filter((project) => (project.endDate ?? project.updatedAt) >= startOfYear)
      .reduce((total, project) => total + (project.revenue ?? 0), 0);

    return {
      inventory: {
        active: activeInventory.length,
        total: inventory.length,
        needsAttention: needsAttention.length,
        inUse: activeInventory.reduce((total, item) => total + item.inUse, 0),
        units: activeInventory.reduce((total, item) => total + item.count, 0),
      },
      projects: {
        active: activeProjects.length,
        draft: projects.filter((project) => project.status === "draft").length,
        completed: completedProjects.length,
        awaitingPayment: awaitingPayment.length,
        revenueThisYear,
      },
      inbox: {
        unanswered: submissions.filter((submission) => !submission.responded).length,
        total: submissions.length,
      },
    };
  },
});

/** Active inventory that is incomplete, with the reason list the queue renders. */
export const getInventoryNeedingAttention = query({
  args: {},
  handler: async (ctx) => {
    const inventory = await ctx.db.query("inventory").withIndex("by_active", (q) => q.eq("active", true)).collect();

    return inventory
      .map((item) => ({ item, reasons: inventoryAttentionReasons(item) }))
      .filter(({ reasons }) => reasons.length > 0)
      .map(({ item, reasons }) => ({
        _id: item._id,
        oId: item.oId,
        name: item.name,
        category: item.category,
        smallImagePath: item.smallImagePath,
        imagePath: item.imagePath,
        reasons,
      }));
  },
});

/** Projects the owner still owes work or an invoice on, newest first. */
export const getProjectsNeedingAttention = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").withIndex("by_created").order("desc").collect();

    return projects
      .filter((project) => project.status === "active" || (project.status === "completed" && !project.paymentReceivedAt))
      .map((project) => ({
        _id: project._id,
        name: project.name,
        status: project.status,
        address: project.address,
        revenue: project.revenue,
        endDate: project.endDate,
        awaitingPayment: project.status === "completed" && !project.paymentReceivedAt,
      }));
  },
});
