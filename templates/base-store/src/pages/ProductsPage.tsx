import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api, Product } from '../api/client';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'price-high':
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      {/* Header */}
      <div style={{ background: '#f5f1eb', borderBottom: '1px solid #e8e2d9' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: "'Fraunces', Georgia, serif",
            color: '#2d2924',
            fontWeight: 500,
          }}>
            {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#4a443d' }}>
            {isLoading
              ? 'Loading...'
              : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Filters Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: '#6b635a',
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem', paddingRight: '2.5rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b635a',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            )}
          </form>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="input"
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {[...Array(8)].map((_, i) => (
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
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              margin: '0 auto',
              background: '#f5f1eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <Search style={{ width: '2rem', height: '2rem', color: '#9a9285' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2924' }}>No products found</h2>
            <p style={{ marginTop: '0.5rem', color: '#4a443d' }}>
              {searchQuery
                ? `No products match "${searchQuery}"`
                : 'Check back soon for new arrivals'}
            </p>
            {searchQuery && (
              <button onClick={clearSearch} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
