# Phase III: Todo AI Chatbot - Manual Test Checklist

**Date**: 2026-02-04
**Feature**: Todo AI Chatbot
**Tester**: _________________

---

## Prerequisites

- [ ] Backend server running (`cd backend && uvicorn main:app --reload`)
- [ ] Frontend dev server running (`cd frontend && npm run dev`)
- [ ] User is logged in to the application
- [ ] GEMINI_API_KEY is set in backend/.env

---

## US1: Add Task via Natural Language (P1)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Basic add | "Add a task to buy groceries" | Task created, confirmation shown | [ ] |
| Create syntax | "Create a task: call mom" | Task created with title "call mom" | [ ] |
| Need to syntax | "I need to finish the report" | Task created with full phrase | [ ] |
| Remind me syntax | "Remind me to take out trash" | Task created | [ ] |

---

## US2: List Tasks via Natural Language (P1)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Show tasks | "Show my tasks" | List of tasks displayed | [ ] |
| What todos | "What are my todos?" | Same list format | [ ] |
| Empty list | (with no tasks) "Show tasks" | "You don't have any tasks" message | [ ] |
| With tasks | (after adding 3 tasks) "List all my todos" | Numbered list of 3 tasks | [ ] |

---

## US3: Complete Task via Natural Language (P2)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Mark done | "Mark buy groceries as done" | Task marked complete, confirmation | [ ] |
| I finished | "I finished the report" | Task completed | [ ] |
| Partial match | "Complete groceries" | Matches and completes task | [ ] |
| Multiple matches | "Complete project" (2 project tasks) | Disambiguation list shown | [ ] |
| Already complete | (complete same task) "Mark groceries done" | "Already complete" message | [ ] |

---

## US4: Delete Task via Natural Language (P2)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Delete task | "Delete the groceries task" | Task deleted, confirmation | [ ] |
| Remove syntax | "Remove call mom from my list" | Task deleted | [ ] |
| Not found | "Delete nonexistent task" | "Couldn't find" message | [ ] |
| Cancel syntax | "Cancel the report task" | Task deleted | [ ] |

---

## US5: Update Task via Natural Language (P3)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Rename task | "Rename 'buy groceries' to 'buy organic groceries'" | Title updated, old/new shown | [ ] |
| Change syntax | "Change the report task to quarterly report" | Task title updated | [ ] |
| Update to | "Update meeting to team meeting" | Task title updated | [ ] |

---

## US6: Conversational Context (P3)

| Test | Input | Expected Result | Pass |
|------|-------|-----------------|------|
| Add then complete it | "Add buy milk" → "mark it done" | "buy milk" marked complete | [ ] |
| List then first one | "Show tasks" → "delete the first one" | First task deleted | [ ] |
| Add then delete it | "Add test task" → "actually delete it" | Test task deleted | [ ] |
| List then second one | "Show tasks" → "complete the second one" | Second task completed | [ ] |

---

## UI/UX Tests

| Test | Expected Result | Pass |
|------|-----------------|------|
| Toggle button visible | Floating button in bottom-right corner | [ ] |
| Toggle pulse animation | Button has subtle pulse glow effect | [ ] |
| Panel slides in | Click toggle → panel slides from right | [ ] |
| Panel slides out | Click X or toggle → panel slides out | [ ] |
| Glassmorphism effect | Panel has blur/transparency effect | [ ] |
| Bot avatar glows | Avatar has glow animation | [ ] |
| Status indicator blinks | Green dot blinks | [ ] |
| Typing indicator | 3 bouncing dots while bot "thinks" | [ ] |
| Message animations | Messages slide up when appearing | [ ] |
| Quick replies visible | Pill buttons shown after welcome | [ ] |
| Quick reply works | Click "Show my tasks" → sends message | [ ] |
| Auto-scroll | New messages scroll into view | [ ] |
| Send button disabled | Empty input → button disabled | [ ] |
| Enter to send | Press Enter → sends message | [ ] |

---

## Error Handling

| Test | Expected Result | Pass |
|------|-----------------|------|
| Unknown intent | "blah blah random" | "I can help you..." message | [ ] |
| Empty message | Send empty → validation error | [ ] |
| Rate limit | Send 61+ messages rapidly | 429 error shown | [ ] |
| Not authenticated | (logged out) open chat | Chat widget not shown | [ ] |

---

## Performance

| Test | Expected Result | Pass |
|------|-----------------|------|
| Response time | Messages return in < 5 seconds | [ ] |
| Animation smoothness | 60fps animations, no jank | [ ] |
| Panel open/close | Smooth slide transition | [ ] |

---

## Summary

- Total Tests: 40
- Passed: ___
- Failed: ___
- Blocked: ___

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Sign-off**: _________________ Date: _________________
