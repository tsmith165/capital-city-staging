import { query } from "./_generated/server";
import { isAdmin } from "./authz";
import { availabilityByItem, isClosedStatus } from "./availability";
import { attentionReasons, highestTier } from "./inventoryRules";

/**
 * The figures behind the dashboard and the analytics page.
 *
 * Everything inventory-shaped derives from open `projectInventory` rows. The previous version read
 * `inventory.inUse`, which was `0` on all 425 rows because no mutation ever wrote it, so the console
 * reported the entire warehouse as free while 96 units sat in client houses.
 */

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return null;

    const [inventory, projects, submissions, availability] = await Promise.all([
      ctx.db.query("inventory").collect(),
      ctx.db.query("projects").collect(),
      ctx.db.query("contactSubmissions").collect(),
      availabilityByItem(ctx),
    ]);

    const activeInventory = inventory.filter((item) => item.active);

    let units = 0;
    let out = 0;
    let awaitingCheckIn = 0;
    let fixNow = 0;
    let later = 0;

    for (const item of activeInventory) {
      const derived = availability.get(item._id);
      units += item.count;
      out += derived?.out ?? 0;
      awaitingCheckIn += derived?.awaitingCheckIn ?? 0;

      const tier = highestTier(attentionReasons(item, derived));
      if (tier === "fix-now") fixNow += 1;
      else if (tier === "later") later += 1;
    }

    /*
     * Houses, not rows. "21 units across 2 houses" is the sentence she would say; "13 assignment
     * records" is not.
     */
    const outProjects = new Set<string>();
    const strandedProjects = new Set<string>();
    for (const item of activeInventory) {
      for (const holder of availability.get(item._id)?.holders ?? []) {
        (holder.awaitingCheckIn ? strandedProjects : outProjects).add(holder.projectId);
      }
    }

    const activeProjects = projects.filter((project) => project.status === "active");
    const completedProjects = projects.filter((project) => project.status === "completed");
    const awaitingPayment = completedProjects.filter((project) => !project.paymentReceivedAt);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    const revenueThisYear = completedProjects
      .filter((project) => (project.endDate ?? project.updatedAt) >= startOfYear)
      .reduce((total, project) => total + (project.revenue ?? 0), 0);

    /* Rental value of what is physically at a house being staged right now. */
    let deployedValue = 0;
    for (const item of activeInventory) {
      for (const holder of availability.get(item._id)?.holders ?? []) {
        if (!holder.awaitingCheckIn) deployedValue += holder.quantity * holder.pricePerItem;
      }
    }

    return {
      inventory: {
        active: activeInventory.length,
        total: inventory.length,
        units,
        out,
        awaitingCheckIn,
        free: Math.max(0, units - out - awaitingCheckIn),
        outProjects: outProjects.size,
        strandedProjects: strandedProjects.size,
        deployedValue,
        needsAttention: fixNow,
        needsAttentionLater: later,
      },
      projects: {
        active: activeProjects.length,
        draft: projects.filter((project) => project.status === "draft").length,
        completed: completedProjects.length,
        awaitingPayment: awaitingPayment.length,
        revenueThisYear,
        /* Named so the dashboard can say which house, when there is exactly one. */
        activeName: activeProjects.length === 1 ? activeProjects[0].name : null,
      },
      inbox: {
        unanswered: submissions.filter((submission) => !submission.responded).length,
        total: submissions.length,
      },
    };
  },
});

/** Active inventory with something wrong, with the tiered reason list the queue renders. */
export const getInventoryNeedingAttention = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    const [inventory, availability] = await Promise.all([
      ctx.db
        .query("inventory")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect(),
      availabilityByItem(ctx),
    ]);

    return inventory
      .map((item) => {
        const derived = availability.get(item._id);
        return { item, derived, reasons: attentionReasons(item, derived) };
      })
      .filter(({ reasons }) => reasons.length > 0)
      .map(({ item, derived, reasons }) => ({
        _id: item._id,
        oId: item.oId,
        name: item.name,
        category: item.category,
        price: item.price,
        realWidth: item.realWidth,
        realHeight: item.realHeight,
        realDepth: item.realDepth,
        smallImagePath: item.smallImagePath,
        imagePath: item.imagePath,
        owned: item.count,
        out: derived?.out ?? 0,
        awaitingCheckIn: derived?.awaitingCheckIn ?? 0,
        holderName: derived?.holders[0]?.projectName ?? null,
        tier: highestTier(reasons),
        reasons,
      }))
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier === "fix-now" ? -1 : 1;
        return b.oId - a.oId;
      });
  },
});

/** Projects the owner still owes work, an invoice, or a check-in on. Newest first. */
export const getProjectsNeedingAttention = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return [];

    const projects = await ctx.db.query("projects").withIndex("by_created").order("desc").collect();

    const rows = await Promise.all(
      projects.map(async (project) => {
        const open = await ctx.db
          .query("projectInventory")
          .withIndex("by_active", (q) => q.eq("projectId", project._id).eq("returnedAt", undefined))
          .collect();

        const awaitingCheckIn = isClosedStatus(project.status) && open.length > 0;
        const awaitingPayment = project.status === "completed" && !project.paymentReceivedAt;

        return {
          _id: project._id,
          name: project.name,
          status: project.status,
          address: project.address,
          revenue: project.revenue,
          endDate: project.endDate,
          awaitingPayment,
          awaitingCheckIn,
          openUnits: open.reduce((total, row) => total + row.quantity, 0),
        };
      }),
    );

    return rows.filter((row) => row.status === "active" || row.awaitingPayment || row.awaitingCheckIn);
  },
});
