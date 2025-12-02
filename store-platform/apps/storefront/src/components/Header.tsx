import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export function Header() {
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = getItemCount();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(250, 248, 244, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e8e2d9',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
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

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }} className="desktop-nav">
          <Link to="/products" style={{
            color: '#6b635a',
            fontSize: '0.9375rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}>
            Shop
          </Link>
          <Link to="/cart" style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b635a',
            fontSize: '0.9375rem',
            fontWeight: 500,
          }}>
            <ShoppingBag style={{ width: '1.25rem', height: '1.25rem' }} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                width: '1.25rem',
                height: '1.25rem',
                background: '#d95f3d',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#2d2924',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          borderBottom: '1px solid #e8e2d9',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#2d2924', fontWeight: 500, padding: '0.5rem 0' }}
          >
            Shop
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: '#2d2924',
              fontWeight: 500,
              padding: '0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShoppingBag size={18} />
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}

