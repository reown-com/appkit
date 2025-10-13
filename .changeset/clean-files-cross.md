---
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-ui': patch
'@reown/appkit': patch
---

Improve QR code rendering performance and responsiveness:
- Remove 200ms timeout delay from QR code display for faster connection handshake
- Remove fixed sizing calculations and resize listener for better performance
- Use percentage-based SVG sizing (width="100%" height="100%") with viewBox for responsive scaling
- Set QR code generation to use fixed 500px matrix size for consistent quality
