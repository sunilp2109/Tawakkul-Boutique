import { getCartItemCount } from '../utils/cart.js';
import { getSettings } from '../utils/settings.js';

export function Navbar() {
  const settings = getSettings();
  const cartCount = getCartItemCount();
  const nameParts = (settings.storeName || 'Tawakkul Boutique').split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return `
    <header class="navbar">
      <div class="container nav-container">
        <a href="/" class="brand" data-link>
          ${firstName} <span class="brand-gold">${restName}</span>
        </a>
        
        <nav class="nav-links" id="nav-links">
          <a href="/" class="nav-link" data-link>Home</a>
          <a href="/products" class="nav-link" data-link>Products</a>
          <a href="/about" class="nav-link" data-link>About</a>
          <a href="/contact" class="nav-link" data-link>Contact</a>
        </nav>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 1rem;">
          <div class="nav-actions">
            <a href="/cart" class="cart-icon" data-link>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px;">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span class="cart-badge" id="nav-cart-badge" style="display: ${cartCount > 0 ? 'flex' : 'none'};">${cartCount}</span>
            </a>
          </div>
          
          <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">
            <i class="fas fa-bars fa-lg"></i>
          </button>
        </div>
      </div>
    </header>
  `;
}
