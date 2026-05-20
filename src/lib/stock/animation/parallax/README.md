# ParallaxStack

Vertical image-stack parallax modelled after [vision.avatr.com](https://vision.avatr.com/)
(`home_para → home_emo → home_sld` handoff).

## Behaviour

For each transition between two consecutive layers:

- **Previous layer** stays in place and scales slightly larger
  (`transform-origin: bottom center`, `scale: 1 → 1 + scaleAmount`).
- **Next layer** is already positioned full-screen behind. Only its
  **visible area** grows from bottom → top via `clip-path: inset(top% 0 0 0)`
  (`100% → 0%`). The image itself does not move.
- All transitions happen inside a single pinned `ScrollTrigger`.

The result feels like the next image is "rising over" the previous one
without any actual translation — only its reveal mask opens.

## Dependencies

- `gsap` and `gsap/ScrollTrigger` (lazy-imported at mount)
- Svelte 5 (uses `$props`, `$state`, `bind:this`)

No project-specific design tokens; safe to drop into any SvelteKit project.

## Props

| Prop                  | Type                  | Default   | Description                                                                                |
|-----------------------|-----------------------|-----------|--------------------------------------------------------------------------------------------|
| `layers`              | `ParallaxLayer[]`     | required  | Array of `{ src, alt? }`. Need ≥ 2.                                                       |
| `transitionDistance`  | `string`              | `'200%'`  | Scroll length per transition (e.g. `'150%'`, `'250%'`). Total pin distance = `(N-1) × this`. |
| `scaleAmount`         | `number`              | `0.18`    | How much each previous layer grows. `0.18` ≈ `scale 1 → 1.18`.                              |
| `background`          | `string`              | `'#000'`  | Background color while images load.                                                        |
| `debug`               | `boolean`             | `false`   | Show HUD with progress + active transition index.                                          |

```ts
export type ParallaxLayer = {
  src: string;
  alt?: string;
};
```

## Usage

```svelte
<script lang="ts">
  import ParallaxStack from '$lib/stock/animation/parallax/ParallaxStack.svelte';
</script>

<ParallaxStack
  layers={[
    { src: '/images/1.jpg', alt: 'Mountain at dawn' },
    { src: '/images/2.jpg', alt: 'Highway' },
    { src: '/images/3.jpg', alt: 'City at night' }
  ]}
  transitionDistance="200%"
  scaleAmount={0.18}
  background="#000a26"
  debug={false}
/>
```

## Notes

- Pin spacing is automatic. Place the component anywhere in the page; it
  will reserve `(N - 1) × transitionDistance` of scroll length.
- For more elaborate handoffs (e.g. text fading over the stack, CTAs in
  the final layer), wrap the component or place children above it via
  `position: absolute` and your own `ScrollTrigger` timeline.
- `clip-path` + `backdrop-filter` is well-supported on modern Chromium /
  Safari / Firefox. On older browsers the next layer will simply appear
  fully revealed (graceful degradation).
