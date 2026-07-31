---
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
---

Prevent concurrent SIWX signing actions.

Concurrent sign requests now share one in-flight operation, and the SIWX modal disables Sign and
Cancel while either action is pending.
