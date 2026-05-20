# Aether Web Fonts

## Current

`Aether-Book.woff2` — Aether Book (static, weight 400)
- Latest export: 2026-05-07
- Includes T right-side tightening (RSB 55 → 35)
- 56 glyphs (uppercase, lowercase, space, period, comma, hyphen)

`Aether-Variable.woff2` — Identical to Book (backward-compat alias)

## CSS

```css
@font-face {
  font-family: 'Aether';
  src: url('/fonts/Aether-Book.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## Roadmap

- Phase 1 (now): Book static (current)
- Phase 1.5: Light/Regular/Medium/Bold/Black static instances
- Phase 2: Variable Font (wght 50-950) — pending Ultra master compatibility
