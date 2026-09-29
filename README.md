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
- **Fallback path (Firefox, Safari, older browsers):** Now mirrors this by default (`once: false`) — elements reset and re-animate every time they're scrolled past, matching the native path's behavior. Set `data-ls-once="true"` on an element if you want the old AOS-style single-shot reveal instead (animate once, then stay visible).

**Conclusion:** Both paths now behave the same way by default — elements re-animate on repeated scroll past. Use `data-ls-once="true"` per element on the fallback path where a one-time reveal is preferred (e.g. above-the-fold hero content you don't want replaying).

## Usage

```html
<link rel="stylesheet" href="leisurescroll.css" />
<script src="leisurescroll.js"></script>
```

```html
<div data-ls="fade-up">Content</div>
<div data-ls="zoom-in" style="--ls-duration: 600ms; --ls-delay: 200ms;">
    Content
</div>
<div data-ls="fade-left" data-ls-once="false">
    Animates every time (fallback path only)
</div>
```

There is no JS initialization; everything works automatically as soon as the script loads (on `DOMContentLoaded`, or immediately if the DOM is already ready). The script can go in `<head>`, before `</body>`, or use `defer`; it makes no difference.

### Global settings (CSS custom properties, on `:root` or per element)

| Property        | Default                         | Description                                             |
| --------------- | ------------------------------- | ------------------------------------------------------- |
| `--ls-duration` | `0.8s`                          | duration                                                |
| `--ls-delay`    | `0s`                            | delay                                                   |
| `--ls-easing`   | `cubic-bezier(0.25, 1, 0.5, 1)` | easing curve                                            |
| `--ls-distance` | `40px`                          | how far the element travels for fade-up/down/left/right |
| `--ls-scale`    | `0.85`                          | starting scale for zoom-in/out                          |
| `--ls-blur`     | `10px`                          | starting blur for the `*-blur` variants                 |
| `--ls-range-start` | `entry 15%`                  | native path only — when the reveal starts along the scroll timeline |
| `--ls-range-end`   | `entry 75%`                  | native path only — when the reveal finishes along the scroll timeline |

Set them globally with `:root { --ls-duration: 1s; }`, or inline per element with `style="--ls-duration: 300ms"`. `--ls-duration`/`--ls-delay` only affect the fallback path (there's no clock on a scroll timeline); `--ls-range-start`/`--ls-range-end` only affect the native path. Everything else works identically on both paths, with no JS involved.

The default range (`entry 15%` → `entry 75%`) was picked over the library's initial `entry 10% / cover 35%` mix because mixing `entry` and `cover` phases as start/end could stretch the reveal across a much larger, unpredictable scroll distance depending on element height — it tended to either finish before it was noticeable, or drag on well past when the element was already fully visible. Using `entry` alone for both ends keeps the whole reveal contained to the element's entrance, and starting at 15%/ending at 75% (instead of 0%/100%) avoids both the "barely there" flicker of triggering right at the edge and the abrupt snap of completing exactly as it's already fully on screen.

### Available animations (`data-ls="..."`)

`fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-right`, `fade-up-left`, `fade-down-right`, `fade-down-left`, `zoom-in`, `zoom-out`, `fade-blur`, `fade-up-blur`, `zoom-in-blur`

The `*-blur` variants combine the same opacity/transform reveal with a `filter: blur()` that resolves to `blur(0)`. Note `filter` is not as cheap as `opacity`/`transform` — it's still compositor-friendly on its own, but avoid combining it with heavy box-shadows or backdrop-filters on the same element in large numbers. Only three blur variants ship out of the box (as examples); adding more follows the same pattern — pick a base animation, add `filter: blur(var(--ls-blur))` to its "off" state and `filter: blur(0)` to its "on" state, in both the native `@keyframes` and the fallback `[data-ls="..."]`/`.ls-animated` rules.

### `data-ls-once`

- (omitted or `"false"`): the default. Animates every time the element scrolls in and out of view, on both paths (the fallback path re-triggers via `IntersectionObserver`; the native path mirrors automatically).
- `"true"`: fallback path only — animates once on first entry and stays visible after that (classic AOS behavior). Has no effect on the native path, which always mirrors.

### `window.LeisureScroll.refresh(root?)`

A no-op on the native path (CSS selectors pick up new elements automatically). On the fallback path, call it after dynamically inserting `[data-ls]` elements into the DOM (AJAX, infinite scroll) so the IntersectionObserver starts tracking them. The optional `root` is the container to search for new elements (default: the whole document).

## Performance in brief

- Only `opacity`/`transform` are animated (compositor-only), never layout-triggering properties.
- `will-change` is removed after the "once" animation on the fallback path (JS, `transitionend`); on the native path it stays permanently, since the element can animate again at any time (scrolling back).
- `prefers-reduced-motion: reduce` is respected on both paths, in CSS and JS.

## Next step

WordPress plugin: shortcode/block attributes map directly to `data-ls`, `data-ls-once` and the `--ls-*` custom properties.
