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

Set them globally with `:root { --ls-duration: 1s; }`, or inline per element with `style="--ls-duration: 300ms"`. This works identically on both paths (native and fallback), with no JS involved.

### Available animations (`data-ls="..."`)

`fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-right`, `fade-up-left`, `fade-down-right`, `fade-down-left`, `zoom-in`, `zoom-out`

### `data-ls-once`

- (omitted or `"true"`): the default. Animates once on the fallback path; on the native path it still mirrors (see the note above).
- `"false"`: on the fallback path, it also animates in reverse; no effect on the native path (which always mirrors).

### `window.LeisureScroll.refresh(root?)`

A no-op on the native path (CSS selectors pick up new elements automatically). On the fallback path, call it after dynamically inserting `[data-ls]` elements into the DOM (AJAX, infinite scroll) so the IntersectionObserver starts tracking them. The optional `root` is the container to search for new elements (default: the whole document).

## Performance in brief

- Only `opacity`/`transform` are animated (compositor-only), never layout-triggering properties.
- `will-change` is removed after the "once" animation on the fallback path (JS, `transitionend`); on the native path it stays permanently, since the element can animate again at any time (scrolling back).
- `prefers-reduced-motion: reduce` is respected on both paths, in CSS and JS.

## Next step

WordPress plugin: shortcode/block attributes map directly to `data-ls`, `data-ls-once` and the `--ls-*` custom properties.
