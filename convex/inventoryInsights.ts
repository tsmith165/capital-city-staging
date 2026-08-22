import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { isAdmin } from "./authz";
import { availabilityByItem } from "./availability";

/**
 * Inventory figures for the analytics page.
 *
 * A single utilisation percentage was the wrong headline for a business that runs roughly one job at
 * a time: it swings between 4% and 25% for reasons that have nothing to do with how well the
 * furniture is working, and it drives no decision. These answer the questions that do change
 * behaviour — what is out, what it is worth, how much furniture a job actually consumes, what earns,
 * and what has never left the warehouse.
 */

const TOP_LIST_SIZE = 8;

export const getInventoryInsights = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) return null;

    const [items, projects, assignments, availability] = await Promise.all([
      ctx.db.query("inventory").collect(),
      ctx.db.query("projects").collect(),
      ctx.db.query("projectInventory").collect(),
      availabilityByItem(ctx),
    ]);

    const itemsById = new Map(items.map((item) => [item._id, item] as const));
    const projectsById = new Map(projects.map((project) => [project._id, project] as const));
    const activeItems = items.filter((item) => item.active);

    let units = 0;
    let out = 0;
    let awaitingCheckIn = 0;
    let deployedValue = 0;

    for (const item of activeItems) {
      const derived = availability.get(item._id);
      units += item.count;
      out += derived?.out ?? 0;
      awaitingCheckIn += derived?.awaitingCheckIn ?? 0;

      for (const holder of derived?.holders ?? []) {
        if (!holder.awaitingCheckIn) deployedValue += holder.quantity * holder.pricePerItem;
      }
    }

    /* Lifetime rental value per item, and how many jobs it has been on. */
    const earnedByItem = new Map<Id<"inventory">, { earned: number; stagings: number }>();
    const valueByProject = new Map<Id<"projects">, number>();
    const stagingsByCategory = new Map<string, number>();

    for (const row of assignments) {
      const value = row.quantity * row.pricePerItem;

      const item = itemsById.get(row.inventoryId);
      const existing = earnedByItem.get(row.inventoryId) ?? { earned: 0, stagings: 0 };
      earnedByItem.set(row.inventoryId, { earned: existing.earned + value, stagings: existing.stagings + 1 });

      valueByProject.set(row.projectId, (valueByProject.get(row.projectId) ?? 0) + value);

      if (item) stagingsByCategory.set(item.category, (stagingsByCategory.get(item.category) ?? 0) + 1);
    }

    /*
     * Averaged over completed jobs only. Draft and active projects are mid-pick, so folding them in
     * would drag the figure down and make every job look under-furnished.
     */
    const completedValues = projects
      .filter((project) => project.status === "completed")
      .map((project) => valueByProject.get(project._id) ?? 0);
    const averagePerJob = completedValues.length ? completedValues.reduce((total, value) => total + value, 0) / completedValues.length : 0;

    const topEarners = [...earnedByItem.entries()]
      .map(([id, stats]) => ({ name: itemsById.get(id)?.name ?? "Deleted item", ...stats }))
      .filter((entry) => entry.earned > 0)
      .sort((a, b) => b.earned - a.earned)
      .slice(0, TOP_LIST_SIZE)
      .map((entry) => ({ label: entry.name, value: entry.earned, hint: `${entry.stagings} jobs` }));

    /* Dead capital: active items that have never been on a job at all. */
    const neverStaged = activeItems.filter((item) => !earnedByItem.has(item._id));
    const neverStagedByCategory = new Map<string, number>();
    for (const item of neverStaged) {
      neverStagedByCategory.set(item.category, (neverStagedByCategory.get(item.category) ?? 0) + 1);
    }

    const busiestProject = [...valueByProject.entries()]
      .map(([id, value]) => ({ name: projectsById.get(id)?.name ?? "Deleted project", value }))
      .sort((a, b) => b.value - a.value)[0];

    return {
      units,
      out,
      awaitingCheckIn,
      free: Math.max(0, units - out - awaitingCheckIn),
      deployedValue,
      averagePerJob,
      completedJobs: completedValues.length,
      busiestProject: busiestProject ?? null,
      topEarners,
      neverStagedCount: neverStaged.length,
      neverStaged: [...neverStagedByCategory.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_LIST_SIZE)
        .map(([category, count]) => ({ label: category || "Uncategorised", value: count })),
      stagingsByCategory: [...stagingsByCategory.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_LIST_SIZE)
        .map(([category, count]) => ({ label: category || "Uncategorised", value: count })),
    };
  },
});
