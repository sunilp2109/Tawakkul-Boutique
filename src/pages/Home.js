import { fetchProducts, getImageUrl } from '../utils/api.js';
import { formatPrice } from '../data/products.js';

export async function HomePage() {
  const productsResponse = await fetchProducts({ isFeatured: true, limit: 3 });
  const featured = productsResponse.data || [];
  
  const editorialHTML = featured.map((p, i) => {
    // 0: text left, full image right
    // 1: float image left, text right
    // 2: text left, float image right
    
    if (i === 0) {
      return `
        <div class="editorial-row" style="padding:10rem 0 5rem 0;">
          <div class="container editorial-flex">
            <div class="editorial-text pr-lg">
              <span class="editorial-badge gs-reveal">Featured Masterpiece</span>
              <h2 class="cinematic-title-small gs-reveal">${p.name}</h2>
              <p class="editorial-desc gs-reveal">${p.description}</p>
              <div class="mt-md gs-reveal">
                <a href="/product/${p._id}" class="btn btn-outline" data-link>Detailed View &mdash; ${formatPrice(p.price)}</a>
              </div>
            </div>
            <div class="editorial-visual">
              <img src="${getImageUrl(p.images?.[0])}" alt="${p.name}" class="editorial-img-full gs-reveal float-img" data-speed="1.05" loading="lazy">
            </div>
          </div>
        </div>
      `;
    } else if (i === 1) {
      return `
        <div class="editorial-row" style="padding:5rem 0;">
          <div class="container editorial-flex reverse">
            <div class="editorial-text pl-lg" style="align-items:flex-start;">
              <span class="editorial-badge gs-reveal">Timeless Elegance</span>
              <h2 class="cinematic-title-small gs-reveal">${p.name}</h2>
              <p class="editorial-desc gs-reveal">${p.description}</p>
              <div class="mt-md gs-reveal">
                <a href="/product/${p._id}" class="btn btn-outline" data-link>Detailed View &mdash; ${formatPrice(p.price)}</a>
              </div>
            </div>
            <div class="editorial-visual img-left">
              <img src="${getImageUrl(p.images?.[0])}" alt="${p.name}" class="editorial-img-float gs-reveal float-img" data-speed="0.9" loading="lazy">
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="editorial-row" style="padding:5rem 0 10rem 0;">
          <div class="container editorial-flex">
            <div class="editorial-text pr-lg">
              <span class="editorial-badge gs-reveal">Curated Highlight</span>
              <h2 class="cinematic-title-small gs-reveal">${p.name}</h2>
              <p class="editorial-desc gs-reveal">${p.description}</p>
              <div class="mt-md gs-reveal">
                <a href="/product/${p._id}" class="btn btn-outline" data-link>Detailed View &mdash; ${formatPrice(p.price)}</a>
              </div>
            </div>
            <div class="editorial-visual img-right">
              <img src="${getImageUrl(p.images?.[0])}" alt="${p.name}" class="editorial-img-float gs-reveal float-img" data-speed="1.1" loading="lazy">
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  // Setup GSAP 3D Narrative 
  setTimeout(() => {
    if (typeof gsap === 'undefined' || !document.querySelector('.story-hero')) return;
    
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Animation
    const tl = gsap.timeline();
    tl.fromTo('.cinematic-title-enter', { opacity: 0, y: 50, rotationX: 20 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.2, ease: "power4.out" })
      .fromTo('.cinematic-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
      .fromTo('.story-hero .btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1)" }, "-=0.5");

    // Parallax Hero Background
    gsap.to('.hero-bg-parallax', {
      scrollTrigger: {
        trigger: '.story-hero',
        start: "top top",
        end: "bottom top",
        scrub: true
      },
      yPercent: 20,
      scale: 1.05
    });

    // Reveal Elements
    gsap.utils.toArray('.gs-reveal').forEach(el => {
      gsap.fromTo(el, 
        { opacity: 0, y: 50 }, 
        {
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
    });

    const textRevealElements = document.querySelectorAll('.text-reveal');
    textRevealElements.forEach(el => {
      gsap.fromTo(el, 
        { opacity: 0, y: 40 }, 
        {
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
    });

    // Parallax floating images
    gsap.utils.toArray('.float-img').forEach((img) => {
      const speed = img.dataset.speed || 1;
      gsap.to(img, {
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        },
        y: -100 * speed,
        ease: "none"
      });
    });

  }, 150);

  return `
    <!-- Cinematic 3D Hero -->
    <section class="story-hero">
      <div class="hero-bg-parallax" style="background-image: url('/images/hero_bg.png');"></div>
      <div class="hero-gradient-overlay"></div>
      
      <div class="container hero-content-3d">
        <h1 class="cinematic-title-enter cinematic-title">
          <span style="display:block; font-size:clamp(1rem, 2vw, 1.5rem); letter-spacing:6px; margin-bottom:1rem; color:rgba(255,255,255,0.7); text-transform:uppercase;">Welcome to</span>
          <span class="text-gradient-gold">Tawakkul</span> Boutique
        </h1>
        <p class="cinematic-subtitle">Where faith meets unparalleled craftsmanship.</p>
        <div class="hero-buttons" style="margin-top:2.5rem">
          <a href="/products" class="btn btn-primary" data-link style="padding:1rem 2.5rem; font-size:1.1rem;">Discover Collection</a>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <div class="mouse-icon"></div>
        <span style="color:rgba(255,255,255,0.5)">Explore</span>
      </div>
    </section>

    <!-- Narrative Section 1 -->
    <section class="narrative-section">
      <div class="container">
        <div class="narrative-grid">
          <div class="narrative-text">
            <h2 class="text-reveal narrative-title">Handcrafted with <span class="text-gradient-gold">Devotion</span></h2>
            <p class="text-reveal narrative-desc">Driven by a profound love for Islamic heritage, every single piece we create is a testament to patience, skill, and spiritual connection. We don't just make gifts; we craft heirlooms.</p>
            <div class="text-reveal mt-lg">
              <a href="/about" class="btn btn-outline" data-link>Read Our Story</a>
            </div>
          </div>
          <div class="narrative-visual">
            <div class="visual-container">
              <img src="/images/eid_attar.png" class="float-img" data-speed="1.2" style="width:75%; z-index:2; border-radius:var(--radius-lg); box-shadow:0 20px 40px rgba(0,0,0,0.5);">
              <img src="/images/ayatul_kursi.png" class="float-img" data-speed="0.5" style="position:absolute; top:-5%; right:-5%; width:55%; z-index:1; opacity:0.85; filter:brightness(0.8) blur(1px); border-radius:var(--radius-lg);">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Professional Editorial Layout -->
    <section class="editorial-showcase">
      ${editorialHTML}
      <div class="container text-reveal" style="text-align:center; padding-top:4rem;">
        <h3 style="font-family:var(--font-heading); font-size:2.5rem; color:var(--gold-primary); margin-bottom:1rem;">Discover More</h3>
        <p style="color:var(--text-secondary); margin-bottom:2rem;">Explore all of our bespoke Islamic gifts.</p>
        <a href="/products" class="btn btn-primary" data-link>View Entire Collection</a>
      </div>
    </section>

    <!-- The Promise -->
    <section class="promise-section">
      <div class="promise-bg" style="background-image: url('/images/quran_set.png');"></div>
      <div class="container" style="position:relative; z-index:1; text-align:center;">
        <h2 class="text-reveal promise-title">Our <span class="text-gradient-gold">Promise</span></h2>
        <div class="promise-grid mt-lg text-reveal">
          <div class="promise-item">
            <h3 class="promise-metric">100%</h3>
            <p class="promise-label">Authentic Materials</p>
          </div>
          <div class="promise-item">
            <h3 class="promise-metric">Custom</h3>
            <p class="promise-label">Handcrafted Detail</p>
          </div>
          <div class="promise-item">
            <h3 class="promise-metric">&infin;</h3>
            <p class="promise-label">Devotion in Craft</p>
          </div>
        </div>
      </div>
    </section>

    <style>
      /* Cinematic Hero */
      .story-hero {
        position: relative;
        height: 100vh;
        min-height: 700px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        perspective: 1000px;
        margin-top: -85px; /* Cover navbar area */
      }
      .hero-bg-parallax {
        position: absolute;
        inset: -10%;
        background-size: cover;
        background-position: center;
        z-index: 0;
        filter: brightness(0.5) contrast(1.1);
      }
      .hero-gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, var(--bg-primary) 100%), radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%);
        z-index: 1;
      }
      .hero-content-3d {
        position: relative;
        z-index: 2;
        text-align: center;
      }
      .cinematic-title {
        font-family: var(--font-heading);
        font-size: clamp(3rem, 7vw, 6.5rem);
        line-height: 1.1;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
        text-shadow: 0 20px 40px rgba(0,0,0,0.8);
      }
      .cinematic-subtitle {
        font-size: clamp(1.1rem, 2vw, 1.5rem);
        color: rgba(255,255,255,0.7);
        font-weight: 300;
        letter-spacing: 1px;
      }
      .scroll-indicator {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 4px;
        opacity: 0.7;
        animation: pulseFade 2.5s infinite;
      }
      .mouse-icon {
        width: 22px;
        height: 36px;
        border: 2px solid rgba(255,255,255,0.5);
        border-radius: 12px;
        position: relative;
      }
      .mouse-icon::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 3px;
        height: 5px;
        background: var(--gold-primary);
        border-radius: 2px;
        animation: scrollWheel 1.5s infinite;
      }
      @keyframes scrollWheel {
        0% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, 12px); opacity: 0; }
      }
      @keyframes pulseFade {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      /* Narrative Section */
      .narrative-section {
        padding: 5rem 0 10rem 0;
        background: var(--bg-primary);
        position: relative;
        z-index: 10;
        overflow: hidden;
      }
      .narrative-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-xxl);
        align-items: center;
      }
      .narrative-title {
        font-size: clamp(2.5rem, 4vw, 4rem);
        margin-bottom: var(--spacing-md);
        line-height: 1.1;
        font-family: var(--font-heading);
      }
      .narrative-desc {
        font-size: clamp(1rem, 1.5vw, 1.25rem);
        line-height: 1.8;
        color: rgba(255,255,255,0.7);
        font-weight: 300;
        max-width: 90%;
      }
      .mt-lg {
        margin-top: var(--spacing-lg);
      }
      .visual-container {
        position: relative;
        height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* High-End Editorial Layout */
      .editorial-showcase {
        padding: 0 0 10rem 0;
        background: var(--bg-primary);
        position: relative;
        z-index: 10;
        overflow: hidden;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .editorial-row {
        position: relative;
      }
      .editorial-flex {
        display: flex;
        align-items: center;
        min-height: 70vh;
      }
      .editorial-flex.reverse {
        flex-direction: row-reverse;
      }
      .editorial-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .editorial-visual {
        flex: 1;
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
      }
      
      .editorial-visual.img-left { justify-content: flex-start; }
      .editorial-visual.img-right { justify-content: flex-end; }
      
      .editorial-visual.img-left .editorial-img-float {
        margin-top: -15vh; /* overlapping negative margin just like reference image */
      }
      .editorial-visual.img-right .editorial-img-float {
        margin-top: -10vh; 
      }

      .editorial-badge {
        text-transform: uppercase;
        letter-spacing: 4px;
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
        display: block;
      }
      .cinematic-title-small {
        font-family: var(--font-heading);
        font-size: clamp(3rem, 5vw, 4.5rem);
        margin-bottom: var(--spacing-md);
        line-height: 1.1;
        color: var(--text-primary);
      }
      .editorial-desc {
        color: rgba(255,255,255,0.65);
        font-size: 1.1rem;
        line-height: 1.9;
        max-width: 90%;
      }
      .pr-lg { padding-right: 6rem; }
      .pl-lg { padding-left: 6rem; }
      .mt-md { margin-top: 2.5rem; }
      
      .editorial-img-full {
        width: 100%;
        height: 80vh;
        object-fit: cover;
        border-radius: var(--radius-lg);
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      }
      
      .editorial-img-float {
        width: 80%;
        height: auto;
        aspect-ratio: 3/4;
        object-fit: cover;
        border-radius: var(--radius-lg);
        box-shadow: 0 40px 60px -10px rgba(0,0,0,0.8);
        border: 1px solid rgba(255,255,255,0.05);
      }

      /* Promise Section */
      .promise-section {
        padding: 12rem 0;
        position: relative;
        background: var(--bg-primary);
        overflow: hidden;
      }
      .promise-bg {
        opacity: 0.08;
        position: absolute;
        inset: 0;
        background-size: cover;
        background-attachment: fixed;
        background-position: center;
        z-index: 0;
      }
      .promise-title {
        font-size: clamp(3.5rem, 8vw, 7.5rem);
        text-transform: uppercase;
        letter-spacing: -2px;
        line-height: 1;
        margin-bottom: var(--spacing-xl);
      }
      .promise-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        padding: var(--spacing-lg) 0;
      }
      .promise-item {
        padding: 0 var(--spacing-lg);
        border-right: 1px solid rgba(255,255,255,0.08);
      }
      .promise-item:last-child { border-right: none; }
      .promise-metric {
        font-size: clamp(2rem, 4vw, 3.5rem);
        font-family: var(--font-heading);
        color: var(--gold-primary);
        margin-bottom: 0.5rem;
      }
      .promise-label {
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 0.85rem;
        color: rgba(255,255,255,0.6);
        font-weight: 500;
      }

      @media (max-width: 992px) {
        .narrative-grid {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .narrative-desc, .editorial-desc {
          max-width: 100%;
        }
        .visual-container {
          height: 450px;
          margin-top: var(--spacing-xl);
        }
        .promise-grid {
          grid-template-columns: 1fr;
          gap: var(--spacing-xl);
        }
        .promise-item {
          border-right: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: var(--spacing-lg) 0;
        }
        .promise-item:last-child { border-bottom: none; }
        
        .editorial-flex, .editorial-flex.reverse {
          flex-direction: column;
          gap: 4rem;
          min-height: auto;
        }
        .pr-lg, .pl-lg {
          padding: 0;
          text-align: center;
          align-items: center !important;
        }
        .editorial-visual {
          width: 100%;
        }
        .editorial-visual.img-left .editorial-img-float,
        .editorial-visual.img-right .editorial-img-float {
          margin-top: 0;
          width: 100%;
        }
        .editorial-row {
          padding: 4rem 0 !important;
        }
      }
    </style>
  `;
}
