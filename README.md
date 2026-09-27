# LeisureScroll

A hybrid scroll-reveal library. It features two execution paths and selects the best one automatically without requiring any configuration:

1. **Native CSS scroll-driven animations** (`animation-timeline: view()`) — On browsers supporting this feature, the entire animation is handled directly by the browser engine with zero JavaScript runtime overhead (0 KB JS execution).
2. **Fallback via `IntersectionObserver`** — On browsers lacking scroll-timeline support, JS handles adding/removing classes while the visual effect relies on CSS `transition` (no frame-by-frame JS animations).

Path selection is handled using `@supports (animation-timeline: view())` in CSS and `CSS.supports(...)` in JavaScript. The exact same condition is checked in both places to ensure they stay in sync.

## Current Browser Support (Important for Real-World Usage)

`animation-timeline: view()` is still listed as "Limited availability" on MDN: it works on **Chrome/Edge 115+**, while **Firefox and Safari do not support it yet**. This means that today, a large percentage of visitors (all Firefox/Safari users) will fall back to the **observer-based path** instead of native scroll timelines. This will naturally shift over time as browser support expands websites automatically transition to the native path as browsers add support, requiring no code updates.

## Intentional Behavioral Differences Between Paths

This is a conscious design choice, not a bug:

- **Native path (Chrome/Edge):** The animation is directly tied to the scroll position (`view()` timeline). Scrolling back up over an element plays the animation in reverse ("mirroring" effect). Disabling this would require JS intervention, sacrificing the 0 KB JS runtime advantage.
- **Fallback path (Firefox, Safari, older browsers):** Behaves like traditional AOS elements animate **once** when entering the viewport for the first time and remain visible afterward (`once: true` by default). If you want elements to mirror on the fallback path as well (animating every time they are scrolled past), set `data-ls-once="false"` on the element.

**Conclusion:** A site will feel slightly more dynamic on Chrome (with native mirroring) and behave like a classic single-pass reveal on Firefox/Safari. This tradeoff preserves zero-overhead performance on modern browsers.

## Usage

```html
<link rel="stylesheet" href="leisurescroll.css">
<script src="leisurescroll.js"></script>