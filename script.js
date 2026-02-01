// ===============================================
// INFRASTRUCTURE COMMAND CONSOLE - SCRIPT
// Canvas Engine + UI Logic
// ===============================================

(function() {
    'use strict';

    // ==================== CANVAS ENGINE ====================
    
    class InfrastructureCanvas {
        constructor() {
            this.canvas = document.getElementById('backgroundCanvas');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.width = 0;
            this.height = 0;
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.isRunning = !this.isReducedMotion;
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Particles and elements
            this.gridTiles = [];
            this.networkNodes = [];
            this.radarRings = [];
            this.maxParticles = 120;
            
            this.init();
        }
        
        init() {
            this.resize();
            this.createElements();
            
            if (!this.isReducedMotion) {
                this.setupEventListeners();
                this.animate();
            } else {
                // Draw one static frame
                this.drawStaticFrame();
            }
        }
        
        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            // Recreate elements on resize
            if (!this.isReducedMotion) {
                this.createElements();
            }
        }
        
        createElements() {
            // GPU/Compute: Grid tiles
            this.gridTiles = [];
            const tileSize = 80;
            const tilesX = Math.ceil(this.width / tileSize);
            const tilesY = Math.ceil(this.height / tileSize);
            
            for (let i = 0; i < tilesX; i++) {
                for (let j = 0; j < tilesY; j++) {
                    if (Math.random() > 0.7) { // Sparse grid
                        this.gridTiles.push({
                            x: i * tileSize,
                            y: j * tileSize,
                            size: tileSize,
                            opacity: Math.random() * 0.15 + 0.05,
                            shimmer: Math.random() * Math.PI * 2
                        });
                    }
                }
            }
            
            // Networking: Network nodes
            this.networkNodes = [];
            const nodeCount = Math.min(Math.floor(this.maxParticles * 0.3), 25);
            for (let i = 0; i < nodeCount; i++) {
                this.networkNodes.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: 2 + Math.random() * 2,
                    opacity: 0.3 + Math.random() * 0.3,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
            
            // Security: Radar rings
            this.radarRings = [];
            const ringCount = Math.min(Math.floor(this.maxParticles * 0.15), 8);
            for (let i = 0; i < ringCount; i++) {
                this.radarRings.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: 0,
                    maxRadius: 100 + Math.random() * 150,
                    speed: 0.5 + Math.random() * 0.5,
                    opacity: 0.2
                });
            }
        }
        
        setupEventListeners() {
            // Mouse tracking with lerp
            window.addEventListener('mousemove', (e) => {
                this.mouse.targetX = e.clientX;
                this.mouse.targetY = e.clientY;
            });
            
            // Debounced resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resize();
                }, 250);
            });
            
            // Mobile orientation
            if (this.isMobile && window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', (e) => {
                    if (e.gamma !== null && e.beta !== null) {
                        this.mouse.targetX = (e.gamma / 90) * (this.width / 2) + (this.width / 2);
                        this.mouse.targetY = (e.beta / 90) * (this.height / 2) + (this.height / 2);
                    }
                });
            }
        }
        
        lerpMouse() {
            // Smooth mouse following
            const lerpFactor = 0.1;
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerpFactor;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerpFactor;
        }
        
        drawGridTiles() {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.lineWidth = 1;
            
            this.gridTiles.forEach(tile => {
                // Heat shimmer effect (subtle)
                tile.shimmer += 0.02;
                const shimmerOffset = Math.sin(tile.shimmer) * 2;
                
                // Distance to mouse for parallax
                const dx = this.mouse.x - tile.x;
                const dy = this.mouse.y - tile.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const parallaxFactor = Math.max(0, 1 - dist / 400) * 3;
                
                this.ctx.save();
                this.ctx.globalAlpha = tile.opacity + (parallaxFactor * 0.1);
                this.ctx.strokeRect(
                    tile.x + shimmerOffset + (parallaxFactor * (dx / dist)),
                    tile.y + (parallaxFactor * (dy / dist)),
                    tile.size,
                    tile.size
                );
                this.ctx.restore();
            });
        }
        
        drawNetworkNodes() {
            const connectionRadius = 200;
            
            // Update node positions
            this.networkNodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce off edges
                if (node.x < 0 || node.x > this.width) node.vx *= -1;
                if (node.y < 0 || node.y > this.height) node.vy *= -1;
                
                // Constrain
                node.x = Math.max(0, Math.min(this.width, node.x));
                node.y = Math.max(0, Math.min(this.height, node.y));
                
                // Pulse animation
                node.pulsePhase += 0.05;
            });
            
            // Draw connections (only near mouse to limit cost)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i < this.networkNodes.length; i++) {
                const nodeA = this.networkNodes[i];
                
                // Check distance to mouse
                const dmx = this.mouse.x - nodeA.x;
                const dmy = this.mouse.y - nodeA.y;
                const distToMouse = Math.sqrt(dmx * dmx + dmy * dmy);
                
                if (distToMouse < connectionRadius * 1.5) {
                    for (let j = i + 1; j < this.networkNodes.length; j++) {
                        const nodeB = this.networkNodes[j];
                        const dx = nodeB.x - nodeA.x;
                        const dy = nodeB.y - nodeA.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < connectionRadius) {
                            const opacity = (1 - dist / connectionRadius) * 0.15;
                            this.ctx.save();
                            this.ctx.globalAlpha = opacity;
                            this.ctx.beginPath();
                            this.ctx.moveTo(nodeA.x, nodeA.y);
                            this.ctx.lineTo(nodeB.x, nodeB.y);
                            this.ctx.stroke();
                            
                            // Packet pulse along edge
                            const pulsePos = (Math.sin(Date.now() * 0.001) + 1) / 2;
                            const px = nodeA.x + dx * pulsePos;
                            const py = nodeA.y + dy * pulsePos;
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            this.ctx.beginPath();
                            this.ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                            this.ctx.fill();
                            
                            this.ctx.restore();
                        }
                    }
                }
            }
            
            // Draw nodes
            this.networkNodes.forEach(node => {
                const pulse = Math.sin(node.pulsePhase) * 0.2 + 1;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${node.opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
        
        drawRadarRings() {
            this.radarRings.forEach(ring => {
                ring.radius += ring.speed;
                
                if (ring.radius > ring.maxRadius) {
                    ring.radius = 0;
                    // Occasionally ping near mouse
                    if (Math.random() > 0.7) {
                        ring.x = this.mouse.x + (Math.random() - 0.5) * 200;
                        ring.y = this.mouse.y + (Math.random() - 0.5) * 200;
                    } else {
                        ring.x = Math.random() * this.width;
                        ring.y = Math.random() * this.height;
                    }
                }
                
                const fadeOut = 1 - (ring.radius / ring.maxRadius);
                this.ctx.save();
                this.ctx.globalAlpha = ring.opacity * fadeOut;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Occasional ping blip
                if (ring.radius < 20 && Math.random() > 0.95) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(ring.x, ring.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            });
        }
        
        drawStaticFrame() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw a single static frame (no animation)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.lineWidth = 1;
            
            const tileSize = 100;
            for (let x = 0; x < this.width; x += tileSize) {
                for (let y = 0; y < this.height; y += tileSize) {
                    if (Math.random() > 0.7) {
                        this.ctx.strokeRect(x, y, tileSize, tileSize);
                    }
                }
            }
            
            // Few static nodes
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        animate() {
            if (!this.isRunning) return;
            
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.lerpMouse();
            this.drawGridTiles();
            this.drawNetworkNodes();
            this.drawRadarRings();
            
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // ==================== NAVIGATION & SCROLL ====================
    
    class Navigation {
        constructor() {
            this.nav = document.getElementById('mainNav');
            this.navLinks = document.querySelectorAll('.nav-link:not(.nav-link-timeline)');
            this.sections = document.querySelectorAll('.section, .hero-section');
            
            if (this.navLinks.length > 0 && this.sections.length > 0) {
                this.setupIntersectionObserver();
            }
        }
        
        setupIntersectionObserver() {
            const options = {
                root: null,
                rootMargin: '-80px 0px -60% 0px',
                threshold: 0
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.setActiveLink(id);
                    }
                });
            }, options);
            
            this.sections.forEach(section => observer.observe(section));
        }
        
        setActiveLink(id) {
            this.navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${id}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }
    
    // ==================== REVEAL ANIMATIONS ====================
    
    class RevealAnimations {
        constructor() {
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.reveals = document.querySelectorAll('.reveal');
            
            if (this.isReducedMotion) {
                // Show all immediately
                this.reveals.forEach(el => el.classList.add('revealed'));
            } else {
                this.setupRevealObserver();
            }
        }
        
        setupRevealObserver() {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            this.reveals.forEach(el => observer.observe(el));
        }
    }
    
    // ==================== BACK TO TOP ====================
    
    class BackToTop {
        constructor() {
            this.button = document.getElementById('backToTop');
            if (!this.button) return;
            
            this.button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    this.button.classList.add('visible');
                } else {
                    this.button.classList.remove('visible');
                }
            });
        }
    }
    
    // ==================== TIMELINE PAGE ====================
    
    class TimelinePage {
        constructor() {
            if (!document.body.classList.contains('timeline-page')) return;
            
            this.searchInput = document.getElementById('timelineSearch');
            this.expandAllBtn = document.getElementById('expandAll');
            this.collapseAllBtn = document.getElementById('collapseAll');
            this.toggleCompactBtn = document.getElementById('toggleCompact');
            this.focusModeCheckbox = document.getElementById('focusMode');
            this.systemLog = document.getElementById('systemLog');
            this.yearButtons = document.querySelectorAll('.panel-btn[data-year]');
            this.entries = document.querySelectorAll('.timeline-entry');
            
            this.setupEventListeners();
            this.addSystemLog('System initialized');
            this.addSystemLog('Timeline loaded successfully');
        }
        
        setupEventListeners() {
            // Search filter
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
                    this.filterTimeline(e.target.value);
                });
            }
            
            // Expand/Collapse all
            if (this.expandAllBtn) {
                this.expandAllBtn.addEventListener('click', () => {
                    this.expandAll();
                });
            }
            
            if (this.collapseAllBtn) {
                this.collapseAllBtn.addEventListener('click', () => {
                    this.collapseAll();
                });
            }
            
            // Compact view toggle
            if (this.toggleCompactBtn) {
                this.toggleCompactBtn.addEventListener('click', () => {
                    document.body.classList.toggle('compact-view');
                    const isCompact = document.body.classList.contains('compact-view');
                    this.toggleCompactBtn.textContent = isCompact ? 'Detailed View' : 'Compact View';
                    this.addSystemLog(`Switched to ${isCompact ? 'compact' : 'detailed'} view`);
                });
            }
            
            // Focus mode
            if (this.focusModeCheckbox) {
                this.focusModeCheckbox.addEventListener('change', (e) => {
                    document.body.classList.toggle('focus-mode', e.target.checked);
                    this.addSystemLog(`Focus mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                });
            }
            
            // Year jump buttons
            this.yearButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const year = btn.getAttribute('data-year');
                    this.jumpToYear(year);
                });
            });
            
            // Entry toggles
            this.entries.forEach(entry => {
                const toggle = entry.querySelector('.entry-toggle');
                const content = entry.querySelector('.entry-content');
                
                if (toggle && content) {
                    toggle.addEventListener('click', () => {
                        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                        toggle.setAttribute('aria-expanded', !isExpanded);
                        content.classList.toggle('expanded');
                        
                        if (!isExpanded) {
                            const title = entry.querySelector('.entry-title')?.textContent || 'Entry';
                            this.addSystemLog(`Expanded: ${title}`);
                        }
                    });
                }
            });
        }
        
        filterTimeline(query) {
            const lowerQuery = query.toLowerCase();
            let visibleCount = 0;
            
            this.entries.forEach(entry => {
                const title = entry.querySelector('.entry-title')?.textContent.toLowerCase() || '';
                const content = entry.querySelector('.entry-content')?.textContent.toLowerCase() || '';
                const date = entry.querySelector('.entry-date')?.textContent.toLowerCase() || '';
                
                const matches = title.includes(lowerQuery) || 
                               content.includes(lowerQuery) || 
                               date.includes(lowerQuery);
                
                if (matches || query === '') {
                    entry.classList.remove('hidden');
                    visibleCount++;
                } else {
                    entry.classList.add('hidden');
                }
            });
            
            if (query) {
                this.addSystemLog(`Filter applied: ${visibleCount} entries match`);
            }
        }
        
        expandAll() {
            this.entries.forEach(entry => {
                const toggle = entry.querySelector('.entry-toggle');
                const content = entry.querySelector('.entry-content');
                
                if (toggle && content && !entry.classList.contains('hidden')) {
                    toggle.setAttribute('aria-expanded', 'true');
                    content.classList.add('expanded');
                }
            });
            
            this.addSystemLog('All entries expanded');
        }
        
        collapseAll() {
            this.entries.forEach(entry => {
                const toggle = entry.querySelector('.entry-toggle');
                const content = entry.querySelector('.entry-content');
                
                if (toggle && content) {
                    toggle.setAttribute('aria-expanded', 'false');
                    content.classList.remove('expanded');
                }
            });
            
            this.addSystemLog('All entries collapsed');
        }
        
        jumpToYear(year) {
            const yearSection = document.querySelector(`.timeline-year[data-year="${year}"]`);
            if (yearSection) {
                yearSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.addSystemLog(`Jumped to year ${year}`);
            }
        }
        
        addSystemLog(message) {
            if (!this.systemLog) return;
            
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;
            
            this.systemLog.appendChild(entry);
            this.systemLog.scrollTop = this.systemLog.scrollHeight;
            
            // Limit log entries
            const entries = this.systemLog.querySelectorAll('.log-entry');
            if (entries.length > 50) {
                entries[0].remove();
            }
        }
    }
    
    // ==================== INITIALIZE ====================
    
    function init() {
        // Canvas engine
        new InfrastructureCanvas();
        
        // Navigation
        new Navigation();
        
        // Reveal animations
        new RevealAnimations();
        
        // Back to top
        new BackToTop();
        
        // Timeline page
        new TimelinePage();
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
