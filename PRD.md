# Planning Guide - JWST Deep Sky Explorer

A browser-based exploration tool that transforms James Webb Space Telescope imagery into an interactive cosmic timeline, allowing users to journey through space and time by exploring objects at different distances (and thus, different ages of the universe).

**Experience Qualities**:
1. **Awe-Inspiring** - Users should feel the scale of cosmic time and distance, with each image representing light that traveled millions or billions of years to reach us
2. **Intimate Discovery** - Despite the vastness, the interface should feel personal and contemplative, like leafing through a cosmic photo album with detailed stories
3. **Scientifically Grounded** - Every visualization and interaction should respect the real data, distances, and scientific context of these observations

**Complexity Level**: Light Application (multiple features with basic state)
  - The app fetches real NASA JWST data, presents it in an innovative timeline/distance-based interface, allows filtering and detailed exploration, and persists user favorites

## Essential Features

### 1. Cosmic Timeline/Distance Explorer
- **Functionality**: Display JWST images organized by distance from Earth (which correlates to looking back in time - "lookback time")
- **Purpose**: Help users understand that looking deeper into space means looking back in time, making the abstract concept of cosmic distance tangible
- **Trigger**: Loads automatically on app start with a curated set of JWST images
- **Progression**: App loads → Fetches NASA API data → Displays images in horizontal scrollable timeline sorted by distance → User scrolls through cosmic history → Selects image for details
- **Success criteria**: Users can smoothly scroll through images, see distance/time labels, and understand they're journeying through cosmic history

### 2. Deep Dive Image Detail View
- **Functionality**: Show full-resolution image with scientific metadata, description, observation details, and the ability to zoom/pan
- **Purpose**: Provide rich context about what they're seeing - what the object is, why it's significant, how far away, and what Webb revealed
- **Trigger**: User clicks/taps on any image in the timeline
- **Progression**: User selects image → Modal/panel opens → Full image loads with metadata → User reads description, views technical details → Can zoom into image → Can favorite the image → Closes to return to timeline
- **Success criteria**: Image loads at high quality, metadata is readable and informative, zoom feels smooth, favorites persist

### 3. Filter & Discovery Tools
- **Functionality**: Filter JWST images by category (galaxies, nebulae, exoplanets, stars), observation instrument (NIRCam, MIRI, etc.), or distance range
- **Purpose**: Allow users to focus on their interests while still maintaining the timeline concept
- **Trigger**: User interacts with filter controls in the header/sidebar
- **Progression**: User opens filters → Selects category/instrument/distance range → Timeline updates with filtered results → User explores filtered set → Can clear filters to see all
- **Success criteria**: Filters respond instantly, timeline smoothly updates, clear visual feedback on active filters

### 4. Personal Collection
- **Functionality**: Users can favorite images and access their curated collection
- **Purpose**: Allow users to build their own cosmic gallery of favorites for later viewing
- **Trigger**: User clicks favorite/heart icon on any image
- **Progression**: User favorites image → Visual confirmation → Can toggle to "My Collection" view → Sees all favorited images → Can unfavorite → Returns to main timeline
- **Success criteria**: Favorites persist across sessions using useKV, collection view shows all favorited images with same detail capabilities

### 5. Educational Tooltips
- **Functionality**: Interactive information tooltips throughout the app explaining JWST instruments, cosmic distances, and astronomical concepts
- **Purpose**: Transform the app into an educational experience, helping users understand what they're seeing and how JWST works
- **Trigger**: User hovers over or taps info icons next to instruments, distances, object types, and key features
- **Progression**: User encounters info icon → Hovers/taps → Tooltip appears with title, description, and detailed explanation → User learns → Continues exploring with enhanced understanding
- **Success criteria**: Tooltips appear smoothly, content is scientifically accurate yet accessible, users gain deeper understanding of JWST capabilities and cosmic phenomena

### 6. Telescope Anatomy Explorer
- **Functionality**: Interactive exploration of JWST's components with detailed specifications, technical information, explanations of each part's role, plus animated deployment sequence
- **Purpose**: Help users understand the engineering marvel behind the images - what each component does and why it matters, and how this complex spacecraft unfolded in space
- **Trigger**: User navigates to "Telescope Anatomy" tab in main navigation
- **Progression**: User selects anatomy view → Can switch between 3D visualization, grid view, or deployment sequence → In deployment mode: Watches/controls animated sequence of JWST unfolding over 14 days → Sees step-by-step animations with technical details → Learns about critical deployment moments → In other modes: Sees categorized components → Filters by category → Clicks component → Detail modal opens
- **Success criteria**: All major components are represented, deployment sequence shows all 9 critical steps with accurate timing and visuals, technical details are accurate yet accessible, users understand both the parts and the incredible deployment process

