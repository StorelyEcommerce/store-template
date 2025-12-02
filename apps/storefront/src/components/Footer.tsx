import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{
      background: '#f5f1eb',
      borderTop: '1px solid #e8e2d9',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '3rem 1rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #d95f3d, #c44a2a)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>S</span>
              </div>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.25rem', fontWeight: 500, color: '#2d2924' }}>Storely</span>
            </Link>
            <p style={{
              marginTop: '1rem',
              color: '#4a443d',
              fontSize: '0.9375rem',
              maxWidth: '24rem',
              lineHeight: 1.6,
            }}>
              Discover amazing products curated just for you. Quality meets style in every item we offer.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontWeight: 600, color: '#2d2924', marginBottom: '1rem', fontFamily: "'Source Sans 3', sans-serif" }}>Shop</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link to="/products" style={{ fontSize: '0.9375rem', color: '#4a443d', transition: 'color 0.2s' }}>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ fontSize: '0.9375rem', color: '#4a443d', transition: 'color 0.2s' }}>
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 600, color: '#2d2924', marginBottom: '1rem', fontFamily: "'Source Sans 3', sans-serif" }}>Support</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <a href="mailto:support@storely.com" style={{ fontSize: '0.9375rem', color: '#4a443d', transition: 'color 0.2s' }}>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e8e2d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#6b635a' }}>
            © 2025 Storely. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontSize: '0.8125rem',
              color: '#6b635a',
            }}>
              Powered by Storely
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
