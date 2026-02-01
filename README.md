# Infrastructure Command Console Portfolio

Emperor black/grey portfolio for infrastructure, networking, and security engineering. Pure HTML/CSS/JS—no frameworks or external assets.

## Pages
- `index.html` — main portfolio
- `timeline.html` — console-style timeline
- `services.html` — services overview

## Links & Resume
Update contact targets in `index.html`:
- GitHub/LinkedIn/Email: Contact buttons
- Resume: `/resume.pdf` link in Contact (replace with your PDF path)
- Navbar links: edit anchors in each HTML file (keep Services/Timeline URLs consistent)

## Particle Engine (script.js)
- Single canvas particle field (monochrome steel/grey)
- Caps: 120 particles desktop, ~70 mobile; DPR clamped to 1.5
- Mouse influences drift/parallax; near-cursor connection lines only
- Resize debounced; pauses on tab hidden
- `prefers-reduced-motion`: renders one static frame and stops parallax/reveal
- Tune count via `maxParticles`, influence via radii in `InfrastructureCanvas`

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
