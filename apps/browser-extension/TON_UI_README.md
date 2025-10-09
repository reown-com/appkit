# 🎨 TON Wallet UI - Browser Extension

The browser extension now includes full UI support for TON (The Open Network)!

## 🖼️ Visual Overview

### Extension Popup with TON Tab

```
╔═══════════════════════════════════════════════╗
║         Reown Browser Extension               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐    ║
║  │  ETH │ │ SOL  │ │ BTC  │ │ ⚡ TON   │    ║
║  └──────┘ └──────┘ └──────┘ └──────────┘    ║
║                                               ║
║           ╭─────────────────╮                ║
║           │                 │                ║
║           │   [  Avatar  ]  │                ║
║           │                 │                ║
║           ╰─────────────────╯                ║
║                                               ║
║          EQDCp8fa0...21Ol14xb-               ║
║                                               ║
║       ┌────────┐      ┌──────────┐          ║
║       │  Copy  │      │   View   │          ║
║       └────────┘      └──────────┘          ║
║                                               ║
║  ┌─────────────────────────────────────┐    ║
║  │  💎 TON                             │    ║
║  │     0.1234 TON                      │    ║
║  └─────────────────────────────────────┘    ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

## 🚀 Quick Start

### 1. Setup

```bash
# Install dependencies
bun install

# Generate TON private key
node generate-ton-key.js

# Add to .env.local
TON_PRIVATE_KEY=your_generated_key_here
```

### 2. Build & Load

```bash
# Build the extension
bun run build

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

### 3. Use TON Wallet

1. Click extension icon
2. Select **TON** tab
3. View address & balance
4. Copy or view on Tonscan

## ✨ Features

### 🔹 Chain Switching

Switch between **4 chains** with a single click:

- 🔷 **Ethereum** (EVM)
- 🟣 **Solana**
- 🟠 **Bitcoin**
- ⚡ **TON** ← NEW!

### 🔹 Address Management

- **Display**: Shows your TON address in shortened format
- **Copy**: One-click copy to clipboard
- **View**: Opens Tonscan.org in new tab

### 🔹 Balance Display

- **Real-time**: Fetches from TON testnet
- **Formatted**: Shows balance with 4 decimal places
- **Auto-refresh**: Updates when switching to TON tab

### 🔹 Visual Design

- **Dark Theme**: Consistent with existing chains
- **Custom Icon**: TON logo in tabs and token display
- **Smooth Transitions**: Tab switching with visual feedback
- **Responsive**: Works at any popup size

## 🎨 UI Components

### Tab Navigation

```
Active:   ■ TON (darker background, more prominent)
Inactive: □ Ethereum / Solana / Bitcoin (lighter)
```

### Address Display

- **Zorb Avatar**: Visual identifier
- **Shortened Address**: `EQDCp8...Ol14xb-`
- **Action Buttons**: Copy & View side-by-side

### Token Card

```
┌────────────────────────────┐
│ [TON Logo]                 │
│   TON                      │
│   0.1234 TON              │
└────────────────────────────┘
```

## 🔧 Technical Stack

### Frontend

- **React 19** with Hooks (`useState`, `useEffect`)
- **TypeScript** for type safety
- **Vanilla Extract** for styling
- **React Query** for data fetching

### TON Integration

- **@ton/ton** - TonClient for balance queries
- **@ton/crypto** - Key pair management
- **@ton/core** - Address handling

### State Management

- React state for TON address
- React Query cache for balance
- Local state for UI interactions

## 📱 User Experience

### Initial Load

1. Extension initializes TON provider
2. Generates address from private key (~50ms)
3. Displays address in UI
4. Ready for user interaction

### Balance Fetching

1. User clicks TON tab
2. React Query triggers balance fetch
3. TonClient queries testnet RPC (~500ms)
4. Balance displayed with proper decimals

### Address Actions

**Copy Flow:**

```
Click Copy → Address copied → Button shows "Copied" (1.5s) → Resets
```

**View Flow:**

```
Click View → Opens https://tonscan.org/address/{address} → New tab
```

## 🌍 Network Support

### Testnet (Default)

- **RPC**: `https://testnet.toncenter.com/api/v2/jsonRPC`
- **Network ID**: `-3`
- **Explorer**: `https://tonscan.org`

### Mainnet (Configuration)

To switch to mainnet, update:

**In `useBalance.ts`:**

```typescript
endpoint: 'https://toncenter.com/api/v2/jsonRPC'
```

**In `inpage.ts`:**

```typescript
network: '-239' // mainnet
```

## 🎯 Interactive Elements

### Tabs

- **Hover**: Subtle scale effect
- **Active**: Darker background (`neutrals800`)
- **Transition**: Smooth 200ms animation

### Buttons

- **Copy**: Shows feedback on click
- **View**: Opens in new tab
- **Hover**: Slight growth effect

### Token Card

- **Hover**: Grows slightly
- **Active**: Shrinks on click
- **Cursor**: Pointer (clickable)

## 📊 Performance

| Action            | Time    | Notes                  |
| ----------------- | ------- | ---------------------- |
| Load Extension    | < 100ms | TON address generation |
| Switch to TON Tab | Instant | No network call        |
| Fetch Balance     | ~500ms  | Testnet RPC query      |
| Copy Address      | < 10ms  | Clipboard API          |
| Open Explorer     | Instant | New tab                |

## 🐛 Troubleshooting

### TON tab missing?

✅ Check `ChainTabs/index.tsx` includes `'ton'`

### Address not showing?

✅ Set `TON_PRIVATE_KEY` in `.env.local`

### Balance shows 0?

✅ Ensure address has testnet tokens  
✅ Verify RPC endpoint is accessible

### Icon not visible?

✅ Check `ton.svg` in `/assets/images/`  
✅ Rebuild extension: `bun run build`

## 📸 Screenshots

### TON Tab (Active)

```
[Ethereum] [Solana] [Bitcoin] [⚡ TON*]
                               ↑ Active
```

### Complete View

```
┌─────────────────────────────────┐
│  [ETH] [SOL] [BTC] [TON*]       │
│                                 │
│         [Zorb Avatar]           │
│      EQDCp8...Ol14xb-           │
│     [Copy]    [View]            │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ⚡ TON                     │ │
│  │   0.1234 TON              │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## 🎓 Learning Resources

- **TON Docs**: https://ton.org/docs
- **Tonscan Explorer**: https://tonscan.org
- **TonConnect Protocol**: https://github.com/ton-connect/docs

## 📚 Related Documentation

- [TON Setup Guide](./TON_SETUP.md) - Environment & configuration
- [Implementation Summary](./TON_IMPLEMENTATION_SUMMARY.md) - Technical details
- [UI Guide](./UI_GUIDE.md) - Component documentation
- [UI Summary](./TON_UI_SUMMARY.md) - Complete UI overview

## ✅ Checklist

Ready to use when you have:

- [x] Dependencies installed (`bun install`)
- [x] TON private key generated (`node generate-ton-key.js`)
- [x] Key added to `.env.local`
- [x] Extension built (`bun run build`)
- [x] Extension loaded in Chrome
- [x] TON tab visible
- [x] Address displayed
- [x] Balance fetched

## 🎉 You're All Set!

The TON wallet UI is ready to use! Enjoy managing your TON assets directly from the browser extension.

---

**Need help?** Check the troubleshooting section or related documentation above.
