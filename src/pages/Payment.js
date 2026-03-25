import { getCart, getCartTotal, clearCart } from '../utils/cart.js';
import { formatPrice } from '../data/products.js';
import { createOrder } from '../utils/api.js';

window.completeOrder = async () => {
  const cart = getCart();
  const details = JSON.parse(sessionStorage.getItem('checkout_details') || '{}');

  if (!details.name) {
    alert("Order details missing. Please go back to checkout.");
    return;
  }

  const btn = document.querySelector('.btn-primary');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    const subtotal = getCartTotal();
    const shippingFee = 59;
    
    const orderData = {
      customer: {
        name: details.name,
        phone: details.phone,
        address: details.address,
        city: details.city,
        pincode: details.pincode,
        email: details.email
      },
      items: cart.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customData || {}
      })),
      totalAmount: subtotal + shippingFee,
      shippingFee: shippingFee,
      source: 'Website'
    };

    const response = await createOrder(orderData);
    
    if (response.success) {
      // Save order number for success page
      sessionStorage.setItem('last_order_id', response.data.orderNumber);
      
      // Clear cart and storage
      clearCart();
      sessionStorage.removeItem('checkout_details');
      window.navigateTo('/success');
    } else {
      throw new Error(response.message || "Failed to place order.");
    }
  } catch (error) {
    console.error("Order Error:", error);
    alert("Something went wrong while placing your order. Please try again.");
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};

export function PaymentPage() {
  const cart = getCart();
  const details = JSON.parse(sessionStorage.getItem('checkout_details') || '{}');

  if (cart.length === 0 || !details.name) {
    setTimeout(() => window.navigateTo('/cart'), 0);
    return `<div class="container section"><h2>Redirecting...</h2></div>`;
  }

  const subtotal = getCartTotal();
  const shipping = 59;
  const total = subtotal + shipping;

  return `
    <div class="page-header" style="padding:var(--spacing-md) 0; margin-bottom:var(--spacing-lg); background-color:var(--bg-secondary); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/" data-link>Home</a> / <a href="/cart" data-link>Cart</a> / <a href="/checkout" data-link>Checkout</a> / <span class="active">Payment</span>
        </div>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <div class="payment-grid">
          <div class="payment-options-container">
            <h1 style="font-size: 2rem; margin-bottom: var(--spacing-lg);">Choose Payment Method</h1>
            
            <div class="payment-methods">
              <label class="payment-method-card active">
                <input type="radio" name="payment_method" value="UPI" checked style="display:none">
                <div class="method-info">
                  <i class="fas fa-mobile-alt method-icon"></i>
                  <div>
                    <h4>UPI / Google Pay / PhonePe</h4>
                    <p>Easy and fast payment using any UPI app</p>
                  </div>
                </div>
                <div class="method-check"><i class="fas fa-check-circle"></i></div>
              </label>

              <label class="payment-method-card">
                <input type="radio" name="payment_method" value="Card" style="display:none">
                <div class="method-info">
                  <i class="fas fa-credit-card method-icon"></i>
                  <div>
                    <h4>Credit / Debit Card</h4>
                    <p>Secure payment via Visa, Mastercard, or RuPay</p>
                  </div>
                </div>
                <div class="method-check"><i class="fas fa-check-circle"></i></div>
              </label>

              <label class="payment-method-card">
                <input type="radio" name="payment_method" value="Bank Transfer" style="display:none">
                <div class="method-info">
                  <i class="fas fa-university method-icon"></i>
                  <div>
                    <h4>Net Banking</h4>
                    <p>Pay directly from your bank account</p>
                  </div>
                </div>
                <div class="method-check"><i class="fas fa-check-circle"></i></div>
              </label>
            </div>

            <div class="qr-container" style="margin-top: 2rem; text-align: center; padding: 2rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
              <h3 style="margin-bottom: 1rem; color: var(--gold-primary);">Scan to Pay</h3>
              <div style="background: white; padding: 1rem; display: inline-block; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <!-- Placeholder for QR Code - generating a visual placeholder -->
                <div style="width: 180px; height: 180px; background: #f0f0f0; border: 2px solid #ddd; position: relative;">
                  <div style="position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); color: #666; font-size: 0.8rem;">[MOCK QR CODE]</div>
                </div>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-secondary);">Scan this QR with any UPI app to pay ₹${total}</p>
            </div>

            <button class="btn btn-primary w-100" style="margin-top: 2rem; padding: 1.25rem;" onclick="completeOrder()">
               Confirm Payment & Finalize Order <i class="fas fa-check-circle" style="margin-left: 0.5rem;"></i>
            </button>
          </div>

          <div class="order-recap">
            <h3>Ship To</h3>
            <div class="recap-details">
              <p><strong>${details.name}</strong></p>
              <p>${details.address}</p>
              <p>${details.city} - ${details.pincode}</p>
              <p>${details.phone}</p>
            </div>

            <h3 style="margin-top: var(--spacing-lg);">Total Amount</h3>
            <div class="final-price">
              <span>Payable Now</span>
              <span class="price-val">${formatPrice(total)}</span>
            </div>
            
            <div class="security-badge">
              <i class="fas fa-lock"></i>
              <span>SSL Secure & Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <style>
      .payment-grid {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: var(--spacing-xl);
        align-items: flex-start;
      }

      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .payment-method-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .payment-method-card:hover {
        border-color: var(--gold-primary);
        background: rgba(212, 175, 55, 0.05);
      }

      .payment-method-card.active {
        border-color: var(--gold-primary);
        background: rgba(212, 175, 55, 0.1);
      }

      .method-info {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .method-icon {
        font-size: 1.8rem;
        color: var(--gold-primary);
        width: 40px;
        text-align: center;
      }

      .method-info h4 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-primary);
      }

      .method-info p {
        margin: 0.25rem 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }

      .method-check {
        color: var(--gold-secondary);
        font-size: 1.4rem;
        opacity: 0.2;
      }

      .payment-method-card.active .method-check {
        opacity: 1;
      }

      .order-recap {
        background: var(--bg-tertiary);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
        position: sticky;
        top: 100px;
      }

      .order-recap h3 {
        font-family: var(--font-heading);
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--gold-primary);
      }

      .recap-details p {
        margin: 0.25rem 0;
        color: var(--text-secondary);
      }

      .final-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .price-val {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--gold-primary);
      }

      .security-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 2rem;
        font-size: 0.85rem;
        color: #2ecc71;
      }

      @media (max-width: 992px) {
        .payment-grid {
          grid-template-columns: 1fr;
        }
        .order-recap {
          position: static;
        }
      }
    </style>
  `;
}
