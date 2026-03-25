import { fetchProductById, fetchProducts, getImageUrl } from '../utils/api.js';
import { formatPrice } from '../data/products.js';
import { addToCart } from '../utils/cart.js';

export async function ProductDetailPage(id) {
  const response = await fetchProductById(id);
  const product = response.data;

  let similarProducts = [];
  if (product && product.category) {
    try {
      // Fetch similar products from the same category
      const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
      const similarRes = await fetchProducts({ category: categoryName, limit: 5 });
      // Filter out the current product and take up to 4
      similarProducts = (similarRes.data || []).filter(p => p._id !== product._id).slice(0, 4);
    } catch (err) {
      console.error("Failed to fetch similar products:", err);
    }
  }
  
  window.handleAddToCart = (pid, name, price, img, isBuyNow = false) => {
    const customName = document.getElementById('customName')?.value || '';
    const customMessage = document.getElementById('customMessage')?.value || '';
    
    addToCart(
      { _id: pid, name, price, images: [img] }, 
      1, 
      { name: customName, message: customMessage }
    );
    
    if (!isBuyNow) {
      const btn = document.getElementById('addToCartBtn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check" style="margin-right:0.5rem"></i> Added!';
        btn.style.backgroundColor = 'var(--gold-primary)';
        btn.style.borderColor = 'var(--gold-primary)';
        btn.style.color = '#000';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      }
    }
  };
  
  window.handleBuyNow = (pid, name, price, img) => {
    window.handleAddToCart(pid, name, price, img, true);
    window.navigateTo('/cart');
  };

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
          <div class="product-gallery-container">
            <div class="product-gallery">
              <img src="${getImageUrl(product.images?.[0])}" alt="${product.name}" class="product-main-img" id="mainImage">
            </div>
            
            ${product.images && product.images.length > 1 ? `
              <div class="product-thumbnails">
                ${product.images.map((img, idx) => `
                  <div class="thumbnail ${idx === 0 ? 'active' : ''}" onclick="document.getElementById('mainImage').src='${getImageUrl(img)}'; document.querySelectorAll('.thumbnail').forEach(t=>t.classList.remove('active')); this.classList.add('active');">
                    <img src="${getImageUrl(img)}" alt="Thumbnail ${idx + 1}">
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="product-info">
            <div class="product-badge">${product.category?.name || product.category}</div>
            <h1 class="product-title">${product.name}</h1>
            <p class="product-price">${formatPrice(product.price)}</p>
            
            <div class="product-desc">
              <p>${product.description}</p>
            </div>
            
            <form class="customization-form" onsubmit="event.preventDefault()">
              <h3 style="margin-bottom: var(--spacing-md); font-family:var(--font-heading); font-size:1.2rem;">Customize Your Gift</h3>
              
              <div class="input-group">
                <label class="input-label" for="customName">Name(s) to be engraved/printed:</label>
                <input type="text" id="customName" class="input-field" placeholder="e.g. Ayesha & Omar">
              </div>
              
              <div class="input-group">
                <label class="input-label" for="customMessage">Special Message (Optional):</label>
                <textarea id="customMessage" class="input-field" placeholder="Any specific instructions or gift note..."></textarea>
              </div>
              
              <div class="product-actions">
                <button id="addToCartBtn" class="btn btn-outline btn-block" style="flex:1" type="button" onclick="handleAddToCart('${product._id}', '${product.name}', ${product.price}, '${product.images?.[0] || ''}')">
                  <i class="fas fa-shopping-cart" style="margin-right:0.5rem"></i> Add to Cart
                </button>
                <button class="btn btn-primary btn-block" style="flex:1" type="button" onclick="handleBuyNow('${product._id}', '${product.name}', ${product.price}, '${product.images?.[0] || ''}')">
                  <i class="fas fa-bolt" style="margin-right:0.5rem"></i> Buy Now
                </button>
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

    ${similarProducts.length > 0 ? `
    <section class="section">
      <div class="container">
        <h2 class="section-title" style="text-align: left; font-size: 1.8rem; margin-bottom: var(--spacing-lg);">Similar Products</h2>
        <div class="similar-products-grid">
          ${similarProducts.map(p => `
            <a href="/product/${p._id}" class="similar-card" data-link>
              <div class="similar-img-wrapper">
                <img src="${getImageUrl(p.images?.[0])}" alt="${p.name}" class="similar-img" loading="lazy">
              </div>
              <div class="similar-info">
                <h4 class="similar-title">${p.name}</h4>
                <p class="similar-price">${formatPrice(p.price)}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

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
        grid-template-columns: 1.5fr 1fr;
        gap: var(--spacing-xl);
        background-color: var(--bg-primary);
        align-items: flex-start;
      }
      
      .product-gallery-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .product-gallery {
        background-color: var(--bg-secondary);
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .product-main-img {
        width: 100%;
        height: auto;
        object-fit: cover;
        aspect-ratio: 3 / 3;
      }
      
      .product-thumbnails {
        display: flex;
        gap: var(--spacing-sm);
        overflow-x: auto;
        padding-bottom: var(--spacing-xs);
      }
      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        opacity: 0.6;
        transition: all var(--transition-fast);
        background-color: var(--bg-secondary);
        flex-shrink: 0;
      }
      .thumbnail:hover {
        opacity: 1;
      }
      .thumbnail.active {
        opacity: 1;
        border-color: var(--gold-primary);
      }
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .product-info {
        padding: 0;
      }
      .product-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: transparent;
        color: var(--gold-primary);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: var(--spacing-sm);
      }
      .product-title {
        font-size: 2.25rem;
        margin-bottom: var(--spacing-xs);
        letter-spacing: -0.5px;
        line-height: 1.2;
      }
      .product-price {
        font-size: 1.5rem;
        color: var(--text-primary);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
      }
      .product-desc {
        color: var(--text-secondary);
        line-height: 1.6;
        font-size: 1rem;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
      }
      
      .customization-form {
        background-color: transparent;
        padding: 0;
        border: none;
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
        padding: 1rem;
        justify-content: center;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
      }
      
      .trust-badges {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }
      .trust-badge {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: 0.85rem;
        padding: 0.5rem 0;
      }
      .trust-badge i {
        color: var(--gold-primary);
        font-size: 1rem;
      }
      .mt-lg {
        margin-top: var(--spacing-lg);
      }

      /* Similar Products Grid */
      .similar-products-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-md);
      }
      .similar-card {
        background: transparent;
        border-radius: var(--radius-sm);
        overflow: hidden;
        transition: transform var(--transition-fast);
        display: flex;
        flex-direction: column;
      }
      .similar-card:hover {
        transform: translateY(-5px);
      }
      .similar-img-wrapper {
        width: 100%;
        aspect-ratio: 4 / 5;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: var(--spacing-sm);
      }
      .similar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .similar-info {
        padding: var(--spacing-xs) 0;
      }
      .similar-title {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
        font-family: var(--font-body);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .similar-price {
        font-size: 1rem;
        color: var(--gold-primary);
        font-weight: 600;
      }

      @media (max-width: 992px) {
        .product-split {
          grid-template-columns: 1fr;
        }
        .product-actions {
          flex-direction: column;
        }
        .similar-products-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 576px) {
        .similar-products-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
