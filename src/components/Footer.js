import { getSettings } from '../utils/settings.js';

export function Footer() {
  const settings = getSettings();
  const nameParts = (settings.storeName || 'Tawakkul Boutique').split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');
  
  const instagram = settings.socialLinks?.instagram || 'https://instagram.com';
  const whatsapp = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}` : 'https://wa.me/919876543210';
  const email = settings.storeEmail || 'contact@tawakkulboutique.com';
  const address = settings.storeAddress || 'Chennai, Tamil Nadu, India';

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col" style="max-width:300px">
            <h4><span style="color:var(--text-primary)">${firstName}</span> ${restName}</h4>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: var(--spacing-sm);">
              Premium customized Islamic gifts crafted with excellence. Delivering joy across India.
            </p>
            <div class="footer-social">
              <a href="${instagram}" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="${whatsapp}" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
              <a href="mailto:${email}" aria-label="Email"><i class="far fa-envelope"></i></a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Quick Links</h4>
            <div class="footer-links">
              <a href="/" data-link>Home</a>
              <a href="/products" data-link>Shop All Gifts</a>
              <a href="/about" data-link>Our Story</a>
              <a href="/contact" data-link>Contact Us</a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Categories</h4>
            <div class="footer-links">
              <a href="/products?category=Gift Boxes" data-link>Gift Boxes</a>
              <a href="/products?category=Islamic Frames" data-link>Islamic Frames</a>
              <a href="/products?category=Nikah Gifts" data-link>Nikah Gifts</a>
              <a href="/products?category=Eid Specials" data-link>Eid Specials</a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Contact Info</h4>
            <div class="footer-links">
              <a href="${whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i> ${settings.storePhone || '+91 98765 43210'}</a>
              <a href="mailto:${email}"><i class="far fa-envelope"></i> ${email}</a>
              <span style="color: var(--text-secondary);"><i class="fas fa-map-marker-alt"></i> ${address}</span>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          &copy; 2026 Tawakkul Boutique. All rights reserved.
        </div>
      </div>
    </footer>
  `;
}
