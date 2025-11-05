# JWST Deep Sky Explorer - AI Coding Instructions

## Project Overview
This is a React + TypeScript application built with GitHub Spark framework that creates an interactive cosmic timeline explorer for James Webb Space Telescope (JWST) imagery. Users journey through space and time by exploring objects at different distances, understanding that looking deeper into space means looking back in time.

## Architecture Patterns

### GitHub Spark Framework Integration
- Uses `@github/spark` as the core framework with hooks like `useKV` for persistent storage
- Spark-specific Vite plugins are required: `sparkPlugin()` and `createIconImportProxy()`
- **Critical**: Never remove the Spark Vite plugins marked with "DO NOT REMOVE" comments
- Entry point imports `@github/spark/spark` in `src/main.tsx`

### Component Structure
- **UI Components**: Located in `src/components/ui/` - these are Radix UI primitives wrapped with Spark's `data-slot` pattern
- **Feature Components**: Main app components in `src/components/` follow domain-driven organization
- **Multi-Tab Architecture**: App uses nested tabs - main navigation (explore/anatomy/trajectory/metrics) and sub-tabs (all/favorites)

### Key Data Flow Patterns
1. **NASA API Integration**: `src/lib/nasa-api.ts` fetches real JWST data and enriches it with distance/lookback time from hardcoded mapping
2. **Distance-Based Timeline**: Images sorted by distance (light-years) to create cosmic time progression
3. **Persistent Favorites**: Uses Spark's `useKV` hook for client-side persistence across sessions

## Development Workflow

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build with TypeScript + Vite 
npm run lint         # ESLint validation
npm run preview      # Preview production build
npm run kill         # Kill process on port 5000 (Linux/Mac)
```

### Icon Usage Convention
- **Phosphor Icons**: Primary icon library (`@phosphor-icons/react`) for feature components
- **Lucide Icons**: Used only in shadcn/ui components and error boundaries
- Spark's icon proxy handles imports automatically - use direct imports like `import { Heart } from '@phosphor-icons/react'`

## Critical Integration Points

### Tailwind + Spark Theming
- Custom theme in `theme.json` loads into Tailwind config
- Spark's CSS variables system in `src/styles/theme.css`
- Components use `data-slot` attributes for Spark styling hooks

### Error Boundaries & Development
- Production uses custom ErrorFallback component with user-friendly messaging  
- Development mode rethrows errors to show Vite's detailed error overlay
- Sonner toast notifications for runtime errors (NASA API failures, etc.)

### State Management Patterns
- Local component state for UI interactions
- `useKV` for persistent data (favorites list)
- Props drilling for shared state (images, filters) - no global state library

## Project-Specific Conventions

### File Organization
- `@/` alias points to `src/` directory
- Types centralized in `src/lib/types.ts`
- Data files (telescope components, trajectory data) in `src/lib/*-data.ts`
- Educational content in `src/lib/educational-tooltips.ts`

### Component Naming & Structure
- Feature components use PascalCase with descriptive names (e.g., `TelescopeAnatomy`, `ImageDetailDialog`)
- UI components follow shadcn/ui conventions with compound patterns (e.g., `Card`, `CardHeader`, `CardContent`)
- All components use TypeScript with explicit interface definitions

### Visual Design System
- Space/astronomy theme with cosmic gradients and dark backgrounds
- Radix UI primitives provide consistent interaction patterns
- Framer Motion for physics-based animations (deployment sequence, component transitions)
- Charts use Recharts with custom theming integration

### Known Enhancement Areas
- **3D Components**: The `Telescope3D` component and related 3D visualizations are basic implementations that need significant detail and enhancement. Current 3D views lack visual fidelity and interactive depth expected for a space telescope explorer.

## Key Files for Context
- `src/App.tsx` - Main application shell with tab navigation
- `src/lib/nasa-api.ts` - API integration and distance mapping logic
- `src/components/Timeline.tsx` - Core cosmic timeline component
- `PRD.md` - Complete product requirements and design rationale
- `vite.config.ts` - Build configuration with Spark plugins