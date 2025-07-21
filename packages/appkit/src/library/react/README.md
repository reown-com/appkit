# AppKit React Components

This package provides React wrapper components for AppKit's web components using Lit's React integration.

## Usage

```typescript
import React from 'react'
import { 
  AppKitButton, 
  AppKitNetworkButton, 
  AppKitConnectButton, 
  AppKitAccountButton 
} from '@reown/appkit/react'

function MyApp() {
  return (
    <div>
      {/* Main AppKit button - shows connect or account based on state */}
      <AppKitButton />
      
      {/* Network selection button */}
      <AppKitNetworkButton />
      
      {/* Connect wallet button */}
      <AppKitConnectButton size="md" label="Connect Wallet" />
      
      {/* Account button for connected users */}
      <AppKitAccountButton balance="show" charsStart={4} charsEnd={6} />
    </div>
  )
}
```

## Component Props

### AppKitButton
- `disabled?: boolean` - Disable the button
- `balance?: 'show' | 'hide'` - Show/hide balance in account mode
- `size?: 'sm' | 'md' | 'lg'` - Button size in connect mode
- `label?: string` - Custom label for connect mode
- `loadingLabel?: string` - Loading state label
- `charsStart?: number` - Characters to show at start of address
- `charsEnd?: number` - Characters to show at end of address
- `namespace?: ChainNamespace` - Specific chain namespace

### AppKitNetworkButton
- `disabled?: boolean` - Disable the button
- `label?: string` - Custom label

### AppKitConnectButton
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `label?: string` - Button label (default: "Connect Wallet")
- `loadingLabel?: string` - Loading state label (default: "Connecting...")
- `namespace?: ChainNamespace` - Specific chain namespace

### AppKitAccountButton
- `disabled?: boolean` - Disable the button
- `balance?: 'show' | 'hide'` - Show/hide balance
- `charsStart?: number` - Characters to show at start of address (default: 4)
- `charsEnd?: number` - Characters to show at end of address (default: 6)
- `namespace?: ChainNamespace` - Specific chain namespace

## Benefits

- **Type Safety**: Full TypeScript support with proper prop types
- **React Integration**: Native React component experience
- **No Maintenance**: Built using Lit's React wrapper, no manual maintenance required
- **Event Handling**: Proper React event handling (onClick, onFocus, onBlur)
- **Developer Experience**: Better IntelliSense and debugging compared to raw web components

## Migration

### Before (Web Components)
```html
<appkit-button></appkit-button>
<appkit-network-button></appkit-network-button>
```

### After (React Components)
```tsx
<AppKitButton />
<AppKitNetworkButton />
```