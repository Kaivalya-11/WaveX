# Profile & Settings Page Specification

## Purpose
Implement the **Profile & Settings** screen shown in the supplied Stitch reference (`stitch_ui_style_adapter (1).zip`) in the existing WaveX music-streaming application. Treat the included `code.html` and `screen.png` as the visual source of truth. This file describes the requirements for Antigravity; it is not a request to replace the existing application with a standalone demo.

## Primary instruction for Antigravity
Inspect the existing repository and the supplied Stitch reference before editing. Implement the Profile & Settings page using the project's current framework, components, routing, authentication, and data services. Reuse existing patterns and preserve all working functionality. Do not hardcode the example profile, subscription, playlists, or settings from the reference when real application data is available. Do not introduce mock data into production flows.

## Visual direction

- Dark, premium music-app interface with a near-black navy background.
- Cyan is the primary accent, with restrained orange/amber highlights.
- Use Inter or the project's existing equivalent sans-serif font.
- Cards should have subtle borders, rounded corners, soft shadows, and clear hierarchy.
- Use restrained cyan glow for active navigation, focus states, and the profile avatar ring. Avoid excessive glow.
- The background may use subtle cyan and orange radial gradients.
- Use smooth, short hover and focus transitions.
- Maintain strong contrast and readable text sizes.

### Design tokens from the reference

| Token | Value | Intended use |
|---|---|---|
| `dark` | `#080C14` | Main page background |
| `sidebar` | `#0B101C` | Sidebar background |
| `surface` | `#0F1626` | Main surfaces |
| `card` | `#131D31` | Cards and panels |
| `cyan` | `#00E5FF` | Primary accent and active states |
| `cyan-dark` | `#00B8CC` | Accent gradients and pressed states |
| `teal` | `#06B6D4` | Secondary accent |
| `orange` | `#FF7B00` | Secondary highlight |
| `amber` | `#F59E0B` | Warnings and secondary status |
| `border` | `rgba(255,255,255,0.08)` | Subtle panel borders |

Use these values as guidance and adapt them to the existing design-token system instead of duplicating tokens unnecessarily.

## Page layout

### 1. Application sidebar
Create a fixed-width desktop sidebar, approximately 16rem where space allows, with:
- WaveX logo and wordmark at the top.
- Primary navigation entries: Home, Browse, Liked Tracks, Downloads, Radio, and Profile & Settings.
- Profile & Settings visibly marked as the current page using a subtle cyan accent, border, and background.
- A playlist section with a heading, add-playlist action, and playlist links if supported by the application.
- A compact account card at the bottom showing the signed-in user's avatar, display name, online/status indicator where applicable, and membership label only if supported by actual account data.

Navigation links and the add-playlist control must work. Do not create dead controls.

### 2. Main content area
- Fill the remaining viewport and allow vertical scrolling.
- Add a sticky or appropriately positioned top header with breadcrumb text such as `Account / Profile & Preferences`.
- Include a search field only if the existing application supports meaningful global search from this area.
- Include notifications or quick actions only when they are connected to real functionality.
- Keep content aligned to a consistent maximum width with comfortable spacing.

### 3. Profile & preferences content
Build a clear page heading and supporting description, then organize profile information and settings into responsive cards or sections. Keep the hierarchy consistent with the Stitch reference.

Recommended sections:
- **Profile information:** Avatar, display name, username or email, and editable profile fields supported by the current account model.
- **Account preferences:** Available language, appearance, playback, or other existing user preferences.
- **Privacy and security:** Existing account security options, session controls, and privacy preferences, where supported.
- **Membership or plan:** Show subscription status only if the app has reliable subscription data. Never label a user as premium based on static reference content.
- **Account actions:** Save changes, cancel/reset unsaved edits where appropriate, and sign out. Destructive actions must be clearly distinguished and confirmed where necessary.

If the reference's exact content differs from the existing product's capabilities, preserve the visual structure while implementing only real, supported features. Do not invent backend capabilities.

## Interaction requirements

