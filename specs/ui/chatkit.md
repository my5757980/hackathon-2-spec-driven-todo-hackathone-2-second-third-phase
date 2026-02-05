# Premium Animated Chatbot UI - ChatKit Customization Specification

**Feature**: Todo AI Chatbot (Phase III)
**Created**: 2026-02-03
**Status**: Draft
**Base Framework**: OpenAI ChatKit
**Related Specs**: `specs/features/chatbot/spec.md`, `specs/agent/agent-behavior.md`

---

## Overview & Objective

### Purpose

Create a premium, animated, modern chat user interface for the Todo AI Chatbot that delivers a delightful and engaging user experience while maintaining functional simplicity.

### Base Framework

This specification customizes **OpenAI ChatKit** — we are NOT building a chat UI from scratch. All customizations leverage ChatKit's theming system, CSS overrides, and component wrappers.

### Key Goals

| Goal | Description |
|------|-------------|
| **Glassmorphism** | Semi-transparent panels with backdrop blur for depth and modern aesthetic |
| **Gradients** | Rich color transitions on buttons, avatars, and message bubbles |
| **Smooth Animations** | Fluid 60fps transitions, slides, pulses, and hover effects |
| **Interactive Elements** | Responsive feedback on every user interaction |
| **Premium Feel** | Polished, cohesive design that feels high-quality and intentional |

---

## Design Components

### Component Summary

| # | Component | Position | Key Features |
|---|-----------|----------|--------------|
| 1 | Toggle Button | Bottom-right fixed | Floating, pulsing, gradient |
| 2 | Chat Panel | Right side slide-in | 420px width, glassmorphism |
| 3 | Header | Top of panel | Avatar, status, close button |
| 4 | Messages Area | Scrollable center | Auto-scroll, two message types |
| 5 | Bot Messages | Left-aligned | Robot avatar, semi-transparent bubble |
| 6 | User Messages | Right-aligned | User avatar, gradient bubble |
| 7 | Quick Replies | Below bot messages | Pill buttons, hover lift |
| 8 | Typing Indicator | In messages area | Bouncing dots animation |
| 9 | Input Area | Bottom fixed | Rounded input, gradient send button |

---

### 1. Chatbot Toggle Button

