export function AboutPage() {
  return `
    <div class="page-header">
      <div class="container">
        <h1>Our Story</h1>
        <p>Crafting memories through elegant Islamic gifts since 2018.</p>
      </div>
    </div>

    <section class="section pt-0">
      <div class="container">
        <div class="about-grid">
          <div class="about-image-col">
            <img src="/images/quran_set.png" alt="Tawakkul Boutique Story" class="about-img">
            <div class="about-image-accent"></div>
          </div>
          <div class="about-content">
            <h2 class="section-title" style="text-align:left; margin-bottom:var(--spacing-md);">Rooted in <span style="color:var(--gold-primary)">Tawakkul</span></h2>
            <p class="about-text">
              Tawakkul Boutique was founded in Chennai with a single vision: to provide premium, meaningful, and luxurious Islamic gifts that celebrate our faith and heritage.
            </p>
            <p class="about-text">
              We understand that a gift is more than just an item; it's a reflection of love, respect, and du'a for the receiver. This is why every piece we create is handcrafted with unmatched attention to detail, using only the finest materials.
            </p>
            <p class="about-text">
              From bespoke Nikah hampers to minimalist Quran sets, our aim is to bring elegance into your homes and blessings into your events. Trust in His plans, and let us handle your gifting.
            </p>
            
            <div class="stats-grid">
              <div class="stat-card">
                <h3>10k+</h3>
                <p>Happy Customers</p>
              </div>
              <div class="stat-card">
                <h3>5+</h3>
                <p>Years of Excellence</p>
              </div>
              <div class="stat-card">
                <h3>100%</h3>
                <p>Customizable</p>
              </div>
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

      .about-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-xxl);
        align-items: center;
        margin-top: var(--spacing-xl);
      }
      
      .about-image-col {
        position: relative;
      }
      .about-img {
        border-radius: var(--radius-md);
        position: relative;
        z-index: 2;
        width: 100%;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }
      .about-image-accent {
        position: absolute;
        top: -20px;
        left: -20px;
        width: 100%;
        height: 100%;
        border: 2px solid var(--gold-primary);
        border-radius: var(--radius-md);
        z-index: 1;
        opacity: 0.5;
      }
      
      .about-text {
        color: var(--text-secondary);
        font-size: 1.1rem;
        line-height: 1.8;
        margin-bottom: var(--spacing-md);
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-md);
        margin-top: var(--spacing-xl);
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--border-color);
      }
      
      .stat-card {
        text-align: center;
      }
      .stat-card h3 {
        color: var(--gold-primary);
        font-size: 2.5rem;
        margin-bottom: var(--spacing-xs);
        font-family: var(--font-heading);
      }
      .stat-card p {
        color: var(--text-secondary);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 500;
      }

      @media (max-width: 992px) {
        .about-grid {
          grid-template-columns: 1fr;
        }
        .about-image-accent {
          display: none;
        }
      }
    </style>
  `;
}
