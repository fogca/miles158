# PageTransition

Per-route overlay reveal for SvelteKit, modelled after
[jasminegunarto.com/break](https://jasminegunarto.com/break/) (Taxi.js style).

## Behaviour

- **Before navigation**: full-screen overlay clip-reveals **bottom → top**
  (`clip-path: inset(0 0 100%) → inset(0 0 0)`) while the route's label
  rises into view.
- **After navigation**: overlay clip-collapses **top → off**
  (`clip-path: inset(0) → inset(100% 0 0)`) and the label exits upward.

Each route can have its own label, background color, and foreground color.

## Dependencies

- `gsap` (lazy-imported at navigation time)
- `$app/navigation` (`beforeNavigate`, `afterNavigate`)
- Svelte 5 (uses `$state`, `$props`, `bind:this`)

## Usage

Drop it once in `+layout.svelte`, after the main content:

```svelte
<script lang="ts">
  import PageTransition from '$lib/stock/animation/page-transition/PageTransition.svelte';
  import type { TransitionConfig } from '$lib/stock/animation/page-transition/PageTransition.svelte';

  const transitions: Record<string, TransitionConfig> = {
    home:      { label: 'MILES 158',     bg: '#000a26', fg: '#e8f4f8' },
    about:     { label: 'ABOUT' },
    rental:    { label: 'CAR RENTAL' },
    community: { label: 'CLUB COMMUNITY' }
  };
</script>

<SiteHeader />
{@render children()}
<SiteFooter />

<PageTransition types={transitions} />
```

Route detection: the **first path segment** is used as the type key.
e.g. `/about/team` → `about`. Root `/` → `home`.

## Props

| Prop         | Type                                  | Default     | Description                              |
|--------------|---------------------------------------|-------------|------------------------------------------|
| `types`      | `Record<string, TransitionConfig>`    | `{}`        | Map of route key → `{ label, bg?, fg? }` |
| `defaultBg`  | `string`                              | `'#000a26'` | Fallback overlay background              |
| `defaultFg`  | `string`                              | `'#e8f4f8'` | Fallback overlay foreground              |
| `duration`   | `number`                              | `0.7`       | One-way overlay animation duration (s)   |

```ts
export type TransitionConfig = {
  label: string;
  bg?: string;
  fg?: string;
};
```

## Notes

- The overlay sits at `z-index: 9999` and is `pointer-events: none` when idle.
- Lazy-imports `gsap` only on first navigation, so it doesn't bloat the
  initial bundle.
- For ultra-flashy text reveals (per-letter stagger like the reference),
  wrap each character in a span and run a stagger tween. The single-label
  default keeps the bundle / CSS minimal.
