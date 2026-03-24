export function initCustomCursor() {
  // Check for touch devices, don't show custom cursor on mobile
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const cursorDot = document.createElement('div');
  const cursorOutline = document.createElement('div');
  
  cursorDot.classList.add('cursor-dot');
  cursorOutline.classList.add('cursor-outline');
  
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorOutline);

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows instantly, offset by half width/height (which is handled by transform translate in CSS, so just pass coords)
    // Wait, transform translate in JS overrides CSS translate(-50%, -50%). Let's do left/top or update CSS.
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  const animateOutline = () => {
    const dx = mouseX - outlineX;
    const dy = mouseY - outlineY;
    
    outlineX += dx * 0.15;
    outlineY += dy * 0.15;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
    requestAnimationFrame(animateOutline);
  };
  animateOutline();

  const addHoverEffects = () => {
    const interactables = document.querySelectorAll('a, button, .card, .feature-card, input, textarea');
    
    interactables.forEach(el => {
      // Avoid adding multiple listeners
      if (el.dataset.cursorAttached) return;
      el.dataset.cursorAttached = "true";
      
      el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('cursor-hovering');
        cursorDot.classList.add('cursor-hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('cursor-hovering');
        cursorDot.classList.remove('cursor-hovering');
      });
    });
  };

  const observer = new MutationObserver(() => addHoverEffects());
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
  addHoverEffects();
}

export function initMagneticButtons() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const setupMagnetic = () => {
    const buttons = document.querySelectorAll('.btn, .nav-link');
    buttons.forEach(btn => {
      if (btn.dataset.magneticAttached) return;
      btn.dataset.magneticAttached = "true";
      
      btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move the button slightly towards cursor
        this.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = `translate(0px, 0px)`;
      });
    });
  };

  const observer = new MutationObserver(() => setupMagnetic());
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
  setupMagnetic();
}

export function initScrollReveal() {
  const setupObserver = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.section-title, .section-subtitle, .card, .feature-card, .category-card, .testimonial-card, .product-gallery, .product-info').forEach(el => {
      if (el.dataset.revealAttached) return;
      el.dataset.revealAttached = "true";
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });
  };
  
  const mutationObserver = new MutationObserver(() => setupObserver());
  mutationObserver.observe(document.getElementById('app'), { childList: true, subtree: true });
  
  // initial call wait a bit for DOM to render
  setTimeout(setupObserver, 100);
}
