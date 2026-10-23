# WaveX: Downloads, Liked Songs & Search/Browse
## Antigravity UI Implementation Specification

## 1. Objective
Implement three coordinated WaveX music-app pages based on the supplied Stitch reference ZIP:

1. **Search & Browse** (`wavex_search_browse`)
2. **Liked Songs** (`wavex_liked_songs`)
3. **Downloads & Offline Storage** (`wavex_downloads_offline_storage`)

Use the included `code.html` and `screen.png` files as visual references. Treat this document as implementation requirements, not permission to replace existing architecture.

## 2. Mandatory Repository Audit
Before editing:
- Inspect the complete repository, routing, shared layout, design tokens, player context, playlist/likes state, download APIs, authentication, and backend.
- Identify the existing components and reuse them wherever possible.
- Determine how tracks are identified and how playback, likes, downloads, search, and playlists currently work.
- Keep existing API contracts and environment variables unless a verified change is necessary.
- Do not replace working backend logic with mock data, hard-coded tracks, or demo-only interactions.
- If a reference design conflicts with current functionality, preserve functionality and adapt the design.

## 3. Shared Visual Design

### Overall aesthetic
Create a premium, dark music workspace with subtle glass surfaces, cyan/teal accents, restrained glow, crisp typography, and dense but readable layouts.

### Suggested palette
- App background: `#070B12` or `#080A10`
- Sidebar: `#0A0F1D` / `#090E17`
- Main card: `#0F172A` / `#10141F`
- Elevated surface: `#131E34` / `#141A29`
- Primary cyan: `#06B6D4` or `#00D2FF`
- Teal accent: `#06D6A0` / `#00E5B0`
- Main text: `#E2E8F0`
- Muted text: `#94A3B8`
- Subtle borders: white at 5–10% opacity

Use Inter or the existing project font. Use glow only for key active states, primary buttons, and the brand mark. Avoid excessive neon.

### Surface and interaction details
- Rounded cards with thin, low-contrast borders.
- Subtle glass effects only where they improve hierarchy.
- Hover transitions should be smooth and short, around 150–250ms.
- Provide clear focus-visible styles and accessible contrast.
- Scrollbars should be subtle and consistent with the theme.
- Respect reduced-motion preferences.

## 4. Shared Application Shell
All three pages must use the existing WaveX application shell:
- Persistent left navigation sidebar on desktop.
- WaveX logo/wordmark and music-suite subtitle.
- Navigation links for the app's existing destinations.
- Clearly highlighted current destination.
- Existing user/profile area and playlist navigation if already supported.
- Persistent player bar at the bottom, using the current player implementation.
- Main content area scrolls independently without causing the whole app to overflow.
- On mobile, collapse or adapt the sidebar to the project's established mobile navigation pattern.

Do not create separate, inconsistent sidebars for each page.

## 5. Search & Browse Page

### Purpose
Help users discover tracks through search and browseable categories while preserving the current WaveX playback flow.

### Layout
- Page heading and concise supporting text.
- Prominent search input with search icon and clear affordance.
- Search results state when a query is entered.
- Browse/discovery content when the query is empty.
- Genre/category cards arranged in a responsive grid.
- Optional trending/recommended sections only if they can be populated from real existing data or the current music service.
- Consistent track rows/cards with artwork, title, artist, duration where available, and play/overflow actions.

### Behavior
- Search submits or updates results using the existing search service.
- Support Enter to search and a clear action to reset the query.
- Show loading, empty, and error states.
- Do not show stale results as if they match a new query.
- Track selection must call the existing player context/service.
- Play buttons must actually start playback.
- If genre filters are present, they must update the displayed content.
- Preserve existing API throttling/error handling and avoid duplicate requests.
- Avoid rendering a hard-coded catalogue as real search results.

### Responsive behavior
- Desktop: spacious grid and full sidebar.
- Tablet: reduce grid columns and spacing.
- Mobile: one or two columns as appropriate, compact search controls, and no horizontal overflow.

## 6. Liked Songs Page

### Purpose
Provide a dedicated library of tracks the current user has liked.

### Layout
- Header with a distinctive liked-songs artwork/gradient treatment inspired by the reference.
- Title **Liked Songs** and a track count derived from actual data.
- Primary Play / Shuffle controls where supported.
- Track list with artwork, title, artist, album or date-added metadata where available, duration, and row actions.
- Clear empty state for users who have not liked any tracks.
- Preserve the global player bar.

### Behavior
- Read liked tracks from the existing source of truth (context/API/database/local persistence as the project already defines).
- Like/unlike actions must update the UI immediately when appropriate and persist using existing functionality.
- Keep the list synchronized when a track is liked or unliked elsewhere in the app.
- Play and shuffle must use actual liked tracks and the existing player.
- Track row actions must reuse existing playlist/download/queue capabilities where implemented.
- Show loading and error states without falsely presenting an empty library during a failed request.
- Display accurate counts and avoid duplicate tracks.

### Data and privacy
- Liked tracks must be scoped to the signed-in user if the existing app supports accounts.
- Do not expose one user's library to another user.
- Do not create a new, competing likes store without first auditing the current implementation.

## 7. Downloads & Offline Storage Page

