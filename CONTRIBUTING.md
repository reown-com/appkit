# Contributing to AppKit

First off, **thank you for taking the time to contribute!** These guidelines are here so that we can review and merge changes quickly and keep the project healthy.

---

## Before You Start

- **Large changes? Talk to us first.** If you are planning a significant feature or refactor, please [open an Issue](https://github.com/reown-com/appkit/issues) describing the proposal **before** you begin writing code. This helps everyone avoid duplicated effort and prevents disappointment if a large contribution is not aligned with the project roadmap.
- **Small bug fixes & improvements** can usually be submitted right away as pull requests.

## Types of Contributions

| Contribution Type | Issue Needed?            | Tests Required?                                |
| ----------------- | ------------------------ | ---------------------------------------------- |
| 🐛 Bug fix        | Recommended              | **Yes** (unit/integration)                     |
| ✨ New feature    | **Required**             | **Yes** (unit/integration + e2e if applicable) |
| 📝 Docs update    | Optional                 | N/A                                            |
| 🧹 Refactor       | Required for large scope | **Yes**                                        |
| 🧪 Test-only      | Optional                 | N/A                                            |

## Quality Standards

> **Only high‑quality, well‑tested contributions will be considered.**

- **Coding style** must follow the project's linting rules (run `pnpm prettier` / etc.) and make CI green.
- **Tests** should cover new code paths and strive for edge cases.
- **Performance**: avoid regressions. If your change impacts performance, include benchmarks.

## Submitting Changes

1. **Fork** the repository and create your branch: `git checkout -b feature/my-amazing-feature`.
2. **Write code & tests**. Ensure `pnpm test` (or equivalent) passes.
3. **Keep commits focused**. Squash or rebase interactively to group related changes.
4. **Open a pull request** against the `main` branch. Use the PR template to explain _what_ and _why_.
5. One or more maintainers will review. Be ready to iterate — friendly feedback helps us all learn.
6. When approved, your PR will be squashed and merged. 🎉

## License Agreement

By submitting a contribution, you agree that your code will be released under the project's license **and that the project maintainers reserve the right to change the license in the future**. If this is a concern, please raise it in the discussion phase _before_ contributing.

---

Thanks again for helping to make AppKit better!
