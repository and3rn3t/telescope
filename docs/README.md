# Documentation

This directory contains comprehensive documentation for the JWST Deep Sky
Explorer project.

## Files

### [BRANDING-GUIDELINES.md](./BRANDING-GUIDELINES.md)

**Complete branding and design system guidelines** covering:

- **Brand Identity**: Scientific, contemplative, elegant personality
- **Color System**: Cosmic-inspired palette with accessibility standards
- **Typography**: Inter font stack with scientific hierarchy
- **Spacing**: Consistent 4px-based scale with responsive multipliers
- **Components**: Standardized UI patterns and states
- **Animation**: Physics-based cosmic motion principles
- **Implementation**: CSS custom properties and Tailwind integration

### [style-guide.html](./style-guide.html)

**Interactive style guide** demonstrating the branding guidelines in practice:

- Live color palette with OKLCH values
- Typography examples with sizing and spacing
- Component demonstrations with hover states
- Usage do's and don'ts
- Border radius and spacing visualizations

### Other Documentation

- [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md) - Domain configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup

## Design System Philosophy

Our design system reflects the cosmic journey through space and time, inspired
by:

- **James Webb's infrared imagery** - Deep space violets and nebula oranges
- **Scientific precision** - Clean typography and consistent spacing
- **Cosmic scale** - Spacious layouts that let imagery breathe
- **Accessibility** - High contrast ratios and semantic color usage

## Quick Reference

### Primary Colors

- **Deep Space Violet**: `oklch(0.35 0.15 290)` - Primary actions
- **Nebula Orange**: `oklch(0.65 0.20 50)` - Secondary highlights
- **Starlight Gold**: `oklch(0.75 0.15 85)` - Favorites & CTAs
- **Cosmic Black**: `oklch(0.145 0 0)` - Background
- **Starlight White**: `oklch(0.985 0 0)` - Primary text

### Typography Scale

- **H1**: 32px Inter Bold (-0.02em)
- **H2**: 24px Inter Semibold (-0.01em)
- **H3**: 18px Inter Medium
- **Body**: 16px Inter Regular (1.6 line-height)
- **Data**: Inter Mono for measurements

### Spacing Scale

- **Tight**: 4px (`space-y-1`)
- **Default**: 12px (`space-y-3`)
- **Loose**: 24px (`space-y-6`)
- **Extra Loose**: 48px (`space-y-12`)

### Border Radius

- **Buttons**: 6px (`rounded-md`)
- **Cards**: 8px (`rounded-lg`)
- **Dialogs**: 12px (`rounded-xl`)
- **Badges**: Full (`rounded-full`)

## Implementation

The design system is implemented using:

- **GitHub Spark Framework** - Theme variables and component slots
- **Tailwind CSS** - Utility classes and responsive design
- **Radix UI Colors** - Scientific color palette foundation
- **CSS Custom Properties** - Consistent theming tokens

All guidelines are production-ready and integrate seamlessly with the existing
codebase.