- Load the signed-in user's profile from the existing authentication/data layer.
- Populate form fields from real user data.
- Validate editable fields and show clear inline validation messages.
- Provide loading, success, and error states for profile updates.
- Save changes through the existing backend or persistence layer, not only local component state.
- Keep the UI synchronized after a successful save.
- Prevent accidental loss of unsaved changes where practical.
- Make toggles and selectors reflect saved preferences and persist changes through the existing supported mechanism.
- Handle missing avatar/profile fields with a polished fallback.
- Sign-out must use the application's current authentication flow.
- Ensure all interactive elements have hover, focus, disabled, and error states as appropriate.
- Do not expose secrets, tokens, or sensitive account data in the interface or logs.

## Responsive behavior

### Desktop
- Display the sidebar and main content side by side.
- Keep the header controls aligned without squeezing the main content.
- Use a multi-column card layout only where it remains readable.

### Tablet
- Reduce horizontal padding and gaps.
- Allow cards to reflow into fewer columns.
- Collapse the sidebar if the existing application already has a responsive navigation pattern.

### Mobile
- Replace the desktop sidebar with the app's established mobile navigation or a compact menu.
- Stack profile and settings sections vertically.
- Ensure forms, buttons, and controls fit narrow screens without horizontal overflow.
- Use touch targets of approximately 44px or larger.
- Keep save and account actions easy to find.
- Respect safe areas and the existing mobile layout conventions.

## Accessibility
- Use semantic headings, navigation, forms, labels, buttons, and links.
- Ensure keyboard navigation and visible focus indicators.
- Do not use color alone to communicate status.
- Provide accessible names for icon-only buttons.
- Ensure text and controls have sufficient contrast.
- Associate validation messages with their inputs and announce important save/error feedback appropriately.
- Respect reduced-motion preferences.

## Engineering constraints
1. Audit the current repository, routing, authentication context, user schema, and existing settings components before implementation.
2. Reuse the existing framework, styling system, icons, and component library wherever possible.
3. Do not replace or rewrite unrelated pages.
4. Do not remove existing features or change API contracts without a clear need.
5. Avoid adding dependencies unless necessary and justified.
6. Keep secrets and environment variables out of client-side code.
7. Follow existing code conventions and keep components maintainable.
8. Treat the supplied HTML as a visual reference, not code that must be copied wholesale. Avoid adding a separate Tailwind CDN page if the application already has its own build setup.
9. Use real user data and existing APIs. If a required capability is absent, identify the gap rather than faking a successful operation.
10. Preserve the rest of WaveX, including music playback and navigation.

## Suggested implementation sequence

1. **Audit:** Inspect the repository and identify the profile route, shared layout, authentication source, user data model, and persistence endpoints.
2. **Structure:** Build or adapt the page layout, sidebar active state, header, and responsive content grid.
3. **Profile data:** Connect avatar and editable account fields to the existing user data source.
4. **Preferences:** Wire up only the settings that the current application supports.
5. **States and feedback:** Add validation, loading, success, error, and unsaved-change handling.
6. **Responsive and accessibility pass:** Test desktop, tablet, and mobile widths, keyboard navigation, and focus states.
7. **Regression checks:** Verify navigation, authentication, profile persistence, and music-player behavior remain intact.

## Acceptance checklist

- [ ] Profile & Settings is reachable through the existing app navigation.
- [ ] The active sidebar item is clearly identified.
- [ ] The visual result follows the supplied Stitch reference's dark navy and cyan style.
- [ ] The signed-in user's actual profile data is displayed.
- [ ] Profile edits are validated and persist after refresh.
- [ ] Loading, success, empty, and error states are handled.
- [ ] Settings controls are connected to supported persistence and do not falsely imply success.
- [ ] Sign-out uses the existing authentication mechanism.
- [ ] Layout is usable at desktop, tablet, and mobile sizes.
- [ ] Keyboard focus and accessible labels are present.
- [ ] No unrelated WaveX functionality has regressed.
- [ ] No static demo data or nonfunctional placeholder buttons remain in the completed implementation.

## Final instruction
After implementation, summarize the files changed, the real functionality connected, any unsupported features intentionally left out, and the tests/build commands run with their results. Fix any introduced errors before declaring the task complete.
