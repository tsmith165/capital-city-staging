# Deployments and data

## Which Convex deployment serves what

| Vercel environment  | Convex deployment            | Data                        |
| ------------------- | ---------------------------- | --------------------------- |
| Production          | `prod:valuable-mosquito-910` | Live customer data          |
| Preview             | `dev:proficient-cod-5`       | Scratch data, safe to break |
| Development (local) | `dev:proficient-cod-5`       | Scratch data, safe to break |

Production ran on the **dev** deployment until 2026-08-23. The live data was migrated into
`valuable-mosquito-910` (641 documents, verified table-by-table against the source snapshot by both
row count and document `_id`, with zero dangling `projectInventory` / `projectImages` references),
and the Vercel Production env vars were repointed. The dev deployment still holds a copy of
everything as of the migration; nothing was deleted from it.

`NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` must be stored **non-sensitive** in Vercel. Vercel
defaults new Production and Preview variables to sensitive (write-only), and a sensitive variable
reads back as an empty string through `vercel env pull`, which makes it impossible to verify what
production is actually pointing at. Neither value is a secret — the URL ships in the client bundle.

    vercel env add NEXT_PUBLIC_CONVEX_URL production --no-sensitive --value "https://..."

## Convex deploys are separate from Vercel

Vercel's build command is `next build`. It does not deploy Convex. Any change under `convex/` needs
an explicit deploy, or production runs the old functions against the new frontend:

    VERCEL= VERCEL_ENV= npx convex dev --once   # dev deployment
    VERCEL= VERCEL_ENV= npx convex deploy       # production deployment

`npx convex dev --once` does not reliably typecheck. Always follow it with `npx tsc --noEmit`.

The `VERCEL=` / `VERCEL_ENV=` prefix is required because an earlier `vercel env pull` wrote
`VERCEL=1` into `.env.local`, which makes the Convex CLI believe it is inside a Vercel build.

## Backups

Convex is the only store for projects, inventory, assignments, and contact submissions. Vercel keeps
no copy.

    pnpm backup        # snapshot production to _backups/
    pnpm backup:dev    # snapshot the dev deployment

Snapshots keep the 14 most recent files per deployment. `_backups/` is gitignored because the
`users` and `contactSubmissions` tables contain names and email addresses — keep it that way.

Restore a snapshot over production:

    VERCEL= VERCEL_ENV= npx convex import --prod --replace-all _backups/<file>.zip

`--replace-all` wipes tables that are absent from the archive, so take a fresh snapshot first.
Snapshot imports preserve `_id` values, which is what keeps `projectInventory.projectId` and
`projectImages.projectId` pointing at the right rows.

Run `pnpm backup` before any schema migration, bulk edit, or import. Convex also offers scheduled
backups from the dashboard (Settings → Backups) — worth enabling so safety does not depend on
someone remembering to run the script.

## Verifying a migration

Compare the source and destination snapshots rather than trusting the import summary. For each
table, both the row count and the set of `_id` values should match, and no `projectInventory` or
`projectImages` row should reference a `projectId` that is absent from `projects`.

## Authentication

Production runs against a Clerk **development** instance (`immense-stinkbug-94.clerk.accounts.dev`,
publishable key `pk_test_*`). This is a deliberate deferral, not an oversight. Moving to a Clerk
production instance requires provisioning a production domain and SSO credentials, and the reasons
to hurry do not currently apply.

Admin access does not depend on which instance is in use. Two independent gates gate it, and both
fail closed:

1. `src/proxy.ts` requires Clerk membership in an organisation named `ADMIN` with the `org:admin`
   role. Anyone else is redirected to `/not-authorized`.
2. Convex `isAdmin` / `requireAdmin` in `convex/authz.ts` require `users.role === "admin"`. New
   users are created as `"customer"` (`convex/users.ts`).

A stranger who signs up gets neither, so test keys do not expose the console.

### What the development instance does cost

| Limit       | Development                                     | Production          |
| ----------- | ----------------------------------------------- | ------------------- |
| Users       | 100, and **not transferable between instances** | No cap              |
| Backend API | 100 requests / 10s                              | 1000 requests / 10s |
| Emails      | 100 / month                                     | Standard            |

The usual reason to migrate early is the non-transferable user cap: accounts created on a
development instance cannot be moved, so the longer it runs the more there is to lose. That does not
apply here. There are three users, all admins, and no customer-facing account feature — `/profile`
is a stub and `getUserProjects` in `convex/projects.ts` has no UI consumer. The debt is not growing.

### Open sign-up

`/signup` is publicly reachable and linked from the sign-in component via `signUpUrl="/signup"`,
even though accounts do nothing for customers; leads arrive through the contact form. This is
accepted for now.

The risk is not privilege escalation, which the two gates above cover. It is the development
instance's quotas: junk sign-ups consume the 100-user cap and the 100-emails-per-month allowance,
and an exhausted email quota could stop Mia's own sign-in emails from sending. Unlikely, and
annoying to diagnose if it happens.

To close it without a deploy, set sign-up mode to restricted in the Clerk dashboard under
Restrictions. To close it in code, remove `src/app/signup/` and drop `signUpUrl` from the `<SignIn />`
element in `src/app/signin/[[...sign-in]]/page.tsx`.

### `isClerkUserIdAdmin` calls the Clerk API on every admin request

`src/utils/auth/ClerkUtils.ts` resolves admin status by fetching the user's organisation memberships
from the Clerk Backend API, and `src/proxy.ts` calls it for every request whose path starts with
`/admin`. Every admin page load and client-side navigation therefore costs a round trip to Clerk
before anything renders.

This is knowingly accepted at the current scale. One operator is nowhere near the development
instance's 100 requests per 10 seconds, so it is a latency cost rather than a correctness problem.
It is, however, the first thing that would hit a wall under real load, and it is the reason admin
navigation feels slower than the rest of the site.

The fix, when it is worth doing, is to stop asking Clerk on every request: put the admin claim in
the session token via a Clerk JWT template or session claim and read it from `auth()`, which keeps
the check local to the edge.
