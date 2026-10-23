# Veytria Chat Application
## Product Requirements Document (PRD)

**Document purpose:** Product and implementation specification for Antigravity  
**Product name:** Veytria (working name)  
**Product type:** Responsive real-time messaging web application  
**Design reference:** `stitch_ui_style_adapter.zip` (`code.html` and `screen.png`)  
**Document status:** Ready for implementation planning

---

## 1. Product Overview

Veytria is a modern chat application with a premium, dark, futuristic interface. Its visual identity should evoke a sophisticated command center: focused, structured, responsive, and fast. The supplied Stitch reference is a music-player interface, so use it **only as a visual design-system reference**. Do not copy music-player features or music-specific content into the chat application.

The goal is to adapt the reference's layout, spacing, surfaces, color accents, typography, and interaction patterns to a practical messaging experience while preserving the project's existing architecture and working functionality.

### Product vision

Create a reliable real-time messaging workspace where users can find conversations quickly, communicate naturally, manage contacts, and access account settings through a polished interface.

### Suggested tagline

**Your world. Your network.**

The name Veytria is provisional. Check domain, social handle, and trademark availability before public launch.

---

## 2. Goals and Non-Goals

### Goals

- Deliver a premium dark interface inspired by the supplied Stitch screenshot.
- Make one-to-one conversations and group chats easy to discover and use.
- Support responsive desktop, tablet, and mobile layouts.
- Make conversation, message, and presence states clear.
- Preserve existing backend, authentication, database, and real-time messaging implementation wherever present.
- Ensure the interface uses real application data rather than hardcoded demo content.
- Provide loading, empty, error, offline, and reconnecting states.
- Maintain accessible contrast, keyboard navigation, and clear focus states.

### Non-goals for the initial release

- Voice or video calls unless already implemented.
- End-to-end encryption claims unless it is genuinely implemented and independently reviewed.
- AI-generated messages or summaries.
- Payments, subscriptions, or premium tiers.
- Public social feeds or music-player functionality from the reference UI.

---

## 3. Target Users and Core Use Cases

### Target users

- Individuals who need fast, straightforward private messaging.
- Small groups coordinating projects, study, or everyday communication.
- Users who prefer a polished desktop experience that also works on mobile.

### Core user journeys

1. A returning user signs in and sees their recent conversations.
2. The user searches for a person or conversation.
3. The user opens a conversation, reads message history, and sends a message.
4. The user sees message delivery/read states when supported by the current backend.
5. The user starts a new conversation or creates a group, if supported.
6. The user opens a profile or settings panel and updates available preferences.
7. If connectivity is interrupted, the app communicates the status and reconnects without silently losing unsent text.

---

## 4. Visual Design Direction

Use `screen.png` as the primary visual reference and `code.html` as supplementary evidence for colors, surface treatments, and component patterns.

### Design principles

- Dark, low-glare canvas with restrained cyan accents.
- Clear separation between navigation, active content, and contextual details.
- Rounded panels and cards, but avoid excessive nested containers.
- Strong text hierarchy and compact supporting metadata.
- Subtle borders and shadows instead of heavy outlines.
- Use gradients sparingly for important highlights, not every surface.
- Motion should be short and purposeful. Respect reduced-motion preferences.
- The design should feel like a modern communication product, not a music application or a Marvel-branded replica.

### Reference palette

| Token | Suggested value | Usage |
|---|---|---|
| `app-bg` | `#0C0E14` | Overall application background |
| `surface-sidebar` | `#14171F` | Main navigation sidebar |
| `surface-main` | `#10131A` | Main workspace |
| `surface-card` | `#1B202A` | Conversation rows, cards, popovers |
| `surface-hover` | `#232936` | Hovered and selected-adjacent surfaces |
| `brand-primary` | `#06B6D4` | Primary actions, active navigation, links |
| `brand-highlight` | `#22D3EE` | Active indicators and high-emphasis accents |
| `text-primary` | `#F8FAFC` | Primary text |
| `text-secondary` | `#94A3B8` | Timestamps, subtitles, metadata |
| `border-subtle` | `rgba(255,255,255,0.07)` | Panel and divider borders |
| `status-online` | `#10B981` | Online indicator |
| `status-error` | `#F87171` | Error and failed-send state |

Treat these as design tokens, not scattered hardcoded values. Define them centrally using the project's existing styling system.

### Typography

