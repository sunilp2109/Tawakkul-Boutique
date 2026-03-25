import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
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

  let pageContent = '';
  if (path.startsWith('/product/') && path.length > 9) {
    const id = path.split('/')[2];
    pageContent = await ProductDetailPage(id);
  } else {
    const pageComponent = routes[path] || HomePage;
    pageContent = await pageComponent();
  }

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(15px) scale(0.99)';
    await new Promise(r => setTimeout(r, 250));
  }

  app.innerHTML = `
    ${Navbar()}
    <main class="page-transition" id="main-content" style="opacity:0; transform:translateY(15px) scale(0.99); transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
      ${pageContent}
    </main>
    ${Footer()}
  `;

  attachGlobalListeners();
  
  setTimeout(() => {
    const newMain = document.getElementById('main-content');
    if (newMain) {
      newMain.style.opacity = '1';
      newMain.style.transform = 'translateY(0) scale(1)';
    }
  }, 50);
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

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initMagneticButtons();
  initScrollReveal();
  router().then(() => updateCartBadge());
});

window.navigateTo = navigateTo;
window.refreshPage = router;
