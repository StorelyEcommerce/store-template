import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export function Header() {
  const location = useLocation();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(250, 248, 245, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e8e2d9',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              background: 'linear-gradient(135deg, #d95f3d, #c44a2a)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>S</span>
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.25rem', fontWeight: 500, color: '#2d2924' }}>Storely</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: location.pathname === link.to ? '#d95f3d' : '#6b635a',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '16rem',
                      padding: '0.5rem 0.75rem',
                      background: 'white',
                      border: '1px solid #e8e2d9',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#2d2924',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#6b635a',
                      cursor: 'pointer',
                    }}
                  >
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{
                    padding: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#6b635a',
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    transition: 'color 0.2s',
                  }}
                >
                  <Search style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: '#6b635a',
                transition: 'color 0.2s',
              }}
            >
              <ShoppingBag style={{ width: '1.25rem', height: '1.25rem' }} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  width: '1.25rem',
                  height: '1.25rem',
                  background: '#d95f3d',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#6b635a',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X style={{ width: '1.25rem', height: '1.25rem' }} /> : <Menu style={{ width: '1.25rem', height: '1.25rem' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{
          background: '#faf8f5',
          borderTop: '1px solid #e8e2d9',
        }}>
          <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: location.pathname === link.to ? '#d95f3d' : '#6b635a',
                  background: location.pathname === link.to ? 'rgba(217, 95, 61, 0.08)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
