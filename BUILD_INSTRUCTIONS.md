# Build Instructions for Polkadot Network Exports

## Issue
The `polkadot` export is not available in `@reown/appkit/networks` because the package hasn't been rebuilt after adding the Polkadot network definitions.

## Solution

### Option 1: Build the specific package
```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm --filter @reown/appkit build
```

### Option 2: Build all packages (recommended for monorepo)
```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm build
```

### Option 3: Use turbo to build (fastest, uses cache)
```bash
cd /home/laughingwhales/development/sacred-appkit
turbo run build --filter=@reown/appkit
```

## What This Will Do

The build will:
1. Compile TypeScript sources in `packages/appkit/src/networks/polkadot/`
2. Generate ES modules in `packages/appkit/dist/esm/`
3. Export `polkadot`, `assetHub`, `kusama`, `westend` from `@reown/appkit/networks`
4. Update type definitions in `packages/appkit/dist/types/`

## Verification

After building, verify the exports are available:

```bash
# Check if polkadot network is exported
grep -r "polkadot" /home/laughingwhales/development/sacred-appkit/packages/appkit/dist/esm/src/networks/polkadot/

# Check if index properly re-exports
cat /home/laughingwhales/development/sacred-appkit/packages/appkit/dist/esm/exports/networks.js
```

## Expected Result

After build, `/home/laughingwhales/development/sacred-appkit/packages/appkit/dist/esm/exports/networks.js` should contain:

```javascript
export * from '../src/networks/index.js'
```

Which will include the polkadot exports from `../src/networks/polkadot/index.js`.

## Usage in tip-api

Once built, your import in `/home/laughingwhales/development/tip-api/config/appkit.ts` will work:

```typescript
import { solana, polkadot, assetHub } from '@reown/appkit/networks';
```

## Testing After Build

Run the Polkadot adapter tests to ensure everything works:

```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm --filter @reown/appkit-adapter-polkadot test
```