### Purpose
Show tracks the user has saved for offline access and communicate download status clearly.

### Layout
- Header titled **Downloads** or **Offline Storage**, consistent with the existing app naming.
- Storage summary or download count only when supported by reliable data.
- Filter tabs or controls such as All, Downloaded, and In Progress only when those states exist in the implementation.
- Track rows with artwork, title, artist, duration, download status, and relevant actions.
- Empty state that explains how to download music.
- Confirmation UI for destructive remove/delete actions.
- Keep global player controls visible.

### Behavior
- Use the existing downloads context/API/database and preserve its source of truth.
- Download action must reflect the real capabilities and legal/technical constraints of the current music provider.
- Clearly distinguish metadata saved in the library from actual playable offline audio files.
- Never label a track “Available offline” unless the app can genuinely play it without network access.
- Show progress, completion, failure, retry, and cancellation only if supported.
- Removing a download should update the UI and persist the change. Ask for confirmation when the action is destructive.
- Keep downloads synchronized with existing backend and local state according to the current architecture.
- Do not claim storage usage in MB/GB unless it can be calculated accurately.
- If true offline audio is not currently implemented, present the available state honestly and report the backend/storage limitation rather than faking offline playback.

## 8. Track Component Consistency
Use or refactor a shared track row/card component where appropriate. Across all pages:
- Artwork dimensions and corner radius are consistent.
- Track title is visually primary; artist and metadata are secondary.
- Active/playing track state is visible.
- Buttons have accessible labels and adequate hit targets.
- Overflow menus reuse existing actions.
- Long titles truncate gracefully without hiding controls.
- Missing artwork uses the existing fallback treatment.
- Avoid duplicating playback logic across pages.

## 9. Playback Integration
- Reuse the existing player context and audio element.
- Do not instantiate a separate audio player per page.
- Selecting a track should preserve queue/current-track behavior already established by the app.
- Play/pause state must stay synchronized with the global player bar.
- Handle unavailable streams and rejected playback with a visible, recoverable error.
- Do not change stream URL construction or provider logic without diagnosing the current implementation first.

## 10. Engineering Requirements
- Follow the repository's current framework, TypeScript/JavaScript conventions, styling system, and component patterns.
- Avoid introducing new dependencies unless needed and justified.
- Keep API calls in the existing service layer.
- Keep components focused and reusable.
- Use stable keys for track lists.
- Handle loading, empty, error, and success states.
- Prevent duplicate requests and stale asynchronous results.
- Ensure keyboard accessibility for search, tabs, menus, and dialogs.
- Do not expose API keys or secrets in frontend code.
- Preserve environment-variable conventions and production deployment compatibility.

## 11. Acceptance Criteria

### Shared shell
- [ ] All three pages share the existing sidebar, navigation, and player bar.
- [ ] Current route is clearly highlighted.
- [ ] Layout has no unwanted horizontal overflow at supported screen sizes.

### Search & Browse
- [ ] Search uses the real existing service.
- [ ] Loading, no-results, and error states are implemented.
- [ ] Clicking a result uses the existing playback flow.
- [ ] Browse cards and filters work if displayed.

### Liked Songs
- [ ] Only actual liked tracks are displayed.
- [ ] Count reflects the current data.
- [ ] Like/unlike changes persist and synchronize.
- [ ] Play and shuffle use the liked track collection.
- [ ] Empty and error states are distinct.

### Downloads
- [ ] Download state reflects actual stored/downloaded data.
- [ ] Offline availability is never falsely claimed.
- [ ] Remove/retry/cancel controls work when offered.
- [ ] Destructive actions are confirmed where appropriate.
- [ ] Storage figures are accurate or omitted.

### Quality
- [ ] No mock data replacing production data.
- [ ] No regressions to login, playlists, player, search API, likes, or downloads.
- [ ] No new console errors or unhandled promise rejections.
- [ ] Build/lint/test commands available in the project run successfully, or any pre-existing failures are reported clearly.
- [ ] Desktop, tablet, and mobile layouts are checked.

## 12. Implementation Plan
1. **Audit:** Map current routes, shared shell, player, search, likes, and download data flow.
2. **Design foundations:** Align colors, spacing, surfaces, track rows, and responsive layout with the references.
3. **Search & Browse:** Implement UI and wire it to the existing search service.
4. **Liked Songs:** Implement the library view and connect it to existing liked-song state.
5. **Downloads:** Implement download/offline status UI based on verified capabilities.
6. **Validation:** Test interactions, loading/error/empty states, persistence, responsive layouts, and production build.

## 13. Antigravity Execution Prompt
Read this document completely and inspect every `code.html` and `screen.png` inside the supplied Stitch ZIP. Audit the existing WaveX repository before changing files. Implement Search & Browse, Liked Songs, and Downloads & Offline Storage in the existing application, matching the references' dark cyan/teal visual style. Reuse existing components, APIs, contexts, authentication, and player logic. Do not build a standalone demo, introduce fake catalogue data, or claim offline functionality that is not implemented. Work incrementally, test each page, preserve all unrelated functionality, and finish with a concise report of files changed, behavior implemented, tests run, and any backend limitations.
