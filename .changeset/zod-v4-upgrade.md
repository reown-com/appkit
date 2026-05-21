---
'@reown/appkit-wallet': patch
'@reown/appkit-experimental': patch
---

Upgrade `zod` from `3.22.4` to `4.4.3`.

- `@reown/appkit-wallet`: refactored `W3mFrameSchema` to use `z.discriminatedUnion('type', [...])` and `z.intersection(...)` (replacing long `.or().or()...and()` chains) to keep TypeScript inference within bounds with Zod 4's stricter generics. Updated `z.string().email()` to the top-level `z.email()` per Zod 4 API.
- `@reown/appkit-experimental`: migrated the smart-session schema to Zod 4 APIs:
  - `errorMap` / `invalid_type_error` → unified `error` parameter
  - `z.nativeEnum(X)` → `z.enum(X)` (now accepts native enums directly)
  - `z.record(V)` → `z.record(K, V)` (single-arg signature removed)
  - `ZodError.errors` → `ZodError.issues`
  - Default Zod error messages now use the `Invalid input: expected X, received Y` format; updated tests and `ERROR_MESSAGES` constants accordingly.

No public API changes. Consumers that already pin a specific `zod` version in their own apps may see deduplication via overrides; the wallet's runtime postMessage validation behavior is preserved.
