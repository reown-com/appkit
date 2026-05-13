---
'@reown/appkit': patch
---

Fix `useAppKitAccount().allAccounts` being empty after page reload when a reconnected connection's `caipNetwork` had not yet resolved. Falls back to the active network for the namespace so accounts always surface.
