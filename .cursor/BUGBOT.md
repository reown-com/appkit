# Network Requests

- No startup I/O: The SDK must not issue network requests during module import, SDK init, or initial page load. Defer all calls until a clear user action (e.g., opening the connect modal or pressing “Connect”).
- Single intent-bound fetch: On first user action, perform one consolidated request for data required to render the current screen. Prefer batching and cache results for the session to prevent duplicate calls.
- No redundant/parallel calls: Disallow duplicate requests for the same resource within a short window or without cache-busting intent. Initialization must be idempotent.
- Scope & size discipline: Only fetch what is needed for the current UI state. Use pagination/filters; avoid fetching full lists “just in case.” No background polling unless explicitly documented and justified.
- Graceful UI: If data influences first paint, render skeleton/placeholders while the single deferred request resolves.
