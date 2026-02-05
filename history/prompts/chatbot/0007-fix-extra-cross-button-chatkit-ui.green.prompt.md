---
id: 0007
title: Fix extra cross button in ChatKit UI
stage: green
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: chatbot
branch: 004-todo-ai-chatbot
user: maira
command: /sp.implement
labels: ["ui", "chatbot", "fix", "toggle-button"]
links:
  spec: specs/ui/chatkit.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/chat/ChatToggle.tsx (modified)
tests:
  - Manual test: Open chat panel, verify no extra cross button at bottom
  - Manual test: Close panel via header X button, verify toggle reappears
---

## Prompt

Fix extra cross button issue in Phase III Todo AI Chatbot UI

Current problem:
- In the chat panel (right sidebar), there is an extra "×" (cross) button appearing at the bottom near the input field / send button.
- This cross button is unwanted and overlapping / coming above the send button.
- The header already has the correct close "×" button (top right), which is fine and should stay.
- Only the bottom one needs to be removed.

Goal:
- Remove the extra bottom cross button that is appearing near the input/send area.
- Keep the header close button intact.
- Ensure send button works normally and no layout shift happens.
- Do not affect typing indicator, quick replies, or message bubbles.

## Response snapshot

Root cause identified: The `ChatToggle` component (floating button at bottom-right) was showing an X icon when the panel was open. Since the panel slides in from the right and the toggle is positioned at `fixed bottom-6 right-6`, this X appeared near/over the input area.

Fix applied to `frontend/components/chat/ChatToggle.tsx`:
- Hide the toggle button entirely when panel is open (`if (isOpen) return null`)
- Users close the panel via the header close button instead
- Removed unused X icon import
- Simplified the component logic

## Outcome

- ✅ Impact: Extra cross button removed, clean UI with single close point in header
- 🧪 Tests: Manual verification needed
- 📁 Files: 1 file modified
- 🔁 Next prompts: none
- 🧠 Reflection: The toggle button serving dual purpose (open/close) caused visual confusion; single-purpose buttons are cleaner

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Manual testing pending
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
