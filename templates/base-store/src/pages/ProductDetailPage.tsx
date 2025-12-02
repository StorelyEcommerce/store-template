import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { api, Product, formatPrice } from '../api/client';
import { useCart } from '../context/CartContext';

// Warm gradient colors for placeholder images
const gradients = [
  'linear-gradient(135deg, #e8a598, #d4776a)',
  'linear-gradient(135deg, #c9b896, #a89774)',
  'linear-gradient(135deg, #98c4b8, #6fa396)',
  'linear-gradient(135deg, #b8a4c9, #957aab)',
  'linear-gradient(135deg, #dbc398, #c4a66a)',
];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await api.getProduct(slug);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const colorIndex = product ? product.id.charCodeAt(product.id.length - 1) % gradients.length : 0;
  const gradient = gradients[colorIndex];

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ height: '1.5rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '6rem', marginBottom: '2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ aspectRatio: '1', background: '#f5f1eb', borderRadius: '1rem' }} />
            <div>
              <div style={{ height: '2.5rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '75%' }} />
              <div style={{ height: '1.5rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '25%', marginTop: '1rem' }} />
              <div style={{ height: '1rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '100%', marginTop: '2rem' }} />
              <div style={{ height: '1rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '100%', marginTop: '0.5rem' }} />
              <div style={{ height: '1rem', background: '#f5f1eb', borderRadius: '0.25rem', width: '66%', marginTop: '0.5rem' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontFamily: "'Fraunces', Georgia, serif", color: '#2d2924' }}>Product not found</h1>
          <p style={{ marginTop: '0.5rem', color: '#4a443d' }}>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back Link */}
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b635a',
            marginBottom: '2rem',
            fontSize: '0.9375rem',
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Products
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            {/* Image */}
            <div style={{
              aspectRatio: '1',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#f5f1eb',
              border: '1px solid #e8e2d9',
            }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ShoppingBag style={{ width: '6rem', height: '6rem', color: 'rgba(255,255,255,0.4)' }} />
                </div>
              )}
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                {/* Title & Price */}
                <h1 style={{
                  fontSize: '2rem',
                  fontFamily: "'Fraunces', Georgia, serif",
                  color: '#2d2924',
                  fontWeight: 500,
                }}>
                  {product.title}
                </h1>
                <p style={{
                  marginTop: '1rem',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: '#d95f3d',
                }}>
                  {formatPrice(product.priceCents, product.currency)}
                </p>

                {/* Stock Status */}
                {isOutOfStock && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.375rem 0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                  }}>
                    Out of stock
                  </div>
                )}
                {isLowStock && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.375rem 0.75rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#d97706',
                    fontSize: '0.875rem',
                  }}>
                    Only {product.stock} left in stock
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div style={{ marginTop: '2rem' }}>
                    <h2 style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#6b635a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem',
                    }}>
                      Description
                    </h2>
                    <p style={{ color: '#4a443d', lineHeight: 1.7 }}>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e8e2d9' }}>
                {/* Quantity Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4a443d' }}>Quantity</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e8e2d9',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={isOutOfStock}
                      style={{
                        padding: '0.75rem',
                        background: 'white',
                        border: 'none',
                        color: '#6b635a',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Minus style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <span style={{
                      width: '3rem',
                      textAlign: 'center',
                      color: '#2d2924',
                      fontWeight: 500,
                      background: 'white',
                    }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      disabled={isOutOfStock || (product.stock !== undefined && quantity >= product.stock)}
                      style={{
                        padding: '0.75rem',
                        background: 'white',
                        border: 'none',
                        color: '#6b635a',
                        cursor: (isOutOfStock || (product.stock !== undefined && quantity >= product.stock)) ? 'not-allowed' : 'pointer',
                        opacity: (isOutOfStock || (product.stock !== undefined && quantity >= product.stock)) ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    background: showAdded ? '#10b981' : undefined,
                  }}
                >
                  {showAdded ? (
                    <>
                      <Check style={{ width: '1.25rem', height: '1.25rem' }} />
                      Added to Cart
                    </>
                  ) : isAdding ? (
                    'Adding...'
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingBag style={{ width: '1.25rem', height: '1.25rem' }} />
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Subtotal */}
                {!isOutOfStock && (
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b635a', textAlign: 'center' }}>
                    Subtotal: {formatPrice(product.priceCents * quantity, product.currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
