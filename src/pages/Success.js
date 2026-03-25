export function SuccessPage() {
  const orderId = sessionStorage.getItem('last_order_id') || 'ORDER-' + Math.floor(Math.random() * 1000000);
  
  return `
    <div class="container section" style="text-align:center; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <div class="success-icon" style="font-size: 5rem; color: #2ecc71; margin-bottom: 2rem;">
        <i class="fas fa-check-circle"></i>
      </div>
      <h1 class="text-gradient-gold" style="font-size: 3rem; margin-bottom: 1rem;">Order Placed!</h1>
      <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin-bottom: 2.5rem;">
        Thank you for choosing Tawakkul Boutique. Your order has been successfully received and is being processed.
      </p>
      
      <div class="order-info" style="background: var(--bg-secondary); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 3rem; width: 100%; max-width: 500px;">
        <p style="margin-bottom: 0.5rem; color: var(--text-tertiary); font-weight: 700; letter-spacing: 1px;">ORDER #${orderId}</p>
        <p>A confirmation email will be sent to you shortly with the shipping details.</p>
      </div>

      <div class="success-actions">
        <a href="/products" class="btn btn-primary" data-link>Explore More Products</a>
      </div>
    </div>
    
    <style>
      .success-icon {
        animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      @keyframes scaleUp {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    </style>
  `;
}
