import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, getCartItemCount } from '../utils/cart.js';
import { getImageUrl } from '../utils/api.js';
import { formatPrice } from '../data/products.js';

window.updateQuantity = (index, qty) => {
  const result = updateCartItemQuantity(index, qty);
  if (result && !result.success) {
    window.showToast(result.message, 'error');
  } else {
    if (window.refreshPage) window.refreshPage();
  }
};

window.removeItem = (index) => {
  removeFromCart(index);
  if (window.refreshPage) window.refreshPage();
};

window.checkoutWhatsApp = () => {
  const cart = getCart();
  if (cart.length === 0) return;

  let message = `Hi Tawakkul Boutique! I would like to place an order for the following items:\n\n`;
  cart.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${formatPrice(item.price * item.quantity)}\n`;
    if (item.customData?.name) message += `   Custom Name: ${item.customData.name}\n`;
    if (item.customData?.message) message += `   Message: ${item.customData.message}\n`;
    message += `\n`;
  });

  const total = getCartTotal();
  message += `*Total Amount:* ${formatPrice(total)}\n\n`;
  message += `Please guide me with the payment and delivery process.`;

  const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
};

export function CartPage() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const count = getCartItemCount();
  const shipping = 59;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return `
      <div class="page-header">
        <div class="container">
          <h1>Your Shopping Cart</h1>
        </div>
      </div>
      <section class="section pt-0" style="text-align:center; padding: 4rem 0;">
        <i class="fas fa-shopping-cart" style="font-size:3rem; color:var(--border-active); margin-bottom:1rem;"></i>
        <h2>Your cart is currently empty.</h2>
        <p style="color:var(--text-secondary); margin-bottom: 2rem;">Take a look at our collection and discover premium Islamic gifts.</p>
        <a href="/products" class="btn btn-primary" data-link>Continue Shopping</a>
      </section>
    `;
  }

  const cartItemsHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${getImageUrl(item.image)}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title"><a href="/product/${item._id}" data-link>${item.name}</a></h3>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
        
        ${item.customData?.name ? `<p class="cart-item-custom"><b>Name:</b> ${item.customData.name}</p>` : ''}
        ${item.customData?.message ? `<p class="cart-item-custom"><b>Note:</b> ${item.customData.message}</p>` : ''}
        
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
        </div>
        <p class="cart-item-subtotal">${formatPrice(item.price * item.quantity)}</p>
        <button class="remove-btn" onclick="removeItem(${index})" title="Remove item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header" style="padding:var(--spacing-md) 0; margin-bottom:var(--spacing-lg); background-color:var(--bg-secondary); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/" data-link>Home</a> / <span class="active">Shopping Cart (${count})</span>
        </div>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-lg);">Your Cart</h1>
        
        <div class="cart-layout">
          <div class="cart-items-container">
            ${cartItemsHTML}
          </div>
          
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal (${count} items)</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>${formatPrice(shipping)}</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>${formatPrice(total)}</span>
            </div>
            <p style="font-size: 0.85rem; color:var(--text-secondary); margin-bottom: 1.5rem; text-align: center;">Taxes included in total price.</p>
            
            <a href="/checkout" class="btn btn-primary w-100" style="text-align: center;" data-link>
              <i class="fas fa-lock" style="margin-right: 0.5rem;"></i> Proceed to Checkout
            </a>
            <a href="/products" class="btn btn-outline w-100" style="margin-top: var(--spacing-sm); text-align: center;" data-link>
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </section>

    <style>
      .breadcrumbs {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      .breadcrumbs a { color: var(--text-secondary); }
      .breadcrumbs a:hover { color: var(--gold-primary); }
      .breadcrumbs .active { color: var(--gold-primary); }
      .pt-0 { padding-top: 0; }
      
      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: var(--spacing-xl);
        align-items: flex-start;
      }
      
      .cart-items-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .cart-item {
        display: grid;
        grid-template-columns: 100px 1fr auto;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        align-items: center;
      }
      
      .cart-item-image {
        width: 100px;
        aspect-ratio: 1;
        border-radius: var(--radius-sm);
        overflow: hidden;
      }
      
      .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .cart-item-title {
        font-size: 1.2rem;
        margin-bottom: 0.25rem;
      }
      .cart-item-price {
        color: var(--gold-primary);
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      .cart-item-custom {
        font-size: 0.85rem;
        color: var(--text-secondary);
        background-color: var(--bg-primary);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        display: inline-block;
        margin-top: 0.25rem;
      }
      
      .cart-item-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-md);
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }
      .qty-btn {
        background-color: transparent;
        color: var(--text-primary);
        border: none;
        padding: 0.25rem 0.75rem;
        cursor: pointer;
        font-size: 1.1rem;
      }
      .qty-btn:hover {
        background-color: var(--border-active);
      }
      .qty-display {
        padding: 0 0.75rem;
        font-weight: 600;
      }
      
      .cart-item-subtotal {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .remove-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: color var(--transition-fast);
      }
      .remove-btn:hover {
        color: #ff4d4d;
      }
      
      .cart-summary {
        background-color: var(--bg-secondary);
        padding: var(--spacing-lg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        position: sticky;
        top: 100px;
      }
      
      .cart-summary h3 {
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: 1px solid var(--border-color);
      }
      
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
      }
      
      .summary-total {
        display: flex;
        justify-content: space-between;
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--gold-primary);
        margin-bottom: var(--spacing-md);
      }
      
      .w-100 {
        width: 100%;
        display: block;
      }
      
      @media (max-width: 992px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .cart-summary {
          position: static;
        }
      }
      @media (max-width: 576px) {
        .cart-item {
          grid-template-columns: 80px 1fr;
        }
        .cart-item-actions {
          grid-column: 1 / -1;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: var(--spacing-md);
          margin-top: var(--spacing-xs);
        }
      }
    </style>
  `;
}
