// ===============================================
// INFRASTRUCTURE COMMAND CONSOLE - SCRIPT
// Advanced FX Pipeline + UI Logic
// ===============================================

(function() {
    'use strict';

    // ==================== ADVANCED FX PIPELINE ====================
    
    class AdvancedFXPipeline {
        constructor() {
            this.canvas = document.getElementById('backgroundCanvas');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.isRunning = !this.isReducedMotion;
            this.isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
            
            // Quality scaling properties
            this.quality = {
                dpr: Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.25 : 1.5),
                particleCount: this.isMobile ? 40 : 75,
                maxLines: this.isMobile ? 60 : 100,
                enableGlow: !this.isMobile,
                scale: 1.0
            };
            
            // FPS monitoring for adaptive quality
            this.fpsMonitor = {
                frameTimes: [],
                lastTime: performance.now(),
                avgFrameTime: 16.67,
                checkInterval: 60, // frames
                frameCount: 0,
                qualityChangeDelay: 0
            };
            
            // FX layers
            this.flowField = null;
            this.particles = [];
            this.spatialGrid = null;
            this.glowBuffer = null;
            
            this.rafId = null;
            this.resizeTimeout = null;
            
            this.init();
        }
        
        init() {
            this.setSize();
            this.initFlowField();
            this.createParticles();
            
            if (this.quality.enableGlow) {
                this.initGlowBuffer();
            }
            
            if (this.isReducedMotion) {
                this.drawStaticFrame();
                return;
            }
            
            this.setupEventListeners();
            this.animate();
        }
        
        setSize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = Math.floor(this.width * this.quality.dpr);
            this.canvas.height = Math.floor(this.height * this.quality.dpr);
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.ctx.setTransform(this.quality.dpr, 0, 0, this.quality.dpr, 0, 0);
        }
        
        // Flow Field Layer - cheap value noise for particle drift
        initFlowField() {
            const gridSize = 32;
            const cols = Math.ceil(this.width / gridSize) + 1;
            const rows = Math.ceil(this.height / gridSize) + 1;
            
            this.flowField = {
                gridSize,
                cols,
                rows,
                field: [],
                time: 0
            };
            
            // Generate initial field with simplex-like noise approximation
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const angle = this.valueNoise(x * 0.1, y * 0.1, 0) * Math.PI * 2;
                    this.flowField.field.push(angle);
                }
            }
        }
        
        // Simple value noise (faster than Perlin/Simplex)
        valueNoise(x, y, z) {
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            const Z = Math.floor(z) & 255;
            
            const hash = (i, j, k) => {
                return ((i * 374761393 + j * 668265263 + k * 1274126177) & 0x7fffffff) / 0x7fffffff;
            };
            
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            const zf = z - Math.floor(z);
            
            const u = xf * xf * (3 - 2 * xf);
            const v = yf * yf * (3 - 2 * yf);
            const w = zf * zf * (3 - 2 * zf);
            
            const a = hash(X, Y, Z);
            const b = hash(X + 1, Y, Z);
            const c = hash(X, Y + 1, Z);
            const d = hash(X + 1, Y + 1, Z);
            const e = hash(X, Y, Z + 1);
            const f = hash(X + 1, Y, Z + 1);
            const g = hash(X, Y + 1, Z + 1);
            const h = hash(X + 1, Y + 1, Z + 1);
            
            const x1 = a + u * (b - a);
            const x2 = c + u * (d - c);
            const y1 = x1 + v * (x2 - x1);
            
            const x3 = e + u * (f - e);
            const x4 = g + u * (h - g);
            const y2 = x3 + v * (x4 - x3);
            
            return y1 + w * (y2 - y1);
        }
        
        updateFlowField() {
            this.flowField.time += 0.001;
            const t = this.flowField.time;
            
            for (let i = 0; i < this.flowField.field.length; i++) {
                const x = i % this.flowField.cols;
                const y = Math.floor(i / this.flowField.cols);
                const angle = this.valueNoise(x * 0.1, y * 0.1, t) * Math.PI * 2;
                this.flowField.field[i] = angle;
            }
        }
        
        getFlowAt(x, y) {
            const col = Math.floor(x / this.flowField.gridSize);
            const row = Math.floor(y / this.flowField.gridSize);
            const idx = row * this.flowField.cols + col;
            
            if (idx >= 0 && idx < this.flowField.field.length) {
                return this.flowField.field[idx];
            }
            return 0;
        }
        
        // Low-res glow buffer for metaball-like effect
        initGlowBuffer() {
            const scale = 3; // 1/3 resolution
            this.glowBuffer = document.createElement('canvas');
            this.glowBuffer.width = Math.floor(this.width / scale);
            this.glowBuffer.height = Math.floor(this.height / scale);
            this.glowBufferCtx = this.glowBuffer.getContext('2d', { alpha: true });
            this.glowScale = scale;
        }
        
        createParticles() {
            this.particles = [];
            const count = Math.floor(this.quality.particleCount * this.quality.scale);
            
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 1.5 + 0.6,
                    alpha: Math.random() * 0.2 + 0.15,
                    baseAlpha: Math.random() * 0.2 + 0.15
                });
            }
            
            // Initialize spatial grid for local web layer
            this.initSpatialGrid();
        }
        
        // Spatial hashing for efficient neighbor finding
        initSpatialGrid() {
            const cellSize = this.isMobile ? 100 : 140;
            this.spatialGrid = {
                cellSize,
                cols: Math.ceil(this.width / cellSize),
                rows: Math.ceil(this.height / cellSize),
                cells: {}
            };
        }
        
        updateSpatialGrid() {
            this.spatialGrid.cells = {};
            
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const col = Math.floor(p.x / this.spatialGrid.cellSize);
                const row = Math.floor(p.y / this.spatialGrid.cellSize);
                const key = `${col},${row}`;
                
                if (!this.spatialGrid.cells[key]) {
                    this.spatialGrid.cells[key] = [];
                }
                this.spatialGrid.cells[key].push(i);
            }
        }
        
        getNeighborCells(col, row) {
            const neighbors = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const key = `${col + dx},${row + dy}`;
                    if (this.spatialGrid.cells[key]) {
                        neighbors.push(...this.spatialGrid.cells[key]);
                    }
                }
            }
            return neighbors;
        }
        
        setupEventListeners() {
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.setSize();
                    this.initFlowField();
                    this.createParticles();
                    if (this.quality.enableGlow) {
                        this.initGlowBuffer();
                    }
                }, 180);
            });
            
            // Pause/resume on tab visibility
            document.addEventListener('visibilitychange', () => {
                const shouldRun = document.visibilityState === 'visible' && !this.isReducedMotion;
                this.isRunning = shouldRun;
                if (shouldRun) {
                    this.fpsMonitor.lastTime = performance.now();
                    this.animate();
                } else if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                }
            });
        }
        
        // Adaptive quality scaling
        measureFrameTime() {
            const now = performance.now();
            const frameTime = now - this.fpsMonitor.lastTime;
            this.fpsMonitor.lastTime = now;
            
            this.fpsMonitor.frameTimes.push(frameTime);
            if (this.fpsMonitor.frameTimes.length > 60) {
                this.fpsMonitor.frameTimes.shift();
            }
            
            this.fpsMonitor.frameCount++;
            
            if (this.fpsMonitor.frameCount >= this.fpsMonitor.checkInterval) {
                this.fpsMonitor.frameCount = 0;
                
                // Calculate average frame time
                const sum = this.fpsMonitor.frameTimes.reduce((a, b) => a + b, 0);
                this.fpsMonitor.avgFrameTime = sum / this.fpsMonitor.frameTimes.length;
                
                // Adaptive quality adjustment
                if (this.fpsMonitor.qualityChangeDelay > 0) {
                    this.fpsMonitor.qualityChangeDelay--;
                } else {
                    this.adjustQuality();
                }
            }
        }
        
        adjustQuality() {
            const avgFT = this.fpsMonitor.avgFrameTime;
            
            // If avg frame time > 18ms for 1s (60 frames), reduce quality
            if (avgFT > 18) {
                if (this.quality.scale > 0.5) {
                    this.quality.scale = Math.max(0.5, this.quality.scale - 0.1);
                    this.quality.dpr = Math.max(1.0, this.quality.dpr - 0.1);
                    this.quality.maxLines = Math.max(30, Math.floor(this.quality.maxLines * 0.9));
                    
                    // Disable glow on severe performance issues
                    if (avgFT > 25 && this.quality.enableGlow) {
                        this.quality.enableGlow = false;
                        this.glowBuffer = null;
                    }
                    
                    this.createParticles();
                    this.setSize();
                    this.fpsMonitor.qualityChangeDelay = 120; // Wait 2s before next change
                }
            }
            // If avg frame time < 14ms for 2s (120 frames), gently increase quality
            else if (avgFT < 14 && this.fpsMonitor.frameTimes.length >= 120) {
                const maxDpr = this.isMobile ? 1.25 : 1.5;
                const maxParticles = this.isMobile ? 40 : 75;
                const maxLinesLimit = this.isMobile ? 60 : 100;
                
                if (this.quality.scale < 1.0) {
                    this.quality.scale = Math.min(1.0, this.quality.scale + 0.05);
                    this.quality.dpr = Math.min(maxDpr, this.quality.dpr + 0.05);
                    this.quality.maxLines = Math.min(maxLinesLimit, Math.floor(this.quality.maxLines * 1.05));
                    
                    this.createParticles();
                    this.setSize();
                    this.fpsMonitor.qualityChangeDelay = 120;
                }
            }
        }
        
        updateParticles() {
            this.updateFlowField();
            this.updateSpatialGrid();
            
            const flowStrength = 0.15;
            const damping = 0.98;
            
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                
                // Flow field influence (no mouse tracking)
                const angle = this.getFlowAt(p.x, p.y);
                p.vx += Math.cos(angle) * flowStrength;
                p.vy += Math.sin(angle) * flowStrength;
                
                // Apply damping
                p.vx *= damping;
                p.vy *= damping;
                
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap edges
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;
            }
        }
        
        // Local Web Layer - draw lines only for close neighbors using spatial hashing
        drawLocalWeb() {
            const linkDist = this.spatialGrid.cellSize;
            const linkDistSq = linkDist * linkDist;
            let lineCount = 0;
            const maxLines = this.quality.maxLines;
            
            // Iterate through grid cells
            for (const key in this.spatialGrid.cells) {
                if (lineCount >= maxLines) break;
                
                const indices = this.spatialGrid.cells[key];
                const [col, row] = key.split(',').map(Number);
                const neighbors = this.getNeighborCells(col, row);
                
                for (let i = 0; i < indices.length; i++) {
                    if (lineCount >= maxLines) break;
                    
                    const idx1 = indices[i];
                    const p1 = this.particles[idx1];
                    
                    for (let j = 0; j < neighbors.length; j++) {
                        if (lineCount >= maxLines) break;
                        
                        const idx2 = neighbors[j];
                        if (idx2 <= idx1) continue;
                        
                        const p2 = this.particles[idx2];
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distSq = dx * dx + dy * dy;
                        
                        if (distSq < linkDistSq) {
                            const alpha = (1 - Math.sqrt(distSq) / linkDist) * 0.08;
                            
                            this.ctx.save();
                            this.ctx.strokeStyle = `rgba(231, 233, 238, ${alpha})`;
                            this.ctx.lineWidth = 1;
                            this.ctx.beginPath();
                            this.ctx.moveTo(p1.x, p1.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.stroke();
                            this.ctx.restore();
                            
                            lineCount++;
                        }
                    }
                }
            }
        }
        
        // Low-res glow/distortion layer
        drawGlowLayer() {
            if (!this.quality.enableGlow || !this.glowBuffer) return;
            
            const ctx = this.glowBufferCtx;
            const w = this.glowBuffer.width;
            const h = this.glowBuffer.height;
            
            // Clear with fade for trail effect
            ctx.fillStyle = 'rgba(5, 6, 7, 0.2)';
            ctx.fillRect(0, 0, w, h);
            
            // Draw particles as glow blobs
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const x = p.x / this.glowScale;
                const y = p.y / this.glowScale;
                const radius = 20 / this.glowScale;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(231, 233, 238, 0.15)');
                gradient.addColorStop(1, 'rgba(231, 233, 238, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Composite to main canvas with very low opacity
            this.ctx.save();
            this.ctx.globalAlpha = 0.12;
            this.ctx.drawImage(this.glowBuffer, 0, 0, this.width, this.height);
            this.ctx.restore();
        }
        
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw glow layer first (if enabled)
            if (this.quality.enableGlow) {
                this.drawGlowLayer();
            }
            
            // Draw local web layer (connection lines)
            this.drawLocalWeb();
            
            // Draw particles
            this.ctx.fillStyle = '#E7E9EE';
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha * 0.55;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        drawStaticFrame() {
            this.setSize();
            this.createParticles();
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw subset of particles (no animation)
            this.ctx.fillStyle = '#E7E9EE';
            const maxParticles = Math.min(30, this.particles.length);
            for (let i = 0; i < maxParticles; i++) {
                const p = this.particles[i];
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha * 0.4;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        animate() {
            if (!this.isRunning) return;
            
            this.measureFrameTime();
            this.updateParticles();
            this.draw();
            
            this.rafId = requestAnimationFrame(() => this.animate());
        }
    }
    
    // ==================== NAVIGATION & SCROLL ====================
    
    class Navigation {
        constructor() {
            this.nav = document.getElementById('mainNav');
            this.navLinks = document.querySelectorAll('.nav-link:not(.nav-link-timeline)');
            this.sections = document.querySelectorAll('.section, .hero-section');
            this.navToggle = document.getElementById('navToggle');
            this.navList = document.getElementById('primaryNavigation');
            
            if (this.navLinks.length > 0 && this.sections.length > 0) {
                this.setupIntersectionObserver();
            }
            this.setupToggle();
        }
        
        setupToggle() {
            if (!this.navToggle || !this.navList) return;
            this.navToggle.addEventListener('click', () => {
                const isOpen = this.navList.classList.toggle('open');
                this.navToggle.setAttribute('aria-expanded', isOpen);
            });
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.navList.classList.contains('open')) {
                        this.navList.classList.remove('open');
                        this.navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
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
            this.MAX_LOG_ENTRIES = 60;
            
            this.searchInput = document.getElementById('timelineSearch');
            this.expandAllBtn = document.getElementById('expandAll');
            this.collapseAllBtn = document.getElementById('collapseAll');
            this.toggleCompactBtn = document.getElementById('toggleCompact');
            this.focusModeCheckbox = document.getElementById('focusMode');
            this.systemLog = document.getElementById('systemLog');
            this.yearButtons = document.querySelectorAll('.panel-btn[data-year]');
            this.entries = document.querySelectorAll('.timeline-entry');
            this.panel = document.querySelector('.command-panel');
            this.panelToggle = null;
            
            this.setupPanelToggle();
            this.setupEventListeners();
            this.addSystemLog('System initialized');
            this.addSystemLog('Timeline loaded successfully');
        }
        
        setupPanelToggle() {
            if (!this.panel) return;
            const button = document.createElement('button');
            button.className = 'panel-btn-wide mobile-panel-toggle';
            button.setAttribute('aria-expanded', 'false');
            button.textContent = 'Console Controls';
            this.panel.parentElement.insertBefore(button, this.panel);
            this.panelToggle = button;
            
            const updateVisibility = () => {
                if (window.innerWidth <= 768) {
                    this.panel.classList.add('collapsed');
                    this.panel.style.display = 'none';
                    this.panelToggle.style.display = 'block';
                } else {
                    this.panel.classList.remove('collapsed');
                    this.panel.style.display = '';
                    this.panelToggle.style.display = 'none';
                }
            };
            
            window.addEventListener('resize', () => updateVisibility());
            updateVisibility();
            
            button.addEventListener('click', () => {
                const isOpen = this.panel.style.display !== 'none';
                this.panel.style.display = isOpen ? 'none' : '';
                this.panelToggle.setAttribute('aria-expanded', String(!isOpen));
                this.addSystemLog(`Console ${isOpen ? 'collapsed' : 'opened'}`);
            });
        }
        
        setupEventListeners() {
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
                    this.filterTimeline(e.target.value);
                });
            }
            
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
            
            if (this.toggleCompactBtn) {
                this.toggleCompactBtn.addEventListener('click', () => {
                    document.body.classList.toggle('compact-view');
                    const isCompact = document.body.classList.contains('compact-view');
                    this.toggleCompactBtn.textContent = isCompact ? 'Detailed View' : 'Compact View';
                    this.addSystemLog(`FILTER APPLIED: view=${isCompact ? 'compact' : 'detailed'}`);
                });
            }
            
            if (this.focusModeCheckbox) {
                this.focusModeCheckbox.addEventListener('change', (e) => {
                    document.body.classList.toggle('focus-mode', e.target.checked);
                    this.addSystemLog(`Focus mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                    const canvas = document.getElementById('backgroundCanvas');
                    if (canvas) canvas.style.opacity = e.target.checked ? '0.15' : '1';
                });
            }
            
            this.yearButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const year = btn.getAttribute('data-year');
                    this.jumpToYear(year);
                });
            });
            
            this.entries.forEach(entry => {
                const toggle = entry.querySelector('.entry-toggle');
                const content = entry.querySelector('.entry-content');
                
                if (toggle && content) {
                    toggle.setAttribute('role', 'button');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-controls', content.id || '');
                    toggle.addEventListener('click', () => this.toggleEntry(entry, toggle, content));
                    toggle.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.toggleEntry(entry, toggle, content);
                        }
                    });
                }
            });
        }
        
        toggleEntry(entry, toggle, content) {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isExpanded));
            content.classList.toggle('expanded');
            const title = entry.querySelector('.entry-title')?.textContent || 'Entry';
            this.addSystemLog(`${!isExpanded ? 'ENTRY EXPANDED' : 'ENTRY COLLAPSED'}: ${title}`);
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
            
            this.addSystemLog(`FILTER APPLIED: ${query || 'none'} (${visibleCount} entries)`);
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
            
            this.addSystemLog('ENTRY EXPANDED: all');
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
            
            this.addSystemLog('ENTRY COLLAPSED: all');
        }
        
        jumpToYear(year) {
            const yearSection = document.querySelector(`.timeline-year[data-year="${year}"]`);
            if (yearSection) {
                yearSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.addSystemLog(`FILTER APPLIED: jump ${year}`);
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
            
            const entries = this.systemLog.querySelectorAll('.log-entry');
            if (entries.length > this.MAX_LOG_ENTRIES) {
                entries[0].remove();
            }
        }
    }
    
    // ==================== INITIALIZE ====================
    
    function init() {
        // Advanced FX Pipeline
        new AdvancedFXPipeline();
        
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
