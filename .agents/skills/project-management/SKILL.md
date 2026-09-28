---
name: project-management
description: Guidance for AI agents acting as Technical Project Managers (TPM) to manage GitHub Project v2 boards, milestones, labels, issues, and status automation.
---

# Technical Project Management Skill

This skill informs AI agents how to manage project delivery, update GitHub Project v2 boards, track story dependencies, and execute TPM responsibilities for this monorepo.

---

## 1. Intent Capture & Ticket Creation Protocol ("Stop-Short" Rule)

Whenever the user instructs to **"create a ticket"**, **"let's create a ticket"**, **"capture this story"**, or any variation of logging work or intent:

### 1.1 Strict Session Scope Boundary
1. **Focus Exclusively on Capturing Intent**: The session's sole purpose is to analyze, structure, groom, and log the work as a GitHub issue or story with shovel-ready criteria, clear scopes, labels, milestones/waves, and reviewer rubrics.
2. **Never Execute Immediately in the Same Session**:
   - **NEVER** write application source code in the capture session.
   - **NEVER** spawn implementation worktrees (`wt switch --create feature/...`).
   - **NEVER** launch active implementation or execution subagents in the capture session.
3. **Context Turnover Handshake**: Conclude the turn by reporting a concise summary of the created issue(s) and explicitly prompting the user to clear context:
   > *"I have created Issue #`<N>`: `<Title>`. I'm ready for you to clear the context and get started working on this with `/pm` (e.g. `/pm ship #<N>` or `/pm work`)."*

---

## 2. Issue Lifecycle & Board Management

### 2.1 Issue Start Protocol (`In Progress`)
1. Label the issue: `gh issue edit <IssueNumber> --add-label "status:in-progress"`
2. Post an initial comment on the issue (`gh issue comment <IssueNumber> --body "🚀 **Status**: In Progress..."`).
3. Move card on GitHub Project v2 board to `In Progress`.

### 2.2 Creating Pull Requests & Linking Issues
1. Ensure changes are committed on an isolated worktree branch via `wt switch --create feature/<issue>-<slug>`.
2. Open PR targeting `staging`:
   ```bash
   gh pr create --base staging --title "feat: <Title>" --body "Fixes #<IssueNumber>"
   ```

### 2.3 PR-Gated Closure
Never close an issue while its PR is open. Leave the issue open with `status:completed` until the PR is merged into `staging`.
