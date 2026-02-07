// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background Animation - Subtle Particle Drift
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.15 + 0.05;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create particles
const particleCount = 50;
const particles = [];

if (!prefersReducedMotion) {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Animation loop
function animate() {
    if (prefersReducedMotion) {
        // Draw static particles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.1 + 0.03;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        return; // Don't continue animation
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Smooth scroll enhancement for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for non-id anchors
        if (href === '#' || href.length <= 1) return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Skip if user is in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    // Home key - scroll to top
    if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    }

    // End key - scroll to bottom
    if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    }
});

// ========== MISSION REPLAY SLIDESHOW ==========

const missionDeck = document.querySelector('.mission-deck');
const missionCards = document.querySelectorAll('.mission-card');
const prevBtn = document.querySelector('.mission-prev');
const nextBtn = document.querySelector('.mission-next');
const scrubber = document.querySelector('.mission-scrubber');
const currentIndicator = document.querySelector('.mission-current');
const autoplayToggle = document.querySelector('.mission-autoplay-toggle');
const missionLogText = document.querySelector('.mission-log-text');

let currentSlide = 0;
let autoplayInterval = null;
let isAutoplayEnabled = false;
let userInteracting = false;

// Mission titles for system log
const missionTitles = [
    'Multi-region service mesh with enhanced security',
    'Automated network change management system',
    'Kubernetes security hardening platform',
    'Infrastructure observability and monitoring stack',
    'Disaster recovery automation framework',
    'AI infrastructure platform with GPU optimization'
];

// Update active slide
function updateActiveSlide(index) {
    currentSlide = Math.max(0, Math.min(index, missionCards.length - 1));
    
    // Update indicator
    currentIndicator.textContent = String(currentSlide + 1).padStart(2, '0');
    
    // Update scrubber
    scrubber.value = currentSlide;
    
    // Scroll to card
    const card = missionCards[currentSlide];
    if (card && missionDeck) {
        const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
        card.scrollIntoView({ 
            behavior: scrollBehavior, 
            block: 'nearest', 
            inline: 'start' 
        });
    }
    
    // Update active class for replay effect
    missionCards.forEach((c, i) => {
        if (i === currentSlide) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    
    // Update system log
    if (missionLogText) {
        missionLogText.textContent = `Loaded mission ${String(currentSlide + 1).padStart(2, '0')} — ${missionTitles[currentSlide]}.`;
    }
}

// Navigation functions
function goToPrevSlide() {
    if (currentSlide > 0) {
        updateActiveSlide(currentSlide - 1);
    }
}

function goToNextSlide() {
    if (currentSlide < missionCards.length - 1) {
        updateActiveSlide(currentSlide + 1);
    }
}

// Event listeners
if (prevBtn) {
    prevBtn.addEventListener('click', goToPrevSlide);
}

if (nextBtn) {
    nextBtn.addEventListener('click', goToNextSlide);
}

if (scrubber) {
    scrubber.addEventListener('input', (e) => {
        updateActiveSlide(parseInt(e.target.value));
    });
}

// Keyboard navigation for deck
if (missionDeck) {
    missionDeck.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNextSlide();
        }
    });
}

// Autoplay functionality
function startAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    
    autoplayInterval = setInterval(() => {
        if (!userInteracting && isAutoplayEnabled) {
            if (currentSlide < missionCards.length - 1) {
                goToNextSlide();
            } else {
                // Loop back to start
                updateActiveSlide(0);
            }
        }
    }, 6000); // 6 seconds
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

if (autoplayToggle) {
    autoplayToggle.addEventListener('change', (e) => {
        isAutoplayEnabled = e.target.checked;
        if (isAutoplayEnabled) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
    });
}

// Pause autoplay on interaction
if (missionDeck) {
    missionDeck.addEventListener('mouseenter', () => {
        userInteracting = true;
    });
    
    missionDeck.addEventListener('mouseleave', () => {
        userInteracting = false;
    });
    
    missionDeck.addEventListener('touchstart', () => {
        userInteracting = true;
    });
    
    missionDeck.addEventListener('touchend', () => {
        setTimeout(() => {
            userInteracting = false;
        }, 500);
    });
    
    missionDeck.addEventListener('focus', () => {
        userInteracting = true;
    });
    
    missionDeck.addEventListener('blur', () => {
        userInteracting = false;
    });
}

// IntersectionObserver for active slide tracking
if (missionDeck && missionCards.length > 0) {
    const observerOptions = {
        root: missionDeck,
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(missionCards).indexOf(entry.target);
                if (index !== -1 && index !== currentSlide) {
                    // Update slide without scrolling (IntersectionObserver already handled scroll)
                    currentSlide = index;
                    currentIndicator.textContent = String(currentSlide + 1).padStart(2, '0');
                    scrubber.value = currentSlide;
                    
                    // Update active class for replay effect
                    missionCards.forEach((c, i) => {
                        if (i === currentSlide) {
                            c.classList.add('active');
                        } else {
                            c.classList.remove('active');
                        }
                    });
                    
                    // Update system log
                    if (missionLogText) {
                        missionLogText.textContent = `Loaded mission ${String(currentSlide + 1).padStart(2, '0')} — ${missionTitles[currentSlide]}.`;
                    }
                }
            }
        });
    }, observerOptions);
    
    missionCards.forEach(card => observer.observe(card));
    
    // Initialize first slide as active
    updateActiveSlide(0);
}
