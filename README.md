# Infrastructure Command Console Portfolio

A heavy, visually striking portfolio website for infrastructure, networking, and security engineers, built with pure HTML, CSS, and JavaScript—no frameworks, no build tools, no external dependencies.

## Live Site

This site is deployed at: **https://rishabhdurugkar.me**

## Features

### Visual Design
- **Emperor Black/Grey Theme**: Professional dark palette optimized for readability
- **Interactive Canvas Engine**: Real-time GPU/Compute, Networking, and Security visualizations
- **Glass Morphism**: Subtle backdrop blur effects on surfaces
- **Smooth Animations**: Section reveals with Intersection Observer
- **Reduced Motion Support**: Respects user preferences for accessibility

### Technical Highlights
- **Zero Dependencies**: Pure vanilla JS, no frameworks or libraries
- **Performance Optimized**: 
  - Single canvas with merged rendering (≤120 primitives)
  - Debounced resize handlers
  - RequestAnimationFrame loop with lerp for smoothness
  - Cheap noise/shimmer effects instead of expensive composites
- **Accessibility First**:
  - Semantic HTML5
  - ARIA labels and roles
  - Keyboard navigation support
  - `prefers-reduced-motion` detection
- **Responsive**: Mobile-first design with device orientation support

### Pages

#### Index (Main Portfolio)
- Hero section with professional branding
- About section (first-person narrative)
- Experience timeline
- 6 detailed project cards (AI infrastructure focus)
- Education history with capstone project
- Certifications grid (in-progress and planned)
- Skills categorized by domain
- Contact section with social links

#### Timeline (JARVIS Console)
- **Command Panel**:
  - Real-time search filter
  - Quick jump-to-year buttons
  - Expand/collapse all controls
  - Compact/detailed view toggle
  - Focus mode (reduces background graphics)
  - System log with live updates
- **Timeline Content**:
  - Year-based organization (2021-2026)
  - Collapsible entries with smooth animations
  - Keyboard accessible
  - Professional milestone documentation

## Canvas Engine

The background canvas merges three infrastructure motifs:

1. **GPU/Compute**: Faint tile grid with heat shimmer effect (cheap noise)
2. **Networking/Fabric**: Dynamic node graph with packet pulses along edges
3. **Security/Defense**: Expanding radar rings with occasional ping blips

### Performance Features
- Mouse controls parallax and local activity radius
- Connections only rendered near cursor to limit cost
- Single requestAnimationFrame loop
- Target mouse position with lerp for smoothness
- Debounced resize (250ms)
- Mobile: light orientation influence via DeviceOrientation API
- `prefers-reduced-motion`: draws one static frame and stops

### Particle Budget
- Grid tiles: ~40-60 (sparse)
- Network nodes: 25 max
- Radar rings: 8 max
- **Total: ≤120 primitives**

## Customization Guide

### Personal Information

**In `index.html`:**
- Update `<title>` and meta tags (lines 5-6)
- Replace "Rishabh Durugkar" with your name (navbar, hero, footer)
- Modify hero subtitle with your credentials (line 35)
- Rewrite About section (lines 41-44)
- Update Experience entries (lines 50-93)
- Edit Projects (lines 99-265) with your own work
- Adjust Education (lines 271-291)
- Update Certifications (lines 297-325)
- Modify Skills by category (lines 331-387)
- Change contact links (lines 402-429)

**In `timeline.html`:**
- Update timeline entries with your career milestones (lines 82-261)
- Adjust year headers as needed

### Links and Resume
- GitHub: Line 402 in `index.html`
- LinkedIn: Line 410 in `index.html`
- Email: Line 418 in `index.html`
- Resume PDF: Line 426 (replace `#` with actual PDF URL)

### Branding
- **Primary Identity**: Change all instances of "Rishabh Durugkar"
- **Domain**: Update CNAME file with your custom domain
- **Tagline**: Modify "Infrastructure · Networking · Security Engineer"

### Colors
Edit CSS variables in `styles.css` (lines 8-15):
```css
:root {
    --bg: #050607;              /* Background */
    --surface: rgba(12, 13, 15, 0.72);  /* Glass surfaces */
    --surface2: rgba(18, 20, 23, 0.62); /* Secondary surfaces */
    --border: rgba(255, 255, 255, 0.10); /* Borders */
    --text: #E7E9EE;            /* Primary text */
    --muted: #A8AFBC;           /* Secondary text */
    --highlight: #D7DBE3;       /* Headings & highlights */
}
```

### Canvas Customization

**In `script.js`:**
- Particle count: Line 32 (`this.maxParticles = 120`)
- Grid tile size: Line 69 (`const tileSize = 80`)
- Network node count: Line 87 (`const nodeCount = ...`)
- Connection radius: Line 198 (`const connectionRadius = 200`)
- Radar ring count: Line 101 (`const ringCount = ...`)
- Animation speeds: Lines 113, 255 (ring speed, shimmer rate)

**Disable canvas entirely:**
```javascript
// In script.js, comment out line in init():
// new InfrastructureCanvas();
```

### Navigation Links
Add/remove sections by editing:
1. `index.html` navbar (lines 22-30)
2. Corresponding sections in main content
3. `styles.css` scroll offset if needed (line 27)

## Deployment

### GitHub Pages
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Set source to `main` branch root
4. Add custom domain via CNAME file (optional)

### Custom Domain
1. Create `CNAME` file with your domain:
   ```
   yourdomain.com
   ```
2. Configure DNS:
   - For apex domain: A records to GitHub IPs
   - For www: CNAME to `username.github.io`

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features used**:
  - CSS backdrop-filter (glass effect)
  - IntersectionObserver API
  - Canvas 2D rendering
  - CSS Grid and Flexbox
  - ES6 classes and modules

## Performance

### Lighthouse Scores (Target)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Optimization Tips
- Canvas runs at 60fps on modern laptops
- Avoid heavy blur on large surfaces
- Keep particle count ≤120
- Debounce expensive operations
- Use `will-change` sparingly in CSS

## Accessibility

### Features
- Semantic HTML5 structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Reduced motion detection
- High contrast text (WCAG AA compliant)
- Skip links (can be added)

### Testing
```bash
# Check with screen readers:
# - NVDA (Windows)
# - JAWS (Windows)
# - VoiceOver (macOS/iOS)
```

## Local Development

No build process required! Just open in a browser:

```bash
# Serve locally with Python
python -m http.server 8000

# Or with Node.js
npx http-server

# Then visit: http://localhost:8000
```

## File Structure

```
.
├── index.html       # Main portfolio page
├── timeline.html    # Timeline/console page
├── styles.css       # All styles (18KB)
├── script.js        # Canvas engine + UI logic (24KB)
├── README.md        # This file
└── CNAME            # Custom domain (optional)
```

## Credits

**Design Philosophy**: Heavy infrastructure command console aesthetic with enterprise-grade performance.

**No External Resources**: All graphics, animations, and interactions are generated in-browser.

## License

This portfolio template is provided as-is for personal use. Customize freely for your own portfolio.

---

**Built by Rishabh Durugkar** | Infrastructure · Networking · Security