- Use Inter when already available, otherwise a system sans-serif stack.
- Primary page title: approximately 22–28 px, bold.
- Conversation title: approximately 14–16 px, semibold.
- Body messages: approximately 14–16 px with comfortable line height.
- Metadata: approximately 11–13 px, with adequate contrast.
- Avoid tiny text for important statuses or controls.

### Shape and spacing

- Main desktop panels: approximately 20–28 px corner radius, based on the reference.
- Cards and conversation rows: approximately 12–18 px radius.
- Buttons and inputs: approximately 10–16 px radius, depending on size.
- Use a consistent 4 px spacing scale.
- Keep content aligned and avoid unnecessary horizontal scrolling.

### Effects

- Use a subtle translucent surface only where it improves hierarchy.
- Use `backdrop-filter` sparingly and provide a solid-color fallback.
- Keep shadows soft and low contrast.
- Scrollbars should be unobtrusive but visible enough to discover.

---

## 5. Application Layout

### Desktop layout

Adapt the three-column composition in the Stitch reference to messaging:

1. **Left navigation sidebar**
   - Veytria logo and product name.
   - Main navigation: Chats, Contacts, and any currently supported sections.
   - Conversation list with avatar, name, last-message preview, timestamp, unread count, and presence indicator where available.
   - New conversation action.
   - User profile and settings entry near the bottom.

2. **Central conversation workspace**
   - Header with contact/group avatar, name, presence or group member count, and supported actions.
   - Scrollable message history.
   - Message bubbles with clear sender distinction, timestamps, and supported delivery/read status.
   - Message composer anchored to the bottom of the conversation panel.
   - Empty state when no conversation is selected.

3. **Optional contextual panel**
   - Contact or group details, shared media/files, or member list only if supported by existing functionality.
   - The panel must be collapsible and must not squeeze the message area excessively.
   - On smaller screens, present contextual details as a drawer or modal.

4. **Global feedback layer**
   - Toasts for non-blocking success/error feedback.
   - Clear offline/reconnecting status when applicable.
   - Confirmation dialog for destructive actions.

### Tablet layout

- Keep the conversation list and active chat visible when practical.
- Collapse the optional details panel by default.
- Reduce sidebar width and allow navigation to collapse.

### Mobile layout

- Use a single primary screen at a time: conversation list, active chat, or details.
- Provide an obvious back action from an active chat to the conversation list.
- Keep the message composer above the mobile keyboard and safe-area insets.
- Ensure buttons have comfortable touch targets, ideally around 44 x 44 px.
- Do not force the desktop three-column layout onto narrow screens.

---

## 6. Functional Requirements

### P0: Required for a usable release

#### Authentication and session
- Preserve the current authentication provider and existing session handling.
- Show clear signed-out, loading, authenticated, and session-expired states.
- Protect authenticated routes using the existing application architecture.
- Do not expose secrets or server-only credentials in frontend code.

#### Conversation list
- Load the signed-in user's real conversations from the existing backend.
- Display participant/group name, avatar or fallback initials, last-message preview, and timestamp.
- Display unread counts and online status only when the backend provides reliable data.
- Highlight the selected conversation.
- Support loading, empty, and error states.
- Update the last-message preview and ordering when new messages arrive, according to existing product behavior.

#### Real-time messaging
- Load message history for the selected conversation.
- Send and receive messages through the current API and real-time transport.
- Prevent duplicate sends caused by repeated clicks or event subscriptions.
- Show sending, sent, failed, and read/delivered states only when those states are actually supported.
- Keep the newest messages visible when the user is already at the bottom. Do not forcibly scroll users to the bottom when they are reading older messages.
- Preserve typed text after a temporary send failure when feasible.
- Sanitize or safely render message content to prevent script injection.

#### Message composer
- Support text input and sending with Enter, with Shift+Enter for a newline where appropriate.
- Disable sending when the message is empty or only whitespace.
- Show a visible sending state and recover from errors.
- Keep composer controls accessible by keyboard and screen reader.
- Add attachment, emoji, reply, edit, or delete controls only if the backend and current product scope support them.

#### Search
- Search conversations and/or contacts according to the current backend capabilities.
- Debounce remote search requests where appropriate.
- Show loading, no-results, and error states.
- Clear search without losing the currently selected conversation.

#### Profile and settings
- Display the signed-in user's actual profile details.
- Preserve existing profile update and logout behavior.
- Do not render controls that appear functional but have no implementation.

