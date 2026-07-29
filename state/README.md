# Learner runtime state, one JSON file per learner. Gitignored.

Written and read by `src/runtime/store.ts` (`loadState` / `saveState`), used by the `elle` CLI
(`src/cli.ts`) for the AI Engineer Stack course. Each file is named `<learner-id>.json` and
holds the `LearnerState` shape defined in `src/runtime/state.ts`: sessions, per-unit progress,
the sealed-reading hash chain, and the adaptation log. The directory is created on first write
if it doesn't exist; nothing here is checked in (`state/*.json` is gitignored).

This directory is separate from `courses/ai-coding-101/state/`, which holds learner state for
the AI Coding 101 course under its own schema (`courses/ai-coding-101/LEARNER-STATE.md`).
