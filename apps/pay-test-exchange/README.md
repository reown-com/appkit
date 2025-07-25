# AppKit Pay Test Exchange

A testing environment for simulating payment exchange interactions with **Reown AppKit Pay**. This application provides a controlled environment to test payment flows, session management, and various payment scenarios during development.

## 🎯 Purpose

The Pay Test Exchange simulates a merchant/exchange interface that receives payment requests from AppKit Pay and allows developers to:

- Test payment session flows (pending → success/error states)
- Validate payment parameters (asset, amount, recipient)
- Simulate both successful and failed payment scenarios
- Debug payment integration issues in a controlled environment

## ✨ Features

### 🔄 Session Management

- **Automatic session creation** with pending status
- **Status transitions**: pending → success or error
- **Session validation** via URL parameters

### 💳 Payment Information Display

- **Asset parsing**: Displays chain ID and token standard
- **Amount visualization**: Shows payment amounts clearly
- **Recipient validation**: Displays destination addresses

### 🧪 Testing Controls

- **Success simulation**: Mark payments as successful
- **Error simulation**: Trigger payment failures
- **Real-time updates**: Immediate session status changes
- **Navigation handling**: Automatic redirects to result pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Access to the Reown AppKit ecosystem

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

### Development

2. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. **Open the application**:
   Visit [http://localhost:4001](http://localhost:4001) in your browser

### Usage

#### Basic Payment Test

1. **Navigate with session parameters**:

   ```
   http://localhost:4001?sessionId=your-session-id&asset=eip155:1/erc20:0x123&amount=100&recipient=0xabc123
   ```

2. **Required parameters**:

   - `sessionId`: Unique identifier for the payment session

3. **Optional parameters**:
   - `asset`: Asset identifier (format: `namespace:chainId/standard:address`)
   - `amount`: Payment amount (in token units)
   - `recipient`: Destination wallet address

#### Testing Payment Flows

1. **Success Scenario**:

   - Click "Complete Successfully" button
   - Session status updates to `success`
   - Redirected to success page

2. **Error Scenario**:
   - Click "Trigger Error" button
   - Session status updates to `error`
   - Redirected to error page

## 🏗️ Architecture

### Project Structure

```
apps/pay-test-exchange/
├── app/
│   ├── api/          # API routes for session management
│   ├── error/        # Error result page
│   ├── success/      # Success result page
│   └── page.tsx      # Main exchange interface
├── components/
│   ├── ui/           # Reusable UI components
│   ├── exchange-actions.tsx    # Main control interface
│   ├── payment-info.tsx       # Payment details display
│   └── error-screen.tsx       # Error state component
├── lib/
│   ├── session-actions.ts     # Session management logic
│   └── types.ts               # TypeScript definitions
└── public/
    └── reown-logo.png         # Branding assets
```

### API Endpoints

- **POST** `/api/update` - Update session status
- **GET** `/api/status` - Get session status

## 🔧 Configuration

### Environment Setup

The application supports multiple deployment environments:

- **Development**: `npm run dev` (port 4001)
- **Production**: `npm run build && npm run start`
- **Cloudflare**: `npm run deploy`

### Amount Validation

Test various amount formats:

```
- 1000000000000000000    # 1 ETH (18 decimals)
- 1000000                # 1 USDC (6 decimals)
- 500000000              # 0.5 SOL (9 decimals)
```

### Error Conditions

Test error scenarios:

```
- Missing sessionId      # Triggers error screen
- Invalid parameters     # Tests parameter validation
- Network failures       # Simulates API issues
```

## 🚀 Deployment

### Cloudflare Deployment

1. **Build for Cloudflare**:

   ```bash
   npm run deploy
   ```

2. **Preview deployment**:

   ```bash
   npm run preview
   ```

3. **Generate Cloudflare types**:
   ```bash
   npm run cf-typegen
   ```

## 🤝 Integration with AppKit Pay

This test exchange works in conjunction with:

- **AppKit Pay SDK**: For payment initiation
- **Payment Controllers**: For transaction handling
- **Wallet Adapters**: For multi-chain support
- **Session Management**: For state synchronization

## 📋 API Reference

### Session Status Updates

```typescript
// Update session status
POST /api/update?sessionId={id}
{
  "status": "success" | "error" | "pending"
}

// Get session status
GET /api/status?sessionId={id}
```

### Payment Parameters

```typescript
interface PaymentParams {
  sessionId: string // Required: Unique session identifier
  asset?: string // Optional: Asset identifier
  amount?: string // Optional: Payment amount
  recipient?: string // Optional: Destination address
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Missing sessionId**: Ensure URL includes valid `sessionId` parameter
2. **Session not found**: Check session creation in network tab
3. **Payment display issues**: Verify asset format and parameters
4. **Navigation errors**: Check success/error page routing

### Debug Mode

Enable detailed logging by checking browser console and network requests.

## 📄 License

This project is part of the Reown AppKit ecosystem. See the main repository for license details.

## 🆘 Support

For issues and questions:

- Check the main AppKit repository
- Review integration documentation
- Test with different parameter combinations
- Verify session management flow
