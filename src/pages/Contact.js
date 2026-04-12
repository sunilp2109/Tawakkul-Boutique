import { getSettings } from '../utils/settings.js';

export function ContactPage() {
  const settings = getSettings();
  const email = settings.storeEmail || 'contact@tawakkulboutique.com';
  const whatsappNumber = settings.whatsappNumber || '919876543210';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
  const address = settings.storeAddress || 'Chennai, Tamil Nadu, India';
  const instagram = settings.socialLinks?.instagram || 'https://instagram.com';

  return `
    <div class="page-header">
      <div class="container">
        <h1>Contact Us</h1>
        <p>We are here to help you customize the perfect gift.</p>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <div class="contact-grid">
          
          <div class="contact-info-col">
            <h2 class="section-title" style="text-align:left; font-size:2rem; margin-bottom:var(--spacing-md);">Get in Touch</h2>
            <p style="color:var(--text-secondary); margin-bottom:var(--spacing-lg); font-size:1.1rem; line-height:1.6;">
              Have a question about a product or need a bulk order for a Nikah? Reach out to us through WhatsApp for the fastest response!
            </p>
            
            <div class="contact-card">
              <div class="contact-icon"><i class="fab fa-whatsapp"></i></div>
              <div class="contact-details">
                <h3>WhatsApp Us</h3>
                <p>${settings.storePhone || '+91 98765 43210'} (Preferred)</p>
                <a href="${whatsappLink}" target="_blank" class="contact-link">Message Now &rarr;</a>
              </div>
            </div>
            
            <div class="contact-card">
              <div class="contact-icon"><i class="far fa-envelope"></i></div>
              <div class="contact-details">
                <h3>Email Us</h3>
                <p>${email}</p>
                <a href="mailto:${email}" class="contact-link">Send Email &rarr;</a>
              </div>
            </div>
            
            <div class="contact-card">
              <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
              <div class="contact-details">
                <h3>Location</h3>
                <p>${address}<br><span style="color:var(--gold-primary); font-size:0.85rem">(Online Store Only)</span></p>
              </div>
            </div>

            <div class="contact-card">
              <div class="contact-icon"><i class="fab fa-instagram"></i></div>
              <div class="contact-details">
                <h3>Instagram</h3>
                <p>${instagram.split('/').pop() || '@tawakkul.boutique'}</p>
                <a href="${instagram}" target="_blank" class="contact-link">Follow Us &rarr;</a>
              </div>
            </div>

          </div>
          
          <div class="contact-form-col">
            <div class="form-container">
              <h3 style="font-family:var(--font-heading); font-size:1.75rem; margin-bottom:var(--spacing-lg); border-bottom:1px solid var(--border-color); padding-bottom:var(--spacing-sm);">Send an Inquiry</h3>
              <form onsubmit="event.preventDefault(); window.showToast('Message Sent Successfully!', 'success');">
                <div class="input-group">
                  <label class="input-label" for="name">Full Name</label>
                  <input type="text" id="name" class="input-field" required placeholder="Your full name">
                </div>
                
                <div class="input-group">
                  <label class="input-label" for="email">Email Address</label>
                  <input type="email" id="email" class="input-field" required placeholder="your@email.com">
                </div>
                
                <div class="input-group">
                  <label class="input-label" for="subject">Subject</label>
                  <input type="text" id="subject" class="input-field" required placeholder="e.g. Bulk Order Inquiry">
                </div>
                
                <div class="input-group">
                  <label class="input-label" for="message">Your Message</label>
                  <textarea id="message" class="input-field" required placeholder="How can we help you?"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:var(--spacing-md); padding:1rem;">
                  <i class="far fa-paper-plane" style="margin-right:0.5rem;"></i> Send Message
                </button>
              </form>
            </div>
          </div>
          
        </div>
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

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-xxl);
        margin-top: var(--spacing-lg);
      }
      
      .contact-card {
        display: flex;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
        background-color: var(--bg-secondary);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      }
      .contact-card:hover {
        transform: translateX(8px);
        border-color: var(--gold-primary);
        box-shadow: var(--shadow-md);
      }
      
      .contact-icon {
        width: 60px;
        height: 60px;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        color: var(--gold-primary);
        flex-shrink: 0;
        border: 1px solid rgba(212,175,55,0.2);
      }
      
      .contact-details h3 {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
      }
      .contact-details p {
        color: var(--text-secondary);
        font-size: 0.95rem;
        margin-bottom: var(--spacing-sm);
        line-height: 1.4;
      }
      .contact-link {
        color: var(--gold-primary);
        font-size: 0.9rem;
        font-weight: 600;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .contact-link:hover {
        color: var(--gold-secondary);
        text-decoration: underline;
      }
      
      .form-container {
        background-color: var(--bg-secondary);
        padding: var(--spacing-xl);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-md);
      }

      @media (max-width: 992px) {
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
