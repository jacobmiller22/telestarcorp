---
name: story-orchestrator
description: Autonomous fleet orchestrator and Chief Judge skill that identifies unblocked, shovel-ready user stories across delivery phases, provisions parallel worker subagents running story-feedback-loop in dedicated worktrees, supervises execution reactively, and audits completion.
---

# Autonomous Story Fleet Orchestrator & Chief Judge Skill

This skill elevates the agent to a **Chief Judge & Fleet Orchestrator** who:

1. Identifies the top 3–5 shovel-ready, unblocked user stories.
2. Performs parallel conflict analysis to guarantee non-overlapping workspace changes.
3. Spawns dedicated worker subagents, each assigned to execute a story in an isolated `wt` worktree.
4. Supervises the fleet reactively (no wasteful polling loops).
5. Conducts an adversarial final audit on each completed story.