### 7. Mission Timeline & Orbital Path
- **Functionality**: Visual timeline showing JWST's journey from launch to its current position at L2, plus future mission phases
- **Purpose**: Help users understand where JWST is located, how it got there, and what its orbital characteristics mean for observations
- **Trigger**: User navigates to "Mission & Orbit" tab in main navigation
- **Progression**: User selects trajectory view → Sees chronological timeline of mission milestones → Reads L2 orbit facts → Clicks any event → Detail modal shows full context → User understands JWST's unique orbital position and mission history
- **Success criteria**: Timeline shows past, present, and future events clearly, L2 orbital characteristics are explained accessibly, users understand why the telescope is positioned where it is

## Edge Case Handling

- **API Failures**: Display friendly error message with retry option, show cached/default images if available
- **Missing Metadata**: Gracefully handle incomplete NASA data by showing available fields and hiding empty ones
- **Slow Image Loading**: Show skeleton loaders and progressive image loading for large JWST files
- **No Favorites Yet**: Show empty state with encouragement to explore and favorite images
- **Filter Returns No Results**: Clear message indicating no matches with option to reset filters
- **Very Long Distances**: Format astronomical distances appropriately (light-years, parsecs) with scientific notation when needed
- **Component Specifications**: All technical specifications sourced from official NASA/ESA JWST documentation for accuracy
- **Mission Timeline**: Dates and events verified against official mission records, future dates marked as estimates
- **Deployment Sequence Animation**: Handle play/pause/skip controls gracefully, show progress indicator, allow direct navigation to any step

## Design Direction

The design should evoke a sense of wonder and scientific precision - elegant, spacious, and contemplative like a planetarium experience, with a dark cosmic theme that lets the vibrant Webb images shine. The interface should feel minimal and unobtrusive, stepping back to let the imagery take center stage, while providing rich information when requested.

## Color Selection

**Custom palette** inspired by deep space and the James Webb telescope's signature infrared imagery - deep cosmic blacks, rich nebula purples/oranges, and ethereal blues that echo Webb's false-color visualizations.

- **Primary Color**: Deep Space Violet `oklch(0.35 0.15 290)` - Represents the infrared/deep space theme of JWST, used for primary actions and brand identity
- **Secondary Colors**: 
  - Nebula Orange `oklch(0.65 0.20 50)` - Echoes the warm tones in Webb's imagery, used for secondary highlights
  - Cosmic Teal `oklch(0.55 0.12 200)` - Represents distant blue-shifted objects, supporting element accents
- **Accent Color**: Starlight Gold `oklch(0.75 0.15 85)` - Attention-grabbing highlight for favoriting and key CTAs, suggests distant starlight
- **Foreground/Background Pairings**:
  - Background (Deep Black `oklch(0.12 0.02 290)`): Foreground with Light Gray `oklch(0.95 0.01 290)` - Ratio 16.8:1 ✓
  - Card (Dark Void `oklch(0.18 0.03 290)`): Foreground with Light Gray `oklch(0.95 0.01 290)` - Ratio 14.2:1 ✓
  - Primary (Deep Space Violet): Foreground with White `oklch(0.99 0 0)` - Ratio 7.1:1 ✓
  - Secondary (Nebula Orange): Foreground with Deep Black `oklch(0.12 0.02 290)` - Ratio 5.2:1 ✓
  - Accent (Starlight Gold): Foreground with Deep Black `oklch(0.12 0.02 290)` - Ratio 6.8:1 ✓
  - Muted (Charcoal `oklch(0.25 0.02 290)`): Foreground with Light Gray `oklch(0.85 0.01 290)` - Ratio 9.5:1 ✓

## Font Selection

The typefaces should convey scientific credibility while maintaining elegance and readability - clean, modern sans-serifs that don't compete with the imagery but provide clear hierarchy and legibility against dark backgrounds.

- **Primary Font**: **Inter** - Clean, highly legible, with excellent rendering at all sizes, perfect for both UI and scientific data
- **Monospace Font**: **JetBrains Mono** - For displaying precise scientific measurements, coordinates, and technical specifications

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold / 32px / -0.02em letter spacing / 1.1 line height
  - H2 (Section Headers): Inter Semibold / 24px / -0.01em letter spacing / 1.2 line height
  - H3 (Image Titles): Inter Medium / 18px / normal letter spacing / 1.3 line height
  - Body (Descriptions): Inter Regular / 15px / normal letter spacing / 1.6 line height
  - Small (Metadata Labels): Inter Medium / 13px / 0.01em letter spacing / 1.4 line height
  - Caption (Distance/Time): Inter Medium / 12px / 0.02em letter spacing / 1.3 line height
  - Mono (Technical Data): JetBrains Mono Regular / 14px / normal letter spacing / 1.5 line height

## Animations

Animations should feel like smooth camera movements through space - gentle, purposeful, and never rushed. The cosmic theme calls for floating, drifting movements that suggest weightlessness and vast distances, with transitions that feel like traveling between celestial objects.

- **Purposeful Meaning**: Motion reinforces the concept of traveling through space and time - images drift in like distant objects coming into view, the timeline scrolls with momentum suggesting vast distances, deployment animations show the intricate choreography of unfolding in space
- **Hierarchy of Movement**: 
  - Primary: Timeline scroll, image transitions, and deployment sequence animations (fluid, physics-based)
  - Secondary: Card hover states and zoom interactions (subtle scale and glow)
  - Tertiary: Filter updates and favorites (quick confirmations)
  - Deployment: Each step animates in with smooth transitions, SVG elements unfold/extend to match real deployment mechanics

