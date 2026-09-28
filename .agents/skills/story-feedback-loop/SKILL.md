---
name: story-feedback-loop
description: Mandatory protocol for implementing, reviewing, documenting, and cleaning up user stories via wt (worktrunk) worktrees, dual-role (Implementor + SME Judge) feedback loops, progress comments, and bidirectional PR linking.
---

# Story Implementation & SME Judge Feedback Loop Skill

This skill defines the mandatory protocol for implementing user stories across this monorepo:

1. **Strict Isolation**: Implementation in dedicated Git worktrees via `wt` (worktrunk).
2. **Issue Status Tracking**: Real-time status transitions (`status:in-progress` ➔ `status:completed`).
3. **Periodic Progress Comments**: Mandatory audit comments posted on the GitHub issue.
4. **Dual-Role Feedback Loop**: Collaboration between an **Implementor** and an **SME Reviewing Judge**.
5. **Bidirectional PR-to-Issue Linking**: Standardized closing keywords (`Fixes #<IssueNumber>`).
6. **Worktree Teardown**: Clean process termination and temporary worktree removal via `wt remove`.

---

## Story Lifecycle

1. **Start**: `wt switch --create feature/<issue>-<slug> --base origin/staging`
2. **Develop**: Implement core logic & unit tests.
3. **Verify**: `pnpm run verify:local`
4. **Judge Review**: SME Judge validates intent.
5. **PR**: `gh pr create --base staging --body "Fixes #<issue>"`
6. **Teardown**: `wt switch staging && wt remove --reap`
