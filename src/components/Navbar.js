export function Navbar() {
  return `
    <header class="navbar">
      <div class="container nav-container">
        <a href="/" class="brand" data-link>
          Tawakkul <span class="brand-gold">Boutique</span>
        </a>
        
        <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">
          <i class="fas fa-bars fa-lg"></i>
        </button>

        <nav class="nav-links" id="nav-links">
          <a href="/" class="nav-link" data-link>Home</a>
          <a href="/products" class="nav-link" data-link>Products</a>
          <a href="/about" class="nav-link" data-link>About</a>
          <a href="/contact" class="nav-link" data-link>Contact</a>
        </nav>
      </div>
    </header>
  `;
}
