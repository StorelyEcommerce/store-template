import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, Product } from '../api/client';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data.slice(0, 4)); // Show first 4 products
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #faf8f4 0%, #f5f1eb 100%)',
        padding: '5rem 1rem',
        textAlign: 'center',
      }}>
        <div className="container animate-fade-in">
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 600,
            color: '#2d2924',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Discover Quality<br />Products
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b635a',
            maxWidth: '32rem',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            Handpicked items for your everyday life. Simple, beautiful, and built to last.
          </p>
          <Link to="/products" className="btn btn-primary" style={{
            fontSize: '1rem',
            padding: '1rem 2rem',
          }}>
            Shop Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '5rem 1rem' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#2d2924',
            }}>
              Featured Products
            </h2>
            <Link to="/products" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#d95f3d',
              fontWeight: 500,
              fontSize: '0.9375rem',
            }}>
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '4rem 0',
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: '2px solid #e8e2d9',
                borderTopColor: '#d95f3d',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: '#2d2924',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 600,
            color: '#faf8f4',
            marginBottom: '1rem',
          }}>
            Ready to Start Shopping?
          </h2>
          <p style={{
            color: '#9a9285',
            marginBottom: '2rem',
            maxWidth: '28rem',
            margin: '0 auto 2rem',
          }}>
            Browse our full collection of quality products.
          </p>
          <Link to="/products" className="btn" style={{
            background: '#d95f3d',
            color: 'white',
            padding: '1rem 2rem',
          }}>
            Browse Collection
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

