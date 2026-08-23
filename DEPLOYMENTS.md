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
