# Light Review Existing Diffs

## Overview

Perform a quick quality pass on current diffs to surface risky areas, ensure
polish, and flag follow-up actions for deeper review.

## Steps

1. **Scan recent changes**
    - List open branches or pending commits requiring review
    - Skim side-by-side diffs focusing on new or modified files
    - Note files or modules with large or complex edits
2. **Assess quality signals**
    - Watch for TODOs, debug code, or commented blocks needing cleanup
    - Verify naming, formatting, and imports follow project standards
    - Check that tests or documentation were updated when behavior changed
3. **Flag next actions**
    - Mark sections that warrant full review or pair programming
    - Capture questions or uncertainties to raise with the author
    - Document any quick fixes you can apply immediately

## Review Checklist

- [ ] High-risk files identified
- [ ] Debugging artifacts removed or flagged
- [ ] Style and conventions validated
- [ ] Tests/docs updates confirmed or requested
- [ ] Follow-up items recorded for deeper review