### P1: Include when supported by the existing application

- Create one-to-one conversations.
- Create groups and manage members.
- Typing indicators and presence updates.
- Message reactions and replies.
- Image/file sharing with appropriate size/type validation.
- Pinned conversations and mute controls.
- Contact/group details panel.
- Toast notifications and notification preferences.

### P2: Future enhancements

- Voice/video calls.
- Message search across history.
- Rich link previews.
- Advanced notification controls.
- Optional themes beyond the default dark theme.
- End-to-end encryption only after a proper technical design and security review.

---

## 7. Interaction and Component Requirements

### Navigation sidebar
- Active section uses a restrained cyan background/border treatment similar to the reference's active Browse item.
- Hover and focus states must be distinct.
- On desktop, the sidebar may be collapsible if doing so fits the existing app architecture.

### Conversation rows
- Use consistent avatar sizing and alignment.
- Keep the conversation name visually prominent and message preview secondary.
- Unread state should be noticeable without making every row visually noisy.
- Truncate long previews gracefully.
- Clicking a row opens the correct conversation and updates the selected state.

### Message bubbles
- Differentiate own messages and incoming messages through alignment and subtle surface/color changes.
- Keep long messages readable and constrain bubble width.
- Support line breaks and safe links.
- Do not rely on color alone to communicate delivery or failure state.
- Group consecutive messages from the same sender where suitable.

### Composer
- Fixed to the bottom of the central panel, not the entire page in a way that covers messages.
- Use a clear focus ring and visible send action.
- On mobile, account for the on-screen keyboard and safe-area insets.

### Buttons and menus
- Every visible control must have a real action or be clearly disabled with a reason.
- Provide accessible names for icon-only buttons.
- Menus and dialogs must support keyboard navigation and Escape to close where appropriate.
- Destructive actions require confirmation when data loss is possible.

---

## 8. Technical and Integration Constraints

1. **Audit before editing.** Inspect the repository structure, package files, existing routes, authentication, API services, database models, real-time event handlers, and current styling conventions.
2. **Preserve the current stack.** Do not replace the framework, backend, database, authentication provider, or WebSocket/Socket.IO setup without a clear blocker and explicit approval.
3. **Reuse working features.** Refactor only where necessary. Avoid rewriting stable business logic solely to match the visual reference.
4. **Use real data.** Do not ship mock users, fake conversations, or static message arrays as production behavior. Seed data may be used only in a clearly separated development/demo mode.
5. **Centralize design tokens.** Implement colors, radii, spacing, shadows, and typography through the existing design/styling system.
6. **Componentize sensibly.** Prefer reusable components such as `AppShell`, `Sidebar`, `ConversationList`, `ConversationItem`, `ChatHeader`, `MessageList`, `MessageBubble`, `MessageComposer`, `ContactDetailsPanel`, `Toast`, and `EmptyState` where consistent with the codebase.
7. **Respect existing API contracts.** If an endpoint or event is missing, document the gap before implementing a compatible change. Do not invent a frontend-only substitute that silently loses data.
8. **Handle real-time lifecycle correctly.** Subscribe once, clean up listeners on unmount or conversation change, and avoid duplicate events.
9. **Environment variables.** Keep environment-specific URLs and secrets in environment configuration. Update `.env.example` with placeholders only if needed.
10. **Avoid unnecessary dependencies.** Use the current icon and component libraries if already installed. Do not add a large UI framework just for styling.

---

## 9. Accessibility, Security, and Reliability

- Meet WCAG AA contrast targets for normal text where practical.
- Use semantic landmarks, buttons, labels, and form controls.
- Ensure all functionality can be used by keyboard.
- Provide visible focus indicators.
- Respect `prefers-reduced-motion`.
- Provide text alternatives for avatars and meaningful images.
- Never render untrusted message HTML directly.
- Validate uploaded files on both client and server if attachments are supported.
- Enforce authorization on the server for conversation access and message operations.
- Do not treat client-side route guards as security boundaries.
- Avoid logging message bodies, tokens, or sensitive user data unnecessarily.
- Handle disconnected sockets, retry states, and expired sessions clearly.
- Do not claim end-to-end encryption unless implemented and verified.

---

## 10. Performance Requirements

