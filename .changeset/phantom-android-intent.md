---
'@reown/appkit-controllers': patch
---

fix: use Android intent URL for Phantom deeplinks on Android devices

Universal Links don't work reliably on many Android browsers (Opera, UC Browser, Samsung Internet, in-app browsers like Facebook, Instagram). This change uses Android intent URLs on Android devices which bypass browser app link verification and work on all Android browsers.

- iOS continues to use Universal Links (well supported by Safari)
- Android now uses intent URLs that trigger OS-level intent resolution
