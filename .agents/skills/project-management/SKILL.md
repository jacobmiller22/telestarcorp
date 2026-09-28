---
name: project-management
description: Guidance for AI agents acting as Technical Project Managers (TPM) to manage GitHub Project v2 boards, milestones, labels, issues, and status automation.
---

# Technical Project Management Skill

This skill informs AI agents how to manage project delivery, update GitHub Project v2 boards, track story dependencies, and execute TPM responsibilities for this monorepo.

---

## 1. Issue Lifecycle & Board Management

### 1.1 Issue Start Protocol (`In Progress`)
1. Label the issue: `gh issue edit <IssueNumber> --add-label "status:in-progress"`
2. Post an initial comment on the issue (`gh issue comment <IssueNumber> --body "🚀 **Status**: In Progress..."`).
3. Move card on GitHub Project v2 board to `In Progress`.

### 1.2 Creating Pull Requests & Linking Issues
1. Ensure changes are committed on an isolated worktree branch via `wt switch --create feature/<issue>-<slug>`.
2. Open PR targeting `staging`:
   ```bash
   gh pr create --base staging --title "feat: <Title>" --body "Fixes #<IssueNumber>"
   ```

### 1.3 PR-Gated Closure
Never close an issue while its PR is open. Leave the issue open with `status:completed` until the PR is merged into `staging`.
