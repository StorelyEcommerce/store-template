import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #e8e2d9',
      background: '#fdfcfa',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        padding: '3rem 1rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #d95f3d, #c4532f)',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: '1.125rem',
              }}>
                S
              </div>
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#2d2924',
              }}>
                Storely
              </span>
            </Link>
            <p style={{ color: '#6b635a', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Your destination for quality products and exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: '#2d2924',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              Quick Links
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/products" style={{ color: '#6b635a', fontSize: '0.875rem' }}>Shop All</Link>
              <Link to="/cart" style={{ color: '#6b635a', fontSize: '0.875rem' }}>Cart</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: '#2d2924',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              Contact
            </h4>
            <p style={{ color: '#6b635a', fontSize: '0.875rem' }}>
              support@storely.com
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid #e8e2d9',
          paddingTop: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#9a9285', fontSize: '0.875rem' }}>
            Powered by Storely, 2025 Storely
          </p>
        </div>
      </div>
    </footer>
  );
}

