# Drizzle Migration Workflow

## The Golden Rule

Every time you change the schema, run `db:generate` first — then migrate based on your environment.

```
Edit schema (src/db/schema/index.ts)
        ↓
npm run db:generate     ← always, in dev
        ↓
git commit              ← commit the generated migration file too
        ↓
Dev:  npm run db:migrate
Prod: npm run start     ← runs migrate automatically before starting the server
```

---

## Commands

| Command | What it does | When to use |
|---|---|---|
| `npm run db:generate` | Generates a new SQL migration file in `./drizzle/` | After every schema change, in dev |
| `npm run db:migrate` | Applies pending migrations to the DB | Dev only |
| `npm run start` | Runs migrate then starts the server | Production (migrate is automatic) |
| `npm run db:push` | Pushes schema directly to DB without a migration file | Quick local testing only — never in production |
| `npm run db:studio` | Opens Drizzle Studio (visual DB browser) | Dev only |

---

## Key Points

- **`db:generate` is always a dev step** — run it locally, commit the output.
- **Never use `db:push` in production** — it skips migration files and can cause data loss.
- **Migration files must be committed** — production relies on the files in `./drizzle/` to know what to apply.
- In production, `npm run start` calls `node dist/db/migrate.js` before `node dist/server.js`, so migrations run automatically on every deploy.
