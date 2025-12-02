import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, Product } from '../api/client';
import { ProductCard } from '../components/ProductCard';

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: '4rem', minHeight: '100vh' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #faf8f4 0%, #f5f1eb 100%)',
        padding: '3rem 1rem',
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '2.5rem',
            fontWeight: 600,
            color: '#2d2924',
            marginBottom: '1rem',
          }}>
            Shop All Products
          </h1>
          <p style={{
            color: '#6b635a',
            marginBottom: '2rem',
          }}>
            {products.length} products available
          </p>

          {/* Search */}
          <div style={{
            position: 'relative',
            maxWidth: '24rem',
          }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9a9285',
              width: '1.25rem',
              height: '1.25rem',
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '3rem 1rem' }}>
        <div className="container">
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
          ) : filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 0',
            }}>
              <p style={{ color: '#6b635a', fontSize: '1.125rem' }}>
                {searchQuery ? 'No products found matching your search.' : 'No products available.'}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
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
