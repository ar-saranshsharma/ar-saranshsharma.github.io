// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

// Sync GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initial Load Animation (Museum Style Reveal)
const tl = gsap.timeline();

tl.from(".glass-nav", {
    y: -100, opacity: 0, duration: 1.2, ease: "power4.out"
})
.from(".secondary-image-box", {
    opacity: 0, duration: 2, ease: "power2.out"
}, "-=1")
.from(".title-group", {
    opacity: 0, duration: 1, ease: "power2.out"
}, "-=1")
.from(".hero-title, .hero-dates", {
    x: -400, // Slide out from behind the vertical hidden line
    duration: 1.5, 
    ease: "power4.out",
    stagger: 0.1
}, "-=0.5")
.from(".hero-quote", {
    y: 30, opacity: 0, duration: 1, ease: "power3.out"
}, "-=1");


// Animate Project Cards
gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 80%", // when top of card hits 80% of viewport
            toggleActions: "play none none reverse"
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
    });
});

// Ticket Stamp Global Hover Interaction
const heroImageWrapper = document.querySelector('.image-gallery-wrapper');
const textWrapper = document.querySelector('.left-panel .content-wrapper');
const hoverTriggers = document.querySelectorAll('.main-image-box, .ticket-stamp');
const writingStamp = document.querySelector('.stamp-writings');
const svgLines = document.getElementById('stamp-lines');

const stamps = [
    { el: document.querySelector('.stamp-writings') },
    { el: document.querySelector('.stamp-research') },
    { el: document.querySelector('.stamp-projects') },
    { el: document.querySelector('.stamp-clicks') },
];

const LINE_COLOR = 'rgba(195, 163, 91, 0.4)';

// Build a curly cubic bezier path string from origin point to a stamp
function buildCurlyPath(ox, oy, tx, ty) {
    const dx = tx - ox;
    const dy = ty - oy;
    // Control points that give a natural S-curve / gentle curl
    const cp1x = ox + dx * 0.2 + dy * 0.3;
    const cp1y = oy + dy * 0.1 - dx * 0.25;
    const cp2x = ox + dx * 0.7 - dy * 0.2;
    const cp2y = oy + dy * 0.85 + dx * 0.15;
    return `M ${ox} ${oy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;
}

function drawLines() {
    svgLines.innerHTML = '';
    const heroBox = document.querySelector('.main-image-box');
    if (!heroBox) return;

    const heroRect = heroBox.getBoundingClientRect();
    // Origin: chest-level of the hero portrait
    const originX = heroRect.left + heroRect.width * 0.5;
    const originY = heroRect.top + heroRect.height * 0.40;

    stamps.forEach(({ el }) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Target: center of the stamp
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', buildCurlyPath(originX, originY, tx, ty));
        path.setAttribute('stroke', LINE_COLOR);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '5 4');
        path.setAttribute('stroke-linecap', 'round');

        // Animate the line drawing with SVG stroke-dashoffset
        const length = path.getTotalLength ? path.getTotalLength() : 300;
        path.setAttribute('stroke-dasharray', length);
        path.setAttribute('stroke-dashoffset', length);
        path.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)';

        svgLines.appendChild(path);

        // Trigger draw on next frame
        requestAnimationFrame(() => {
            path.setAttribute('stroke-dashoffset', '0');
        });
    });

    svgLines.style.opacity = '1';
}

function clearLines() {
    svgLines.style.opacity = '0';
    setTimeout(() => { svgLines.innerHTML = ''; }, 500);
}

let isNavActive = false;

function activateMenu() {
    if (isNavActive) return;
    isNavActive = true;
    document.body.classList.add('nav-active');
    if(heroImageWrapper) heroImageWrapper.classList.add('hovered');
    if(textWrapper) textWrapper.classList.add('blur');
    // Wait for the CSS transition (0.6s) to settle before reading positions
    setTimeout(drawLines, 650);
}

function deactivateMenu() {
    isNavActive = false;
    document.body.classList.remove('nav-active');
    if(heroImageWrapper) heroImageWrapper.classList.remove('hovered');
    if(textWrapper) textWrapper.classList.remove('blur');
    clearLines();
}

hoverTriggers.forEach(el => {
    el.addEventListener('mouseenter', activateMenu);
});

document.addEventListener('mousemove', (e) => {
    if (isNavActive) {
        let leftLimit = window.innerWidth * 0.15; // default fallback
        if (writingStamp) {
            // Generate a boundary just to the left of the left-most stamp
            leftLimit = writingStamp.getBoundingClientRect().left - 40;
        }
        
        // Only deactivate when cursor moves clear to the left of the menu area
        if (e.clientX < leftLimit) {
            deactivateMenu();
        }
    }
});

// Clean up if mouse leaves the page entirely
document.addEventListener('mouseleave', deactivateMenu);


// ===============================
// FLIPBOOK — PRESENT WORKS
// Reveal iframe on scroll-into-view
// ===============================
const flipbookFrame = document.getElementById('flipbook-frame');

if (flipbookFrame) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger: heading fades first, then frame rises
                setTimeout(() => flipbookFrame.classList.add('visible'), 200);
                observer.unobserve(flipbookFrame);
            }
        });
    }, { threshold: 0.15 });

    observer.observe(flipbookFrame);
}

// Animate section label + heading on scroll
if (typeof ScrollTrigger !== 'undefined') {
    gsap.from('.book-eyebrow, .book-section-heading, .book-open-link', {
        scrollTrigger: {
            trigger: '.book-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 30, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out'
    });
}


