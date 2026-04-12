import { getCart, getCartTotal } from '../utils/cart.js';
import { formatPrice } from '../data/products.js';

window.submitCheckout = (event) => {
  event.preventDefault();
  
  const cart = getCart();
  if (cart.length === 0) {
    window.showToast("Your cart is empty!", "error");
    return;
  }

  // Get form values
  const name = document.getElementById('chk-name').value.trim();
  const email = document.getElementById('chk-email').value.trim();
  const phone = document.getElementById('chk-phone').value.trim();
  const address = document.getElementById('chk-address').value.trim();
  const city = document.getElementById('chk-city').value.trim();
  const pincode = document.getElementById('chk-pincode').value.trim();

  // Validate
  if (!name || !phone || !address || !city || !pincode) {
    window.showToast("Please fill in all required fields.", "error");
    return;
  }

  // Save for payment page
  sessionStorage.setItem('checkout_details', JSON.stringify({ name, email, phone, address, city, pincode }));

  // Redirect to Payment
  window.navigateTo('/payment');
};

export function CheckoutPage() {
  const cart = getCart();
  
  if (cart.length === 0) {
    // Redirect if cart is empty
    setTimeout(() => {
      window.navigateTo('/cart');
    }, 0);
    return `<div class="container section" style="text-align:center; min-height: 50vh;"><h2>Redirecting...</h2></div>`;
  }

  const subtotal = getCartTotal();
  const shipping = 59;
  const total = subtotal + shipping;

  const orderItemsHTML = cart.map(item => `
    <div class="checkout-item">
      <span>${item.quantity}x ${item.name}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  return `
    <div class="page-header" style="padding:var(--spacing-md) 0; margin-bottom:var(--spacing-lg); background-color:var(--bg-secondary); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/" data-link>Home</a> / <a href="/cart" data-link>Shopping Cart</a> / <span class="active">Checkout</span>
        </div>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-lg);">Checkout</h1>
        
        <div class="checkout-layout">
          <!-- Customer Details Form -->
          <div class="checkout-form-container">
            <h3>Shipping Details</h3>
            <form id="checkoutForm" onsubmit="submitCheckout(event)">
              
              <div class="form-row">
                <div class="input-group">
                  <label for="chk-name">Full Name *</label>
                  <input type="text" id="chk-name" class="form-control" required placeholder="Enter your full name">
                </div>
                
                <div class="input-group">
                  <label for="chk-phone">Phone Number *</label>
                  <input type="tel" id="chk-phone" class="form-control" required placeholder="e.g. +91 98765 43210">
                </div>
              </div>
              
              <div class="input-group">
                <label for="chk-email">Email Address (Optional)</label>
                <input type="email" id="chk-email" class="form-control" placeholder="yourname@example.com">
              </div>
              
              <div class="input-group">
                <label for="chk-address">Street Address *</label>
                <input type="text" id="chk-address" class="form-control" required placeholder="House No, Building, Street Name">
              </div>
              
              <div class="form-row">
                <div class="input-group">
                  <label for="chk-city">City *</label>
                  <input type="text" id="chk-city" class="form-control" required placeholder="e.g. Mumbai">
                </div>
                <div class="input-group">
                  <label for="chk-pincode">Pincode *</label>
                  <input type="text" id="chk-pincode" class="form-control" required placeholder="e.g. 400001">
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary w-100" style="margin-top: var(--spacing-md);">
                Proceed to Payment <i class="fas fa-arrow-right" style="margin-left: 0.5rem;"></i>
              </button>
            </form>
          </div>
          
          <!-- Order Summary -->
          <div class="checkout-summary">
            <h3>Order Summary</h3>
            <div class="checkout-items-list">
              ${orderItemsHTML}
            </div>
            
            <div class="summary-line">
              <span>Subtotal</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="summary-line">
              <span>Shipping</span>
              <span>${formatPrice(shipping)}</span>
            </div>
            <div class="summary-total checkout-total">
              <span>Total</span>
              <span style="color: var(--gold-primary);">${formatPrice(total)}</span>
            </div>
            
            <div class="payment-note" style="margin-top: 1.5rem; padding: 1rem; background: rgba(212,175,55,0.05); border: 1px dashed var(--gold-primary); border-radius: var(--radius-sm);">
               <i class="fas fa-shield-alt" style="color: var(--gold-primary); margin-right: 0.5rem;"></i>
               Secure checkout experience. Next step: Choose your payment method.
            </div>
          </div>
        </div>
      </div>
    </section>

    <style>
      .checkout-layout {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: var(--spacing-xl);
        align-items: flex-start;
      }
      
      .checkout-form-container, .checkout-summary {
        background-color: var(--bg-secondary);
        padding: var(--spacing-lg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }
      
      .checkout-form-container h3, .checkout-summary h3 {
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: 1px solid var(--border-color);
        font-family: var(--font-heading);
        color: var(--gold-primary);
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
      }
      
      .input-group {
        margin-bottom: 1.25rem;
      }
      
      .input-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .form-control {
        width: 100%;
        padding: 0.85rem 1rem;
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 1rem;
        transition: all var(--transition-fast);
      }
      
      .form-control:focus {
        outline: none;
        border-color: var(--gold-primary);
        box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
        background-color: var(--bg-tertiary);
      }

      .form-control::placeholder {
        color: var(--text-tertiary);
        opacity: 0.5;
      }
      
      .checkout-items-list {
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
      }
      
      .checkout-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
        color: var(--text-secondary);
      }
      
      .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
      }
      
      .checkout-total {
        display: flex;
        justify-content: space-between;
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
        font-size: 1.4rem;
        font-weight: 700;
      }
      
      @media (max-width: 992px) {
        .checkout-layout {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 576px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
      }
    </style>
  `;
}
