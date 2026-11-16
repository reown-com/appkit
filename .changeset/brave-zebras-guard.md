---
'@reown/appkit-wallet': patch
'@reown/appkit-experimental': patch
---

Upgraded `zod` from 3.22.4 to 4.6.7 to address GHSA-mrhx-c7xc-m3w5 (CVE-2023-54404), a memory exhaustion issue when validating large arrays. `validateRequest` error messages in `@reown/appkit-experimental` now use Zod 4 wording, e.g. `Invalid expiry: Invalid input: expected number, received string`.
