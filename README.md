# Infrastructure Command Console Portfolio

Emperor black/grey portfolio for infrastructure, networking, and security engineering. Pure HTML/CSS/JS—no frameworks or external assets.

## Pages
- `index.html` — main portfolio
- `timeline.html` — console-style timeline
- `services.html` — services overview

## Advanced Background FX Pipeline

The site features a modular, high-performance FX pipeline with 4 layers that work together to create an advanced but subtle background effect:

### FX Layers

1. **Flow Field Layer**: Value-noise based flow field that guides particles in smooth, organic patterns. Particles drift autonomously without mouse tracking.

2. **Local Web Layer**: Connection lines drawn only between close neighbors using spatial hashing (grid binning) for efficient neighbor detection. Hard-capped line draws per frame.

3. **Low-res Distortion/Glow Layer**: 1/3 scale buffer creating faint metaball-like glow blobs, composited to main canvas with very low opacity. Automatically disabled on mobile devices.

4. **CSS Overlay Layer**: Subtle scanline and noise effects using pure CSS gradients (no external images). Automatically disabled in reduced-motion mode.

### Performance & Quality Scaling

The pipeline includes adaptive quality scaling that responds to measured frame performance:

**Quality Reduction** (if avg frame time > 18ms for 1 second):
- Reduces particle count gradually
- Lowers DPR (device pixel ratio) clamp
- Reduces maximum line draws
- Disables glow layer if performance is severely impacted (>25ms)

**Quality Increase** (if avg frame time < 14ms for 2 seconds):
- Gently increases particle count back to caps
- Raises DPR up to maximum
- Increases line draw budget
- Changes are applied gradually to avoid stuttering

**Mobile Optimizations**:
- Lower initial particle count (~40 vs ~75 desktop)
- Lower DPR cap (1.25 vs 1.5 desktop)
- Glow/distortion layer disabled by default
- Smaller spatial grid cells

**Tab Visibility**:
- Animation pauses when tab is hidden
- Resumes cleanly when tab becomes visible
- Prevents wasted CPU/battery when not viewing

**Reduced Motion**:
- Renders one static frame with subset of particles
- Stops all animation
- Disables CSS overlay effects

### Tuning Knobs

All tuning parameters are in `script.js` in the `AdvancedFXPipeline` class constructor:

```javascript
// Quality scaling properties
this.quality = {
    dpr: ...,                    // Device pixel ratio clamp
    particleCount: ...,          // Initial particle count
    maxLines: ...,               // Maximum connection lines
    enableGlow: ...,             // Glow layer on/off
    scale: 1.0                   // Overall quality scale
};

// Adaptive quality thresholds
- Frame time > 18ms: reduce quality
- Frame time < 14ms: increase quality
- Changes wait 2 seconds between adjustments
```

**Flow Field**:
- `gridSize`: 32 (smaller = more detailed field, higher cost)
- `flowStrength`: 0.15 (higher = faster drift)
- Update rate: 0.001 per frame

**Spatial Grid**:
- Cell size: 100 mobile, 140 desktop (affects connection distance)

**Glow Layer**:
- Scale: 1/3 resolution (higher = more detail, higher cost)
- Opacity: 0.12 (lower = more subtle)

## Links & Resume
Update contact targets in `index.html`:
- GitHub/LinkedIn/Email: Contact buttons
- Resume: `/resume.pdf` link in Contact (replace with your PDF path)
- Navbar links: edit anchors in each HTML file (keep Services/Timeline URLs consistent)

## Timeline Console
- Logs expand/collapse, filters, jumps, focus mode
- Focus mode lowers background intensity and lines
- Keyboard: Enter/Space toggles entries; ARIA updated for accordions
- Mobile: console controls collapse into “Console Controls” toggle

## Responsiveness
- Breakpoints ~480/768/1024; hamburger nav on small screens
- Projects grid: 1/2/3 columns (phone/tablet/desktop)
- Tap targets ≥44px; typography uses `clamp()`

## Reduced Motion
- Background animation stops; reveal animations disabled
- Timeline scan sweep disabled

## Deployment (GitHub Pages)
- Serve from repository root (main branch). Custom domain via CNAME if needed.

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
