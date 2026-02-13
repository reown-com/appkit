# Testing Guide

## Unit Tests (Vitest)

Configuration: `vitest.workspace.ts` at repo root picks up `packages/*/vitest.config.ts` and `packages/adapters/*/vitest.config.ts`.

Default environment: `jsdom` for DOM-related packages, Node for pure utilities.

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests for a specific package
pnpm --filter @reown/appkit-controllers test

# Run with coverage
pnpm --filter @reown/appkit-controllers test -- --coverage

# Run a specific test file
pnpm --filter @reown/appkit-controllers test -- tests/controllers/RouterController.test.ts
```

### Test File Locations

| Package              | Test Location                                                 |
| -------------------- | ------------------------------------------------------------- |
| Controllers          | `packages/controllers/tests/`                                 |
| Scaffold UI partials | `packages/scaffold-ui/test/partials/[component-name].test.ts` |
| Adapters             | `packages/adapters/*/tests/`                                  |
| Utils                | `packages/appkit-utils/tests/`                                |
| Common               | `packages/common/tests/`                                      |
| Main SDK             | `packages/appkit/tests/`                                      |

### Controller Test Pattern

```typescript
import { beforeEach, describe, expect, it } from 'vitest'

import { MyController } from '../../src/controllers/MyController.js'

describe('MyController', () => {
  beforeEach(() => {
    // Reset state between tests
    MyController.state.someValue = ''
  })

  it('should update value', () => {
    MyController.setSomeValue('test')
    expect(MyController.state.someValue).toBe('test')
  })
})
```

### Scaffold UI Partial Test Pattern

Naming convention: `packages/scaffold-ui/test/partials/[component-name].test.ts`

---

## E2E Tests (Playwright)

Location: `apps/laboratory/tests/`

The Laboratory app is a Next.js application that serves as the primary E2E testing environment.

### Running E2E Tests

```bash
# Install Playwright browsers
pnpm --filter @apps/laboratory playwright:install

# Run all E2E tests
pnpm --filter @apps/laboratory playwright:test

# Run specific test suite
pnpm --filter @apps/laboratory playwright:test:basic
```

### Page Object Model

E2E tests use the Page Object Model pattern:

- `ModalPage` — Interacts with the AppKit modal
- `WalletPage` — Interacts with wallet simulation
- Corresponding validators for assertions

### Test File Naming

```
apps/laboratory/tests/
├── basic-tests.spec.ts
├── siwx-email.spec.ts
├── mobile-wallet-features.spec.ts
├── flag-enable-reconnect.spec.ts
└── ...
```

### CI/CD Test Execution

- Unit tests run on every PR
- E2E tests run via Playwright with sharded execution across multiple CI runners
- Bundle size checks run on every PR
- Canary tests run in Docker containers with timing metrics

---

## Writing Tests for New Code

### New Controller

Required. Place in `packages/controllers/tests/controllers/[ControllerName].test.ts`.

### New UI Component (wui-\*)

Required for DangerJS. Add Storybook story in `apps/gallery/stories/composites/[component-name].stories.ts`.

### New Scaffold Partial (w3m-\*)

Place in `packages/scaffold-ui/test/partials/[component-name].test.ts`.

### New Adapter

Place in `packages/adapters/[name]/tests/`.

### Bug Fixes and New Features

PR requirements mandate tests for bug fixes and new features.
