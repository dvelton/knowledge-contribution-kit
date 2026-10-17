# Changelog

## 1.0.2 - 2026-10-17

- Replaced ambiguous user-facing "target" terminology with the project name or
  clear references to the skill, agent, tool, checklist, or guide being built.
- Defined the project, contributor, and source material at the beginning of
  every generated prompt.

## 1.0.1 - 2026-10-17

- Removed the arbitrary candidate cap.
- Ranked the five to ten strongest contributions in an executive summary.
- Included every distinct candidate that materially improves the project while
  consolidating overlap and rejecting padding.

## 1.0.0 - 2026-10-17

- Added a no-install knowledge contribution prompt builder shaped to the
  project being built.
- Added a follow-up synthesis prompt for returned contribution documents.
- Added offline, mobile, unit, browser-flow, validation, and release tests.
