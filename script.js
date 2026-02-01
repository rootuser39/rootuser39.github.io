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
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.isRunning = !this.isReducedMotion;
            this.isCoarse = window.matchMedia('(pointer: coarse)').matches;
            this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.maxLines = 120;
            this.linkDistance = this.isCoarse ? 90 : 140;
            this.maxParticles = this.isCoarse ? 55 : 95;
            this.layers = [];
            this.lines = [];
            this.rafId = null;
            this.resizeTimeout = null;
            
            this.init();
        }
        
        init() {
            this.setSize();
            this.createParticles();
            
            if (this.isReducedMotion) {
                this.drawStaticFrame();
                return;
            }
            
            this.setupEventListeners();
            this.animate();
        }
        
        setSize() {
            this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = Math.floor(this.width * this.dpr);
            this.canvas.height = Math.floor(this.height * this.dpr);
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }
        
        createParticles() {
            this.layers = [];
            const total = this.maxParticles;
            const nearCount = Math.round(total * 0.6);
            const farCount = total - nearCount;
            const maxVel = this.isCoarse ? 0.25 : 0.35;
            
            const makeParticle = (depth, alphaScale) => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * maxVel,
                vy: (Math.random() - 0.5) * maxVel,
                size: Math.random() * (depth === 1 ? 1.5 : 1.2) + 0.5,
                alpha: (Math.random() * 0.25 + 0.18) * alphaScale,
                depth
            });
            
            const farLayer = Array.from({ length: farCount }, () => makeParticle(0.55, 0.7));
            const nearLayer = Array.from({ length: nearCount }, () => makeParticle(1, 1));
            this.layers.push(farLayer, nearLayer);
        }
        
        setupEventListeners() {
            window.addEventListener('mousemove', (e) => {
                this.mouse.targetX = e.clientX;
                this.mouse.targetY = e.clientY;
            });
            
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.setSize();
                    this.createParticles();
                }, 180);
            });
            
            document.addEventListener('visibilitychange', () => {
                const shouldRun = document.visibilityState === 'visible' && !this.isReducedMotion;
                this.isRunning = shouldRun;
                if (shouldRun) {
                    this.animate();
                } else if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                }
            });
        }
        
        lerpMouse() {
            const factor = 0.06;
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * factor;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * factor;
        }
        
        clampVelocity(value, limit) {
            if (value > limit) return limit;
            if (value < -limit) return -limit;
            return value;
        }
        
        updateParticles() {
            const influenceRadius = this.isCoarse ? 140 : 200;
            const parallax = 0.015;
            this.lines = [];
            
            const maxVel = this.isCoarse ? 0.25 : 0.35;
            const lineCap = this.maxLines;
            
            for (const layer of this.layers) {
                for (let i = 0; i < layer.length; i++) {
                    const p = layer[i];
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const influence = Math.max(0, influenceRadius - dist) / influenceRadius;
                    
                    p.vx += (dx / dist) * influence * 0.01 * p.depth;
                    p.vy += (dy / dist) * influence * 0.01 * p.depth;
                    
                    p.vx = this.clampVelocity(p.vx * 0.985, maxVel);
                    p.vy = this.clampVelocity(p.vy * 0.985, maxVel);
                    
                    p.x += p.vx + parallax * dx * p.depth;
                    p.y += p.vy + parallax * dy * p.depth;
                    
                    if (p.x < 0) p.x = this.width;
                    if (p.x > this.width) p.x = 0;
                    if (p.y < 0) p.y = this.height;
                    if (p.y > this.height) p.y = 0;
                }
            }
            
            const linkDist = this.linkDistance;
            const mouseRadius = linkDist;
            const flat = this.layers.flat();
            
            for (let i = 0; i < flat.length; i++) {
                if (this.lines.length >= lineCap) break;
                for (let j = i + 1; j < flat.length; j++) {
                    if (this.lines.length >= lineCap) break;
                    const a = flat[i];
                    const b = flat[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > linkDist) continue;
                    
                    const midX = (a.x + b.x) * 0.5;
                    const midY = (a.y + b.y) * 0.5;
                    const mouseDx = midX - this.mouse.x;
                    const mouseDy = midY - this.mouse.y;
                    const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                    
                    if (mouseDist > mouseRadius) continue;
                    
                    const alpha = (1 - dist / linkDist) * 0.12 * Math.min(a.depth, b.depth);
                    this.lines.push({
                        x1: a.x, y1: a.y,
                        x2: b.x, y2: b.y,
                        alpha
                    });
                }
            }
        }
        
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#E7E9EE';
            
            for (const line of this.lines) {
                this.ctx.save();
                this.ctx.strokeStyle = `rgba(231,233,238,${line.alpha})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(line.x1, line.y1);
                this.ctx.lineTo(line.x2, line.y2);
                this.ctx.stroke();
                this.ctx.restore();
            }
            
            for (const layer of this.layers) {
                for (const p of layer) {
                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha * 0.55;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }
        
        drawStaticFrame() {
            this.setSize();
            this.createParticles();
            this.ctx.clearRect(0, 0, this.width, this.height);
            const flat = this.layers.flat();
            for (let i = 0; i < Math.min(35, flat.length); i++) {
                const p = flat[i];
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = '#E7E9EE';
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        animate() {
            if (!this.isRunning) return;
            this.lerpMouse();
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
