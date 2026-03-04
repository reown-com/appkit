# UI Components Guide

The UI is split into two packages: atomic components (`wui-*`) and high-level flows (`w3m-*`).

## Atomic Components (`@reown/appkit-ui`)

Location: `packages/ui/src/components/` and `packages/ui/src/composites/`

### Component Structure

Every component lives in its own directory:

```
packages/ui/src/components/wui-button/
├── index.ts    # Component class
└── styles.ts   # CSS-in-JS styles
```

### Required Pattern

```typescript
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-my-component')
export class WuiMyComponent extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties ----
  @property() public variant: 'primary' | 'secondary' = 'primary'

  // -- Render ----
  public override render() {
    return html`<slot></slot>`
  }

  // -- Private ----
  private handleClick() {
    /* ... */
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-my-component': WuiMyComponent
  }
}
```

### DangerJS Enforced Rules for `wui-*` Components

1. **Must** apply `resetStyles` in the static styles array
2. **Must** use `@customElement('wui-')` prefix
3. **Must NOT** use `@state()` decorator (use `@property()` instead)
4. **Must NOT** import from `@reown/appkit-controllers`
5. **Must** include section comments:
   - `// -- Render ----` (if has render method)
   - `// -- State & Properties ----` (if has @property)
   - `// -- Private ----` (if has private methods)
6. **Must** have corresponding Storybook story in `apps/gallery/`

### Component Categories

**Atomic** (`packages/ui/src/components/`): wui-text, wui-card, wui-icon, wui-button, wui-input, wui-loading-spinner, wui-shimmer, wui-divider, wui-tag, wui-flex, wui-image, wui-visual, etc.

**Composites** (`packages/ui/src/composites/`): wui-account-button, wui-transaction-item, wui-network-list, wui-token-list, wui-list-item, wui-wallet-image, etc. (78+ components)

### Styling

- Use CSS custom properties from theme variables
- `resetStyles` normalizes base element styles
- Component styles use `css` tagged template from lit
- Theme variables prefixed with `--wui-` or `--apkt-`

---

## Scaffold UI (`@reown/appkit-scaffold-ui`)

Location: `packages/scaffold-ui/src/`

High-level UI that composes `wui-*` atoms and subscribes to controllers.

### Structure

```
packages/scaffold-ui/src/
├── modal/
│   ├── w3m-modal/          # Main modal wrapper
│   └── w3m-router/         # View router
├── views/                  # 57 view components
│   ├── w3m-account-view/
│   ├── w3m-connect-view/
│   ├── w3m-networks-view/
│   ├── w3m-swap-view/
│   └── ...
└── partials/               # 50 reusable sections
    ├── w3m-header/
    ├── w3m-connector-list/
    ├── w3m-snackbar/
    └── ...
```

### Required Pattern for `w3m-*` Components

```typescript
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ChainController, RouterController } from '../../imports.js'

// Relative!

@customElement('w3m-my-view')
export class W3mMyView extends LitElement {
  // -- Members ----
  private unsubscribe: (() => void)[] = []

  // -- State & Properties ----
  @state() private someState = SomeController.state.value

  // -- Lifecycle ----
  constructor() {
    super()
    this.unsubscribe.push(
      SomeController.subscribeKey('value', val => {
        this.someState = val
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsub => unsub())
  }

  // -- Render ----
  public override render() {
    return html`<wui-text>Hello</wui-text>`
  }
}
```

### DangerJS Enforced Rules for `w3m-*` Components

1. **Must** use `w3m-` prefix
2. **Must** have proper unsubscribe cleanup in `disconnectedCallback()`
3. **Must** use relative imports (not `@reown/appkit-*` package paths)

### Adding a New View

1. Create `packages/scaffold-ui/src/views/w3m-my-view/index.ts` + `styles.ts`
2. Export from scaffold package barrel
3. Add discriminant to `RouterControllerState['view']` in `packages/controllers/src/controllers/RouterController.ts`
4. Map in router switch: `packages/scaffold-ui/src/modal/w3m-router/index.ts`
5. Navigate with `RouterController.push('MyView')`

### Router View Navigation

The router maintains a history stack. Views are rendered by a switch statement in `w3m-router`:

```typescript
case 'Account': return html`<w3m-account-view></w3m-account-view>`
case 'Connect': return html`<w3m-connect-view></w3m-connect-view>`
case 'Networks': return html`<w3m-networks-view></w3m-networks-view>`
// ... 80+ views
```

### Test Location

Tests for scaffold-ui partials: `packages/scaffold-ui/test/partials/[component-name].test.ts`
