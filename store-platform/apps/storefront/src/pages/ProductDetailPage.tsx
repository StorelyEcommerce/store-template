import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { api, Product, formatPrice } from '../api/client';
import { useCart } from '../context/CartContext';

const gradients = [
  'linear-gradient(135deg, #e8a598, #d4776a)',
  'linear-gradient(135deg, #c9b896, #a89774)',
  'linear-gradient(135deg, #98c4b8, #6fa396)',
  'linear-gradient(135deg, #b8a4c9, #957aab)',
  'linear-gradient(135deg, #dbc398, #c4a66a)',
];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      const data = await api.getProduct(slug!);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product || isAdding) return;
    
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    );
  }

  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1rem',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '2rem',
          color: '#2d2924',
          marginBottom: '1rem',
        }}>
          Product Not Found
        </h1>
        <p style={{ color: '#6b635a', marginBottom: '2rem' }}>
          The product you're looking for doesn't exist.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const colorIndex = product.id.charCodeAt(product.id.length - 1) % gradients.length;
  const gradient = gradients[colorIndex];
  const maxQuantity = product.stock ?? 99;

  return (
    <div style={{ paddingTop: '4rem', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Breadcrumb */}
        <Link to="/products" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6b635a',
          marginBottom: '2rem',
          fontSize: '0.9375rem',
        }}>
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
        }} className="product-detail-grid">
          {/* Image */}
          <div style={{
            aspectRatio: '1',
            borderRadius: '1rem',
            overflow: 'hidden',
            background: product.imageUrl ? 'white' : gradient,
          }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingBag style={{ width: '4rem', height: '4rem', color: 'rgba(255,255,255,0.4)' }} />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '2.25rem',
              fontWeight: 600,
              color: '#2d2924',
              marginBottom: '0.75rem',
            }}>
              {product.title}
            </h1>

            <p style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#d95f3d',
              marginBottom: '1.5rem',
            }}>
              {formatPrice(product.priceCents, product.currency)}
            </p>

            {product.description && (
              <p style={{
                color: '#6b635a',
                lineHeight: 1.7,
                marginBottom: '2rem',
              }}>
                {product.description}
              </p>
            )}

            {/* Stock Status */}
            {product.stock !== undefined && (
              <p style={{
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: product.stock === 0 ? '#dc2626' : product.stock <= 5 ? '#d97706' : '#059669',
              }}>
                {product.stock === 0 
                  ? 'Out of Stock' 
                  : product.stock <= 5 
                    ? `Only ${product.stock} left in stock` 
                    : `${product.stock} in stock`}
              </p>
            )}

            {/* Quantity Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4a443d',
                marginBottom: '0.5rem',
              }}>
                Quantity
              </label>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #e8e2d9',
                borderRadius: '0.5rem',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: 'none',
                    color: quantity <= 1 ? '#d4ccc0' : '#6b635a',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{
                  width: '3rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#2d2924',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: 'none',
                    color: quantity >= maxQuantity ? '#d4ccc0' : '#6b635a',
                    cursor: quantity >= maxQuantity ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                maxWidth: '20rem',
                padding: '1rem',
                fontSize: '1rem',
                background: showAdded ? '#059669' : undefined,
              }}
            >
              {showAdded ? (
                <>
                  <Check size={20} />
                  Added to Cart
                </>
              ) : isAdding ? (
                'Adding...'
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