- Keep the initial application shell responsive and avoid unnecessary blocking effects.
- Lazy-load optional panels and large media when useful.
- Avoid rerendering the entire conversation list for every keystroke or incoming message.
- Clean up subscriptions, timers, and listeners correctly.
- Paginate or incrementally load long message histories if supported by the backend.
- Use stable list keys and avoid expensive work in render paths.
- Keep animations subtle and avoid animating large layout properties unnecessarily.

---

## 11. Empty, Loading, and Error States

Implement intentional states for:

- Initial application loading.
- No conversations yet.
- No conversation selected.
- Empty conversation history.
- Search with no results.
- Failed conversation or message load.
- Message send failure.
- Offline and reconnecting status.
- Expired authentication session.
- Missing avatar or profile image.
- Unsupported or failed attachment, if attachments exist.

Each state should explain what happened and provide a relevant next action when possible. Avoid generic blank panels and indefinite spinners.

---

## 12. Suggested Implementation Phases

### Phase 1: Repository audit
- Identify the current stack and app entry points.
- Map existing routes, data models, API endpoints, auth flow, and real-time events.
- Identify current functionality that must not regress.
- Report any missing backend capabilities before changing contracts.

### Phase 2: Design foundation
- Define theme tokens from the supplied reference.
- Establish typography, spacing, radii, focus states, and responsive breakpoints.
- Build the main app shell and responsive navigation.

### Phase 3: Messaging workspace
- Implement conversation list, active chat header, message history, message bubbles, and composer.
- Connect all views to the existing API and real-time transport.
- Implement loading, empty, error, and reconnection states.

### Phase 4: Search and account controls
- Connect search and profile/settings actions to real functionality.
- Add optional details panel and supported P1 features.

### Phase 5: Quality assurance
- Run lint, type checks, tests, and production build using the project's existing scripts.
- Test responsive behavior at desktop, tablet, and mobile widths.
- Verify authentication, conversation loading, send/receive, search, and reconnect behavior.
- Fix regressions before reporting completion.

---

## 13. Acceptance Criteria

The implementation is complete when:

- [ ] The main application visually follows the supplied dark, rounded, cyan-accented design direction.
- [ ] Music-specific UI and content from the reference are not copied into the chat product.
- [ ] The desktop layout has clear navigation, conversation list, and central chat workspace.
- [ ] The mobile layout is intentionally designed and usable without horizontal overflow.
- [ ] Existing authentication still works.
- [ ] Conversations and messages come from the real application backend.
- [ ] Real-time send/receive works without duplicate subscriptions or duplicate messages.
- [ ] The composer supports keyboard interaction and does not cover the message history.
- [ ] Search, profile, and settings controls work or are clearly marked unavailable/disabled.
- [ ] Loading, empty, error, offline, and reconnecting states are implemented.
- [ ] No visible control is a dead button.
- [ ] Accessibility basics, focus states, and contrast are checked.
- [ ] Existing backend and data behavior are preserved unless a documented change is necessary.
- [ ] Lint/type checks/tests/build pass, or any existing failures are explicitly documented with evidence.

---

## 14. Antigravity Implementation Prompt

Read this PRD completely and inspect the supplied `stitch_ui_style_adapter.zip`, especially `screen.png` and `code.html`, before editing the project.

Treat the Stitch files as a **visual style reference only**. They depict a music player, but the target product is the Veytria chat application. Adapt the reference's dark surfaces, cyan accent color, rounded panels, spacing, typography, sidebar hierarchy, subtle borders, and responsive composition to a real messaging interface. Do not add music-player functionality or copy unrelated music content.

First audit the current repository and explain the existing stack, routes, authentication, backend, database, and real-time messaging implementation. Then implement the work in the phases above. Preserve working features and API contracts, use real data, and avoid fake/demo behavior. Do not replace the entire project or rewrite stable backend logic merely to match the design. Make changes incrementally, test each phase, and finish with a concise report of files changed, features completed, commands/tests run, any failures, and remaining gaps. Do not claim a feature works unless you verified it.

---

## 15. Open Decisions

Confirm these from the existing codebase before implementation rather than guessing:

- Current frontend and backend frameworks and versions.
- Current authentication provider and profile schema.
- Whether real-time transport is Socket.IO, native WebSocket, or another service.
- Whether group chats, attachments, reactions, read receipts, and typing indicators already exist.
- Whether the app has an established logo or whether a simple text/monogram mark should be used temporarily.
- Whether the product name Veytria is final.