| Property | Specification |
|----------|---------------|
| Shape | Circular (56px diameter) |
| Position | Fixed, bottom-right corner (24px margin) |
| Background | Gradient: Purple (#667eea) → Pink (#764ba2) |
| Icon | Chat emoji (💬) or chat icon |
| Animation | Pulsing shadow effect (2s loop) |
| Hover | Scale up to 1.1x with enhanced shadow |
| Z-index | High (above all content) |
| Behavior | Click toggles panel visibility |

---

### 2. Chatbot Panel

| Property | Specification |
|----------|---------------|
| Position | Fixed, right side of viewport |
| Width | 420px |
| Height | 100vh (full viewport height) |
| Background | Semi-transparent dark (#1a1a2e at 95% opacity) |
| Effect | Backdrop blur (20px) |
| Border | Left border (1px white at 10% opacity) |
| Animation | Slide-in from right with subtle bounce |
| Initial State | Hidden (off-screen right) |
| Shadow | Multi-layer shadow for depth |

---

### 3. Header Section

| Element | Specification |
|---------|---------------|
| Height | 72px |
| Background | Gradient overlay (subtle purple tint) |
| Avatar | Robot emoji (🤖) with circular gradient background |
| Avatar Animation | Glowing shadow effect |
| Title | "AI Assistant" (16px, semi-bold, white) |
| Status Indicator | Green dot (#4ade80) with blink animation |
| Status Text | "Online" (12px, muted white) |
| Close Button | X icon, rotates 90° on hover |
| Padding | 16px horizontal |

---

### 4. Messages Area

| Property | Specification |
|----------|---------------|
| Position | Between header and input |
| Overflow | Scroll Y, hidden X |
| Padding | 16px |
| Gap | 16px between messages |
| Scroll Behavior | Smooth auto-scroll to bottom |
| Background | Transparent (inherits panel) |

---

### 5. Bot Messages

| Element | Specification |
|---------|---------------|
| Alignment | Left-aligned |
| Avatar | Robot emoji (🤖) in circular container |
| Avatar Position | Left of bubble, top-aligned |
| Bubble Background | White at 5% opacity |
| Bubble Border | White at 10% opacity, 1px |
| Border Radius | 16px (4px top-left for pointer effect) |
| Text Color | White at 90% opacity |
| Font Size | 14px |
| Max Width | 80% of container |
| Animation | Slide up + fade in on appear |
| Timestamp | Below bubble, 10px, muted |

---

### 6. User Messages

| Element | Specification |
|---------|---------------|
| Alignment | Right-aligned |
| Avatar | User emoji (👤) in circular container |
| Avatar Position | Right of bubble, top-aligned |
| Bubble Background | Gradient: Pink (#f093fb) → Red (#f5576c) |
| Border Radius | 16px (4px top-right for pointer effect) |
| Text Color | White |
| Font Size | 14px |
| Max Width | 80% of container |
| Animation | Slide up + fade in on appear |
| Timestamp | Below bubble, 10px, muted, right-aligned |

---

### 7. Quick Reply Buttons

| Property | Specification |
|----------|---------------|
| Shape | Pill-shaped (border-radius: 20px) |
| Background | Purple (#667eea) at 20% opacity |
| Border | Purple (#667eea) at 40% opacity, 1px |
| Text Color | White at 90% opacity |
| Font Size | 13px |
| Padding | 8px 16px |
| Hover Effect | Lift up 2px, increase background opacity |
| Layout | Horizontal flex wrap, 8px gap |
| Position | Below bot message that triggers them |
| Behavior | Click sends the reply text |

**Default Quick Reply Options**:
- "Show my tasks"
- "Add new task"
- "What's urgent?"

---

### 8. Typing Indicator

| Element | Specification |
|---------|---------------|
| Container | Same style as bot message bubble |
| Dots | 3 circular dots (8px diameter) |
| Dot Color | White at 60% opacity |
| Animation | Bouncing up/down, staggered delay |
| Timing | Dot 1: 0s, Dot 2: 0.15s, Dot 3: 0.3s delay |
| Duration | 1.4s loop |
| Visibility | Shows while bot is "thinking" |

---

### 9. Input Area

| Element | Specification |
|---------|---------------|
| Position | Fixed at bottom of panel |
| Height | 72px |
| Background | Slightly darker than panel |
| Padding | 16px |
| Input Field | Rounded (24px radius), full width minus button |
| Input Background | White at 5% opacity |
| Input Border | White at 10% opacity, transparent on default |
| Focus Effect | Border glow (purple at 30%), background at 8% |
| Placeholder | "Type your message..." (muted white) |
| Send Button | Circular (44px), gradient background |
| Send Icon | Arrow or paper plane (→ or ✈) |
| Send Hover | Scale 1.05x, enhanced shadow |
| Keyboard | Enter key sends message |

---

## Animations Used

| Animation | Applied To | Description | Duration |
|-----------|------------|-------------|----------|
| **Pulse** | Toggle button | Expanding shadow ring effect | 2.0s loop |
| **Glow** | Bot avatar | Shadow intensity oscillates | 2.0s loop |
| **Blink** | Status dot | Opacity fades in/out | 1.5s loop |
| **Slide-in** | Chat panel | Slides from off-screen right | 0.3s ease-out |
| **Slide-up** | Messages | Slides up 20px while fading in | 0.3s ease-out |
| **Bounce** | Typing dots | Vertical bounce, staggered | 1.4s loop |
| **Scale** | Buttons (hover) | Grows to 1.05-1.1x | 0.2s ease |
| **Rotate** | Close button (hover) | Rotates 90° | 0.2s ease |
| **Color Shift** | Interactive elements | Smooth color transitions | 0.2s ease |
| **Shadow Grow** | Cards/buttons (hover) | Shadow expands and intensifies | 0.2s ease |

### Animation Keyframes Reference

**Pulse Animation**
```
0%   → box-shadow at base size
50%  → box-shadow expands outward with lower opacity
100% → returns to base
```

**Glow Animation**
```
0%   → shadow subtle
50%  → shadow intense (purple glow)
100% → shadow subtle
```

**Bounce Animation (Typing Dots)**
```
0%, 80%, 100% → translateY(0)
40%           → translateY(-8px)
```

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Purple | `#667eea` | Primary brand, gradients, accents |
| Dark Purple | `#764ba2` | Secondary gradient endpoint |
| Pink | `#f093fb` | User message gradient start |
| Red | `#f5576c` | User message gradient end |

### Status Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Green | `#4ade80` | Online status indicator |
| White | `#ffffff` | Text, borders (with opacity) |
| Black | `#000000` | Deep backgrounds |
| Dark Blue | `#1a1a2e` | Panel background base |

### Transparency Levels

| Element | Opacity | RGBA Example |
|---------|---------|--------------|
| Panel background | 95% | `rgba(26, 26, 46, 0.95)` |
| Message bubbles (bot) | 5% white | `rgba(255, 255, 255, 0.05)` |
| Borders | 10% white | `rgba(255, 255, 255, 0.1)` |
| Input focus background | 8% white | `rgba(255, 255, 255, 0.08)` |
| Quick reply background | 20% purple | `rgba(102, 126, 234, 0.2)` |
| Muted text | 60% white | `rgba(255, 255, 255, 0.6)` |
| Primary text | 90% white | `rgba(255, 255, 255, 0.9)` |

### Gradient Definitions

| Name | Type | Colors |
|------|------|--------|
| Primary Button | Linear 135° | `#667eea` → `#764ba2` |
| User Message | Linear 135° | `#f093fb` → `#f5576c` |
| Avatar Background | Linear 135° | `#667eea` → `#764ba2` |
| Header Accent | Linear 180° | `rgba(102,126,234,0.1)` → `transparent` |

---

## Interactive Elements

### Toggle Functionality

| Interaction | Behavior |
|-------------|----------|
| Click toggle button | Panel slides in from right |
| Click close button (X) | Panel slides out to right |
| Click toggle when open | Panel slides out |
| Animation | 300ms ease-out slide |

### Message Sending

| Interaction | Behavior |
|-------------|----------|
| Click send button | Sends message, clears input |
| Press Enter key | Sends message, clears input |
| Press Shift+Enter | New line (no send) |
| Empty input + send | No action (button disabled state) |
| After send | Auto-scroll to new message |
| Bot response | Typing indicator → response after delay |

### Quick Replies

| Interaction | Behavior |
|-------------|----------|
| Click quick reply | Immediately sends that text |
| Hover | Button lifts up 2px, background intensifies |
| After click | Quick replies hide, message appears |

### Typing Simulation

| State | Behavior |
|-------|----------|
| User sends message | Typing indicator appears |
| Delay | 1.5 seconds (simulated thinking) |
| Completion | Typing indicator hides, bot message appears |

---

## Functional Features

### Auto-scroll

| Trigger | Behavior |
|---------|----------|
| New message added | Scroll container to bottom |
| Panel opened | Scroll to most recent message |
| Scroll type | Smooth scrolling animation |
| User scrolled up | Pause auto-scroll until user scrolls to bottom |

### Time Display

| Format | Example |
|--------|---------|
| 12-hour with AM/PM | "2:30 PM" |
| Position | Below message bubble |
| Style | Muted (60% opacity), 10px font |
| Update | Timestamp set when message created |

### Welcome Message

| Element | Content |
|---------|---------|
| Greeting | Personalized: "Hi [Name]! 😊 Kya kaam hai aaj?" |
| Fallback | "Hi there! 😊 How can I help you today?" |
| Quick Replies | Shown with welcome message |
| Timing | Displays immediately when panel opens |

### Message Formatting

| Feature | Support |
|---------|---------|
| Plain text | Full support |
| Emoji | Native rendering |
| Line breaks | Preserved |
| Task lists | Formatted as numbered list |
| Links | Clickable (if included) |

---

## Premium Effects

### Glassmorphism

| Element | Effect |
|---------|--------|
| Chat panel | `backdrop-filter: blur(20px)` |
| Background | Semi-transparent dark with blur |
| Depth | Layered transparency creates depth |
| Border | Subtle light border enhances glass effect |

### Gradient Overlays

| Application | Gradient |
|-------------|----------|
| Toggle button | Purple → Dark Purple (135°) |
| User messages | Pink → Red (135°) |
| Send button | Purple → Dark Purple (135°) |
| Bot avatar | Purple → Dark Purple (135°) |
| Header accent | Purple (10%) → Transparent |

### Shadow Depth

| Element | Shadow Specification |
|---------|---------------------|
| Toggle button | `0 4px 15px rgba(102, 126, 234, 0.4)` |
| Toggle pulse | `0 0 0 20px rgba(102, 126, 234, 0)` (animated) |
| Chat panel | `0 0 40px rgba(0, 0, 0, 0.5)` |
| Bot avatar glow | `0 0 20px rgba(102, 126, 234, 0.5)` |
| Send button | `0 4px 15px rgba(102, 126, 234, 0.3)` |

### Border Glow

| State | Effect |
|-------|--------|
| Input default | Transparent border |
| Input focus | `border-color: rgba(102, 126, 234, 0.5)` + shadow |
| Button hover | Enhanced shadow spread |
| Message bubble | Subtle white border at 10% |

---

## User Experience Goals

### Visual Feedback

| Interaction | Feedback |
|-------------|----------|
| Button hover | Scale + shadow enhancement |
| Button click | Brief scale down (active state) |
| Message sent | Immediate appearance + scroll |
| Bot thinking | Typing indicator visible |
| Error | Shake animation + error color |

### Accessibility

| Aspect | Implementation |
|--------|----------------|
| Color contrast | Minimum 4.5:1 for text |
| Font sizes | Minimum 13px, primary 14px |
| Focus states | Visible focus rings on interactive elements |
| Keyboard nav | Tab through elements, Enter to send |
| Screen reader | ARIA labels on buttons and status |

### Responsiveness

| Aspect | Behavior |
|--------|----------|
| Panel width | Fixed 420px (does not shrink) |
| Mobile | Panel becomes full-width overlay |
| Messages | Wrap and adapt to container |
| Input | Full width minus send button |

### Performance

| Aspect | Target |
|--------|--------|
| Animation FPS | Smooth 60fps |
| Transitions | GPU-accelerated (transform, opacity) |
| Scroll | Native smooth scrolling |
| Load time | Panel renders instantly |
| Memory | Efficient message list (virtualize if >100 messages) |

---

## Implementation Guidelines

### ChatKit Theme Configuration

Use ChatKit's built-in theming props to customize:

| Theme Property | Value |
|----------------|-------|
| `primaryColor` | `#667eea` |
| `backgroundColor` | `rgba(26, 26, 46, 0.95)` |
| `userMessageColor` | Gradient (via CSS override) |
| `botMessageColor` | `rgba(255, 255, 255, 0.05)` |
| `fontFamily` | System UI / Inter / Sans-serif |
| `borderRadius` | `16px` |

### CSS Overrides

For effects not available via theme props, use CSS overrides:

- Backdrop blur on panel container
- Gradient backgrounds on user messages
- Animation keyframes for pulse, glow, blink
- Custom scrollbar styling (thin, semi-transparent)

### Custom Wrappers

Wrap ChatKit components to add:

- Toggle button (not provided by ChatKit)
- Custom header with status indicator
- Quick reply buttons below messages
- Typing indicator component

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CHAT_API_URL` | Backend chat endpoint URL |
| `NEXT_PUBLIC_CHATKIT_DOMAIN` | Domain for ChatKit allowlist |
| `CHATKIT_API_KEY` | ChatKit API key (if required) |

### JWT Authentication

All chat requests must include the JWT token:

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <jwt_token>` |
| `Content-Type` | `application/json` |

**Token source**: Retrieved from Better Auth session on client side.

### Quick Reply Configuration

Default quick reply buttons:

| Button Text | Action |
|-------------|--------|
| "Show my tasks" | Sends "Show my tasks" to agent |
| "Add new task" | Sends "I want to add a new task" |
| "What's urgent?" | Sends "What tasks are pending?" |

Quick replies can be dynamic based on context (e.g., after listing tasks, show "Complete first one").

### Welcome Message Configuration

| User State | Welcome Message |
|------------|-----------------|
| Known user name | "Hi {name}! 😊 Kya kaam hai aaj?" |
| Unknown name | "Hi there! 😊 How can I help you today?" |
| Returning user | "Welcome back, {name}! Ready to check your tasks?" |

### Domain Allowlist

Ensure your deployment domain is added to ChatKit's allowlist:

- Development: `localhost:3000`
- Staging: `staging.yourdomain.com`
- Production: `yourdomain.com`

---

## Out of Scope

| Item | Reason |
|------|--------|
| Building custom chat from scratch | Using ChatKit as base |
| Voice input | Phase III focuses on text only |
| Advanced ML features | Agent handles NLP, not UI |
| Heavy backend logic | Specified in other specs |
| Mobile native app | Web-only for Phase III |
| Real-time collaboration | Single-user chat sessions |
| Message reactions/emoji picker | Keeping UI simple |
| File attachments | Basic Level features only |
| Chat export/history download | Not in Phase III scope |
| Multi-language UI | English + casual Urdu/Hindi only |

---

## Component Checklist

| Component | Status | Notes |
|-----------|--------|-------|
| Toggle Button | 📋 Specified | Floating, pulsing, gradient |
| Chat Panel | 📋 Specified | Slide-in, glassmorphism |
| Header | 📋 Specified | Avatar, status, close |
| Messages Area | 📋 Specified | Scrollable, auto-scroll |
| Bot Messages | 📋 Specified | Left-aligned, semi-transparent |
| User Messages | 📋 Specified | Right-aligned, gradient |
| Quick Replies | 📋 Specified | Pill buttons, 3 defaults |
| Typing Indicator | 📋 Specified | 3 bouncing dots |
| Input Area | 📋 Specified | Rounded input, send button |
| Animations | 📋 Specified | 10 animation types |
| Colors | 📋 Specified | Full palette with hex codes |
| Premium Effects | 📋 Specified | Glass, gradients, shadows |
