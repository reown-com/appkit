---
'@reown/appkit': patch
---

Fixed `allAccounts` being empty on page reload when using vanilla JS `subscribeAccount`. The callback was not subscribed to `ConnectionController` state changes, so it never fired when connections were populated after reconnection.
