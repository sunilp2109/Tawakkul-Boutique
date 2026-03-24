import { products, categories, formatPrice } from '../data/products.js';

export function ProductsPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const currentCategory = searchParams.get('category') || 'All';
  
  const filteredProducts = currentCategory === 'All' 
    ? products 
    : products.filter(p => p.category === currentCategory);

  const productCardsHTML = filteredProducts.map(p => `
    <a href="/product/${p.id}" class="card" data-link>
      <div class="card-img-wrapper">
        <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <p class="card-price">${formatPrice(p.price)}</p>
        <button class="btn btn-outline" style="width:100%; margin-top:auto;" onclick="window.navigateTo('/product/${p.id}')">View Details</button>
      </div>
    </a>
  `).join('');

  const filterButtonsHTML = categories.map(c => `
    <a href="/products?category=${encodeURIComponent(c)}" 
       class="filter-btn ${c === currentCategory ? 'active' : ''}" data-link>
      ${c}
    </a>
  `).join('');

  return `
    <div class="page-header">
      <div class="container">
        <h1>Our Collection</h1>
        <p>Premium Islamic gifts curated for every special occasion.</p>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <div class="filters-container">
          ${filterButtonsHTML}
        </div>
        
        ${filteredProducts.length > 0 ? `
          <div class="products-grid">
            ${productCardsHTML}
          </div>
        ` : `
          <div style="text-align:center; padding: 4rem 0;">
            <i class="fas fa-box-open" style="font-size:3rem; color:var(--text-tertiary); margin-bottom:1rem;"></i>
            <h3>No products found in this category.</h3>
            <a href="/products" class="btn btn-outline" style="margin-top:1rem;" data-link>View All Products</a>
          </div>
        `}
      </div>
    </section>

    <style>
      .page-header {
        background-color: var(--bg-secondary);
        padding: var(--spacing-xl) 0;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: var(--spacing-lg);
      }
      .page-header h1 {
        font-size: 2.5rem;
        color: var(--gold-primary);
        margin-bottom: var(--spacing-sm);
      }
      .page-header p {
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
      }
      
      .pt-0 {
        padding-top: 0;
      }

      .filters-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xl);
        justify-content: center;
      }
      
      .filter-btn {
        display: inline-block;
        padding: 0.5rem 1.25rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-color);
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        font-size: 0.9rem;
        transition: all var(--transition-fast);
        cursor: pointer;
      }
      
      .filter-btn:hover {
        border-color: var(--gold-primary);
        color: var(--gold-primary);
      }
      
      .filter-btn.active {
        background-color: var(--gold-primary);
        color: #000;
        border-color: var(--gold-primary);
        font-weight: 600;
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--spacing-lg);
      }
    </style>
  `;
}
