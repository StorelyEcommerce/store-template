import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Award, Shield } from 'lucide-react';
import { api, Product } from '../api/client';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await api.getProducts();
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%)',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(232, 120, 90, 0.06), transparent 40%), radial-gradient(circle at 80% 70%, rgba(196, 189, 178, 0.15), transparent 40%)',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          textAlign: 'center',
        }}>
          <div className="animate-fade-in">
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontFamily: "'Fraunces', Georgia, serif",
              color: '#2d2924',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 500,
            }}>
              Shop with
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #d95f3d, #a33c22)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Confidence</span>
            </h1>
            
            <p style={{
              marginTop: '1.5rem',
              fontSize: '1.125rem',
              color: '#4a443d',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.7,
            }}>
              Discover a curated collection of exceptional products. 
              Quality craftsmanship meets modern design.
            </p>
            
            <div style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}>
              <Link to="/products" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Browse Collection
                <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </Link>
              <Link to="/products" className="btn btn-secondary" style={{ fontSize: '1rem' }}>
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '5rem 0', background: '#fefdfb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontFamily: "'Fraunces', Georgia, serif",
                color: '#2d2924',
                fontWeight: 500,
              }}>
                Featured Products
              </h2>
              <p style={{ marginTop: '0.5rem', color: '#4a443d' }}>
                Our most popular items, handpicked for you
              </p>
            </div>
            <Link
              to="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#d95f3d',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              View all
              <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card" style={{ animation: 'pulse 2s infinite' }}>
                  <div style={{ aspectRatio: '1', background: '#f5f1eb' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '1.25rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '75%' }} />
                    <div style={{ height: '1rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '100%', marginTop: '0.75rem' }} />
                    <div style={{ height: '1.5rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '33%', marginTop: '0.75rem' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/products" className="btn btn-secondary">
              View all products
              <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section style={{
        padding: '5rem 0',
        background: '#f5f1eb',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 2rem',
              borderRadius: '1rem',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto',
                background: 'rgba(217, 95, 61, 0.08)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Truck style={{ width: '1.75rem', height: '1.75rem', color: '#d95f3d' }} />
              </div>
              <h3 style={{ marginTop: '1.25rem', fontSize: '1.125rem', fontWeight: 600, color: '#2d2924', fontFamily: "'Source Sans 3', sans-serif" }}>Fast Delivery</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#4a443d', lineHeight: 1.6 }}>Quick and reliable shipping to your doorstep</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 2rem',
              borderRadius: '1rem',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto',
                background: 'rgba(217, 95, 61, 0.08)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Award style={{ width: '1.75rem', height: '1.75rem', color: '#d95f3d' }} />
              </div>
              <h3 style={{ marginTop: '1.25rem', fontSize: '1.125rem', fontWeight: 600, color: '#2d2924', fontFamily: "'Source Sans 3', sans-serif" }}>Premium Quality</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#4a443d', lineHeight: 1.6 }}>Only the finest products make it to our store</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 2rem',
              borderRadius: '1rem',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto',
                background: 'rgba(217, 95, 61, 0.08)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield style={{ width: '1.75rem', height: '1.75rem', color: '#d95f3d' }} />
              </div>
              <h3 style={{ marginTop: '1.25rem', fontSize: '1.125rem', fontWeight: 600, color: '#2d2924', fontFamily: "'Source Sans 3', sans-serif" }}>Secure Checkout</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#4a443d', lineHeight: 1.6 }}>Your payment information is always protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: '#fefdfb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #d95f3d, #c44a2a)',
            padding: '4rem 2rem',
          }}>
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontFamily: "'Fraunces', Georgia, serif",
                color: 'white',
                fontWeight: 500,
              }}>
                Ready to start shopping?
              </h2>
              <p style={{
                marginTop: '1rem',
                fontSize: '1.125rem',
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: '36rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Browse our collection and find something you'll love.
              </p>
              <Link
                to="/products"
                style={{
                  marginTop: '2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#c44a2a',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  transition: 'transform 0.2s',
                }}
              >
                Shop Now
                <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
