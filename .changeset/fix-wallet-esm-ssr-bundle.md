---
"@reown/appkit-wallet": patch
---

Bundle @walletconnect/logger into the wallet package dist to fix SSR environments (SvelteKit, Next.js on Vercel) where Vite externalizes the dependency and Node.js resolves it as CJS, causing a "Named export not found" error at runtime.
