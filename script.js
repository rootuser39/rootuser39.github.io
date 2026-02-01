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
            this.maxParticles = this.isMobile ? 70 : 120;
            this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.particles = [];
            this.lines = [];
            this.resizeTimeout = null;
            
            this.init();
        }
        
        init() {
            this.resize();
            this.createParticles();
            
            if (!this.isReducedMotion) {
                this.setupEventListeners();
                this.animate();
            } else {
                this.drawStaticFrame();
            }
        }
        
        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.ctx.scale(this.dpr, this.dpr);
            if (!this.isReducedMotion) {
                this.createParticles();
            }
        }
        
        createParticles() {
            this.particles = [];
            const count = this.maxParticles;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 1.4 + 0.6,
                    alpha: Math.random() * 0.25 + 0.35
                });
            }
        }
        
        setupEventListeners() {
            window.addEventListener('mousemove', (e) => {
                this.mouse.targetX = e.clientX;
                this.mouse.targetY = e.clientY;
            });
            
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => this.resize(), 200);
            });
            
            document.addEventListener('visibilitychange', () => {
                this.isRunning = document.visibilityState === 'visible' && !this.isReducedMotion;
                if (this.isRunning) this.animate();
            });
        }
        
        lerpMouse() {
            const factor = 0.08;
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * factor;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * factor;
        }
        
        updateParticles() {
            const influenceRadius = 200;
            const parallax = 0.02;
            this.lines = [];
            
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                // subtle pull toward/away based on mouse
                const influence = Math.max(0, influenceRadius - dist) / influenceRadius;
                p.vx += (dx / dist) * influence * 0.02;
                p.vy += (dy / dist) * influence * 0.02;
                
                // drift damping
                p.vx *= 0.98;
                p.vy *= 0.98;
                
                // base drift
                p.x += p.vx + parallax * dx;
                p.y += p.vy + parallax * dy;
                
                // wrap edges
                if (p.x < -10) p.x = this.width + 10;
                if (p.x > this.width + 10) p.x = -10;
                if (p.y < -10) p.y = this.height + 10;
                if (p.y > this.height + 10) p.y = -10;
            }
            
            // build near-cursor connections
            const lineRadius = 160;
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const a = this.particles[i];
                    const b = this.particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const mouseDx = (a.x + b.x) / 2 - this.mouse.x;
                    const mouseDy = (a.y + b.y) / 2 - this.mouse.y;
                    const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                    
                    if (dist < lineRadius && mouseDist < influenceRadius) {
                        this.lines.push({
                            x1: a.x, y1: a.y,
                            x2: b.x, y2: b.y,
                            alpha: (1 - dist / lineRadius) * 0.15
                        });
                    }
                }
            }
        }
        
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#E7E9EE';
            
            this.lines.forEach(line => {
                this.ctx.save();
                this.ctx.strokeStyle = `rgba(231,233,238,${line.alpha})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(line.x1, line.y1);
                this.ctx.lineTo(line.x2, line.y2);
                this.ctx.stroke();
                this.ctx.restore();
            });
            
            this.particles.forEach(p => {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });
        }
        
        drawStaticFrame() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const size = Math.random() * 1.4 + 0.6;
                const alpha = Math.random() * 0.25 + 0.35;
                this.ctx.save();
                this.ctx.globalAlpha = alpha * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
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
            requestAnimationFrame(() => this.animate());
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
