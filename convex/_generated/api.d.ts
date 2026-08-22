/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as assignments from "../assignments.js";
import type * as authz from "../authz.js";
import type * as availability from "../availability.js";
import type * as contactSubmissions from "../contactSubmissions.js";
import type * as dashboard from "../dashboard.js";
import type * as homepageImages from "../homepageImages.js";
import type * as inventory from "../inventory.js";
import type * as inventoryInsights from "../inventoryInsights.js";
import type * as inventoryRules from "../inventoryRules.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  assignments: typeof assignments;
  authz: typeof authz;
  availability: typeof availability;
  contactSubmissions: typeof contactSubmissions;
  dashboard: typeof dashboard;
  homepageImages: typeof homepageImages;
  inventory: typeof inventory;
  inventoryInsights: typeof inventoryInsights;
  inventoryRules: typeof inventoryRules;
  projects: typeof projects;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