## Component Selection

- **Components**:
  - **Card**: For each image in the timeline and detail views, with hover effects that suggest interactivity - subtle glow/scale on hover
  - **Dialog**: For full-screen image detail view with metadata overlay and component/event detail modals
  - **ScrollArea**: For the horizontal timeline and vertical metadata sections, custom-styled for the space theme
  - **Button**: For filters, favorites, and actions - with Primary (violet) for main actions, Secondary (ghost/outline) for filters
  - **Tabs**: For switching between "Explore All" and "My Collection" views, plus main navigation between Image Explorer, Telescope Anatomy, and Mission & Orbit
  - **Badge**: For displaying observation instruments (NIRCam, MIRI, etc.), object types, and component categories
  - **Separator**: For dividing metadata sections with subtle cosmic-themed styling
  - **Skeleton**: For loading states that suggest the image emerging from darkness
  - **Select**: For filter dropdowns (instrument, category) with custom dark styling
  - **Slider**: For distance range filtering, suggesting travel through the cosmos

- **Customizations**:
  - Custom horizontal timeline component wrapping ScrollArea with physics-based momentum scrolling
  - Custom image zoom/pan component for the detail view (possibly using framer-motion)
  - Custom distance visualization markers along the timeline axis showing cosmic milestones
  - Nebula-like gradient backgrounds using CSS for cards and overlays

- **States**:
  - **Buttons**: Default (violet/ghost), Hover (brighter with subtle glow), Active (pressed with deeper shade), Focused (ring in accent gold), Disabled (muted opacity)
  - **Cards**: Default (subtle border), Hover (lifted with glow, slight scale), Active/Selected (accent border, maintained glow)
  - **Images**: Loading (skeleton with shimmer), Loaded (fade in), Error (placeholder with retry option)

- **Icon Selection**:
  - **Heart/HeartFill** (phosphor): For favoriting images
  - **MagnifyingGlassPlus/Minus** (phosphor): For zoom controls
  - **Funnel** (phosphor): For filter controls
  - **X** (phosphor): For closing modals and clearing filters
  - **Planet, Spiral, Sparkle, Star** (phosphor): For category filters and navigation
  - **ArrowLeft** (phosphor): For back navigation
  - **Info** (phosphor): For educational tooltips explaining instruments, distances, and concepts
  - **Cube** (phosphor): For telescope anatomy section
  - **Cpu, Eye, Lightning** (phosphor): For component categories in anatomy view
  - **Rocket, Globe, CircleDashed** (phosphor): For mission timeline and orbit visualization
  - **Play, Pause, SkipForward, SkipBack, ArrowCounterClockwise** (phosphor): For deployment sequence animation controls
  - **CheckCircle** (phosphor): For completed deployment steps

- **Spacing**:
  - Container padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
  - Card padding: `p-4` (16px)
  - Gap between timeline items: `gap-4` (16px)
  - Section spacing: `space-y-6` (24px) for major sections
  - Inline element spacing: `gap-2` (8px) for badges, buttons

- **Mobile**:
  - Timeline switches from horizontal to vertical scrolling on mobile
  - Filter controls collapse into a drawer/sheet on mobile
  - Image detail view becomes full-screen on mobile with swipe to dismiss
  - Metadata displayed below image instead of side-by-side on small screens
  - Touch-optimized zoom gestures using pinch-to-zoom
  - Anatomy grid switches from 3 columns to 1-2 columns on mobile
  - Mission timeline maintains vertical orientation with adjusted spacing on mobile
  - Main navigation tabs stack or scroll horizontally on narrow screens

## NASA API Integration Strategy

### Available NASA APIs for JWST:
1. **NASA Images and Video Library API** - Contains JWST imagery with metadata, searchable by mission/instrument
2. **NASA APOD (Astronomy Picture of the Day) API** - Occasionally features JWST images
3. **STScI MAST (Mikulski Archive for Space Telescopes)** - Official JWST science archive with detailed observation data

### Implementation Approach:
- Primary: Use NASA Images API (`https://images-api.nasa.gov/search?q=webb telescope` or `jwst`) to get curated, public-friendly JWST images with descriptions
- Enhance: Cross-reference with MAST for technical observation details when available
- Fallback: Include APOD API to catch featured JWST images
- Data extracted: Image URLs, titles, descriptions, observation dates, instruments used, target objects, coordinates, distances (when available in description/metadata)
- Distance/lookback time: Parse from descriptions or maintain a curated dataset of well-known JWST targets with distances

### Unique Innovation:
**Distance-as-time interface** - Most JWST galleries show images by date or alphabetically. This app organizes by *distance from Earth*, helping users understand that deeper images show younger universe. The timeline becomes a time machine, with the furthest images showing galaxies as they appeared 13+ billion years ago, shortly after the Big Bang.
