# Maintenance Guide

## Content Updates

All site content lives in `lib/content.ts`. This is the single source of truth.

### Adding features/glossary terms/FAQ
1. Add the entry to the relevant array in `lib/content.ts`
2. Run `bun run test` to verify data contracts
3. Run `bun run build` to verify static generation

### Updating statistics
The `heroStats` and `credibilityHighlights` arrays contain claims that should be re-verified when the upstream `mcp_agent_mail_rust` repo changes significantly. Each `evidenceBackedClaim` has a `source` field pointing to its verification origin.

## Visualization Components

All viz components live in `components/viz/` and follow this pattern:
- Use `VizSurface`, `VizControlButton`, `useVizReducedMotion` from `viz-framework.tsx`
- Must be dynamically imported with `{ ssr: false }`
- Wrapped in `SyncContainer` + `Suspense` on pages
- Must respect `prefers-reduced-motion`

### Adding a new visualization
1. Create `components/viz/<name>-viz.tsx` using the viz-framework primitives
2. Add dynamic import to the target page
3. Wrap in `SyncContainer` + `Suspense`

## Testing

### Unit tests
```bash
bun run test          # Run once
bun run test:watch    # Watch mode
```
Tests in `__tests__/` use Vitest + @testing-library/react.

### E2E tests
```bash
bun run test:e2e      # Playwright (requires build first)
```
Tests in `e2e/` use Playwright with diagnostics fixtures from `e2e/fixtures.ts`.

### CI
GitHub Actions workflow at `.github/workflows/test.yml` runs unit + E2E on push/PR to master.

## Build/Deploy

```bash
bun run build    # Production build
bun run start    # Serve production build locally
```

All pages are statically generated except OG/Twitter image routes.

## Source-Truth Hygiene

- `lib/content.ts` is the ONLY place for site copy, data, and structured metadata
- JSON-LD generators (`getWebSiteJsonLd`, `getSoftwareApplicationJsonLd`, etc.) are in content.ts
- Navigation model is defined in `navItems` in content.ts
- Never hardcode copy in components — import from content.ts
