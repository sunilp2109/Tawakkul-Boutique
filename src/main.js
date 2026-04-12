import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Loader } from './components/Loader.js';
import { HomePage } from './pages/Home.js';
import { ProductsPage } from './pages/Products.js';
import { ProductDetailPage } from './pages/ProductDetail.js';
import { AboutPage } from './pages/About.js';
import { ContactPage } from './pages/Contact.js';
import { CartPage } from './pages/Cart.js';
import { CheckoutPage } from './pages/Checkout.js';
import { PaymentPage } from './pages/Payment.js';
import { SuccessPage } from './pages/Success.js';
import { initCustomCursor, initMagneticButtons, initScrollReveal } from './utils/animations.js';
import { getCartItemCount } from './utils/cart.js';
import { initSettings } from './utils/settings.js';

const routes = {
  '/': HomePage,
  '/products': ProductsPage,
  '/about': AboutPage,
  '/contact': ContactPage,
  '/cart': CartPage,
  '/checkout': CheckoutPage,
  '/payment': PaymentPage,
  '/success': SuccessPage,
};

const router = async () => {
  const app = document.getElementById('app');
  let path = window.location.pathname;

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  // Show loader during transition
  const currentMain = document.getElementById('main-content');
  if (currentMain) {
    currentMain.style.opacity = '0';
    currentMain.style.transform = 'translateY(10px)';
  }

  // If this is the first load, the initial loader is in index.html
  // Otherwise, we inject a loader into the app root while fetching
  if (!document.getElementById('initial-loader')) {
    app.insertAdjacentHTML('beforeend', Loader());
  }

  let pageContent = '';
  try {
    if (path.startsWith('/product/') && path.length > 9) {
      const id = path.split('/')[2];
      pageContent = await ProductDetailPage(id);
      // Title is set inside ProductDetailPage as it needs product data
    } else {
      const titles = {
        '/': 'Tawakkul Boutique',
        '/products': 'Shop All | Tawakkul Boutique',
        '/about': 'About Us | Tawakkul Boutique',
        '/contact': 'Contact Us | Tawakkul Boutique',
        '/cart': 'Cart | Tawakkul Boutique',
        '/checkout': 'Checkout | Tawakkul Boutique',
        '/payment': 'Payment | Tawakkul Boutique',
        '/success': 'Order Successful | Tawakkul Boutique',
      };
      document.title = titles[path] || 'Tawakkul Boutique';
      
      const pageComponent = routes[path] || HomePage;
      pageContent = await pageComponent();
    }
  } catch (error) {
    console.error('Routing error:', error);
    pageContent = `<div class="container section"><h2>Error loading page</h2><p>${error.message}</p></div>`;
  }

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(15px) scale(0.99)';
    await new Promise(r => setTimeout(r, 250));
  }

  app.innerHTML = `
    ${Navbar()}
    <main class="page-transition" id="main-content" style="opacity:0; transform:translateY(15px) scale(0.99); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
      ${pageContent}
    </main>
    ${Footer()}
  `;

  attachGlobalListeners();
  
  // Smoothly reveal content
  requestAnimationFrame(() => {
    const newMain = document.getElementById('main-content');
    if (newMain) {
      // Small timeout to ensure DOM update is painted
      setTimeout(() => {
        newMain.style.opacity = '1';
        newMain.style.transform = 'translateY(0) scale(1)';
        updateCartBadge();
      }, 50);
    }
  });
};

const navigateTo = (url) => {
  if (window.location.pathname === url) return;
  history.pushState(null, null, url);
  router();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const attachGlobalListeners = () => {
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute('href');
      navigateTo(href);
    });
  });

  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (currentPath.startsWith('/product/') && link.getAttribute('href') === '/products') {
      link.classList.add('active');
    } else if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

window.addEventListener('popstate', router);

const updateCartBadge = () => {
  const badge = document.getElementById('nav-cart-badge');
  if (badge) {
    const count = getCartItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
};
window.addEventListener('cartUpdated', updateCartBadge);

document.addEventListener('DOMContentLoaded', async () => {
  initCustomCursor();
  initMagneticButtons();
  initScrollReveal();
  
  // Load dynamic store settings first
  await initSettings();
  
  router().then(() => updateCartBadge());
});

window.navigateTo = navigateTo;
window.refreshPage = router;

// Global Toast Notification System
window.showToast = (message, type = 'info') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isError = type === 'error';
  const icon = isError ? 'fa-exclamation-circle' : 'fa-check-circle';
  const color = isError ? '#d9534f' : 'var(--gold-primary)';
  const textColor = isError ? '#fff' : '#000';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.style.cssText = `
    min-width: 280px;
    background-color: ${isError ? '#c9302c' : 'var(--gold-primary)'};
    color: ${textColor};
    padding: 1rem 1.5rem;
    border-radius: var(--radius-sm);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 500;
    opacity: 0;
    transform: translateX(50px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0) scale(1)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px) scale(0.95)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};
