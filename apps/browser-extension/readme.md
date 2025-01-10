## Install project dependencies

```bash
pnpm install
```

Copy `.env.local.example` into your own `.env.local` file in the root folder:

```bash
cp .env.local
```

Make sure you have these variables:

```bash
EIP155_PRIVATE_KEY=
SOLANA_PRIVATE_KEY=
```

## Importing the extension

### 1. Build the extension

```bash
pnpm build
```

### 2. Enable Developer Mode in Chrome

Go to `chrome://extensions/` and enable `Developer mode`.

### 3. Import the extension

Click on `Load unpacked` and select the `dist` folder.

## Development

### 1. Start the development build

```bash
pnpm dev
```

### 2. Make changes to the code

Any changes to your code will trigger an update to the extension.
