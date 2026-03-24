import { products, formatPrice } from '../data/products.js';

export function ProductDetailPage(id) {
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return `
      <div class="container section" style="text-align:center;">
        <i class="fas fa-exclamation-circle" style="font-size:3rem; color:var(--error-color); margin-bottom:1rem;"></i>
        <h2>Product Not Found</h2>
        <p>The gift you are looking for does not exist.</p>
        <a href="/products" class="btn btn-primary" style="margin-top:1rem;" data-link>Back to Products</a>
      </div>
    `;
  }

  // Pre-fill WhatsApp message
  const waMessage = encodeURIComponent(`Hi Tawakkul Boutique! I am interested in buying the "${product.name}" for ${formatPrice(product.price)}.\n\nProduct Link: ${window.location.origin}/product/${product.id}\n\nPlease guide me with the ordering process.`);
  const waUrl = `https://wa.me/919876543210?text=${waMessage}`;

  return `
    <div class="page-header" style="padding:var(--spacing-md) 0; margin-bottom:var(--spacing-lg); background-color:var(--bg-secondary); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/" data-link>Home</a> / <a href="/products" data-link>Collection</a> / <span class="active">${product.name}</span>
        </div>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <div class="product-split">
          <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}" class="product-main-img">
          </div>
          
          <div class="product-info">
            <div class="product-badge">${product.category}</div>
            <h1 class="product-title">${product.name}</h1>
            <p class="product-price">${formatPrice(product.price)}</p>
            
            <div class="product-desc">
              <p>${product.description}</p>
            </div>
            
            <form class="customization-form" onsubmit="event.preventDefault()">
              <h3 style="margin-bottom: var(--spacing-md); font-family:var(--font-heading); font-size:1.5rem;">Customize Your Gift</h3>
              
              <div class="input-group">
                <label class="input-label" for="customName">Name(s) to be engraved/printed:</label>
                <input type="text" id="customName" class="input-field" placeholder="e.g. Ayesha & Omar">
              </div>
              
              <div class="input-group">
                <label class="input-label" for="customMessage">Special Message (Optional):</label>
                <textarea id="customMessage" class="input-field" placeholder="Any specific instructions or gift note..."></textarea>
              </div>
              
              <div class="product-actions">
                <button class="btn btn-primary btn-block" style="flex:1" type="button" onclick="alert('Added to cart mock')">
                  <i class="fas fa-shopping-bag" style="margin-right:0.5rem"></i> Buy Now
                </button>
                <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-block" style="flex:1">
                  <i class="fab fa-whatsapp" style="margin-right:0.5rem"></i> Order via WhatsApp
                </a>
              </div>
            </form>
            
            <div class="trust-badges mt-lg">
              <div class="trust-badge">
                <i class="fas fa-check-circle"></i> Premium Quality
              </div>
              <div class="trust-badge">
                <i class="fas fa-box"></i> Secure Packaging
              </div>
              <div class="trust-badge">
                <i class="fas fa-lock"></i> 100% Safe Payments
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <style>
      .breadcrumbs {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      .breadcrumbs a {
        color: var(--text-secondary);
      }
      .breadcrumbs a:hover {
        color: var(--gold-primary);
      }
      .breadcrumbs .active {
        color: var(--gold-primary);
      }
      
      .pt-0 { padding-top: 0; }

      .product-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-xl);
        background-color: var(--bg-secondary);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
        overflow: hidden;
      }
      
      .product-gallery {
        background-color: var(--bg-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .product-main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        aspect-ratio: 1;
      }
      
      .product-info {
        padding: var(--spacing-xl);
      }
      .product-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--gold-super-light);
        color: var(--gold-primary);
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-radius: var(--radius-full);
        margin-bottom: var(--spacing-md);
        border: 1px solid var(--gold-primary);
      }
      .product-title {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-sm);
        letter-spacing: -0.5px;
      }
      .product-price {
        font-size: 2rem;
        color: var(--gold-primary);
        font-weight: 600;
        margin-bottom: var(--spacing-lg);
      }
      .product-desc {
        color: var(--text-secondary);
        line-height: 1.8;
        font-size: 1.05rem;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
      }
      
      .customization-form {
        background-color: var(--bg-tertiary);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        margin-bottom: var(--spacing-lg);
      }
      
      .product-actions {
        display: flex;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
      }
      .btn-block {
        display: flex;
        width: 100%;
      }
      
      .trust-badges {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
      }
      .trust-badge {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: 0.95rem;
        padding: 0.75rem;
        background-color: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: var(--radius-sm);
      }
      .trust-badge i {
        color: var(--gold-primary);
        font-size: 1.1rem;
      }
      .mt-lg {
        margin-top: var(--spacing-lg);
      }

      @media (max-width: 992px) {
        .product-split {
          grid-template-columns: 1fr;
        }
        .product-info {
          padding: var(--spacing-lg);
        }
        .product-actions {
          flex-direction: column;
        }
      }
    </style>
  `;
}
