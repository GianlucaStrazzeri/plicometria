Notes for Prisma & project root

- Use ONLY the `package.json` and `package-lock.json` inside `plicometria-app` as the single project root for Node/Next.
- If you have `package.json` or `package-lock.json` in the parent `Plico` folder, remove them to avoid Next.js warnings about multiple lockfiles.
- Also remove `node_modules/` from the parent `Plico` folder if present; keep the `node_modules` inside `plicometria-app` only.

Prisma commands (run from `plicometria-app`):

```powershell
cd C:\Users\34698\Desktop\Plico\plicometria-app
npx prisma generate
npx prisma migrate dev --name init_schema
```

Expected outcome:
- `npx prisma generate` will produce the client in `plicometria-app/node_modules/@prisma/client`.
- `npx prisma migrate dev` will create migrations in `plicometria-app/prisma/migrations` and apply them to the local SQLite DB at `dev.db`.

After this, running `npm run dev` inside `plicometria-app` should not show errors about `@prisma/client` or Prisma P1012 (datasource url).