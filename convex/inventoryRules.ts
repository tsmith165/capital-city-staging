import type { Doc } from "./_generated/dataModel";
import type { ItemAvailability } from "./availability";

/**
 * What counts as a catalog problem, and how loudly.
 *
 * The old rule set flagged 386 of 413 active items, which made the nav badge meaningless — a count
 * that high reads as "ignore me". Two things caused it. Missing real dimensions fired on 89% of the
 * catalog, because nobody measures a throw pillow and nobody needs to; and a missing optimized
 * thumbnail was reported to a human even though regenerating one is a batch job.
 *
 * So dimensions are only asked for on the things that have to physically fit through a door and into
 * a room, thumbnails dropped out entirely, and the remaining reasons are split by whether they cost
 * money right now. Only the `fix-now` tier reaches the badge.
 */

const PLACEHOLDER_IMAGE_VALUES = ["", "Not yet uploaded"];

/**
 * Categories where "will it fit" is a real question. Everything else — decor, pillows, books, art,
 * plants, kitchen and bathroom props — gets staged by eye, and recording its depth is data theater.
 */
export const DIMENSION_REQUIRED_CATEGORIES: readonly string[] = [
  "Barstool",
  "Bench",
  "Bedroom",
  "Bookcase",
  "Chair",
  "Couch",
  "Desk",
  "Rug",
  "Table",
];

export type AttentionTier = "fix-now" | "later";

export interface AttentionReason {
  code: "missing-photo" | "unpriced-and-assigned" | "over-assigned" | "unpriced" | "missing-dimensions";
  label: string;
  tier: AttentionTier;
  /** Short explanation of the consequence, so the queue is not a list of bare nouns. */
  detail: string;
}

function hasImage(path: string | undefined): boolean {
  return typeof path === "string" && !PLACEHOLDER_IMAGE_VALUES.includes(path.trim());
}

export function needsDimensions(category: string): boolean {
  return DIMENSION_REQUIRED_CATEGORIES.includes(category);
}

/**
 * Reasons one item needs attention.
 *
 * Availability comes from the join table, which is what makes the money-shaped rules possible: an
 * unpriced item sitting in a client's house is understating that job's rental value today, while an
 * unpriced item in storage is just paperwork.
 */
export function attentionReasons(item: Doc<"inventory">, availability: ItemAvailability | undefined): AttentionReason[] {
  const reasons: AttentionReason[] = [];
  const committed = (availability?.out ?? 0) + (availability?.awaitingCheckIn ?? 0);

  if (!hasImage(item.imagePath)) {
    reasons.push({
      code: "missing-photo",
      label: "No photo",
      tier: "fix-now",
      detail: "You cannot recognise it in the picker and it cannot go on the public site.",
    });
  }

  if (!item.price && committed > 0) {
    reasons.push({
      code: "unpriced-and-assigned",
      label: "Unpriced but staged",
      tier: "fix-now",
      detail: "It is out on a job at $0, so that project's rental total is too low.",
    });
  } else if (!item.price) {
    reasons.push({
      code: "unpriced",
      label: "No price",
      tier: "later",
      detail: "Set one before it goes on a job or the job's rental total will be short.",
    });
  }

  if (committed > item.count) {
    reasons.push({
      code: "over-assigned",
      label: "Assigned more than you own",
      tier: "fix-now",
      detail: `${committed} units are assigned out but only ${item.count} are on the books.`,
    });
  }

  if (needsDimensions(item.category) && !(item.realWidth && item.realHeight && item.realDepth)) {
    reasons.push({
      code: "missing-dimensions",
      label: "No measurements",
      tier: "later",
      detail: "Furniture this size needs dimensions to know whether it fits the room.",
    });
  }

  return reasons;
}

export function highestTier(reasons: AttentionReason[]): AttentionTier | null {
  if (reasons.some((reason) => reason.tier === "fix-now")) return "fix-now";
  return reasons.length > 0 ? "later" : null;
}
