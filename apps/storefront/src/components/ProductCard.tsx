import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Check } from 'lucide-react';
import { Product, formatPrice } from '../api/client';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

// Warm gradient colors for placeholder images
const gradients = [
  'linear-gradient(135deg, #e8a598, #d4776a)',
  'linear-gradient(135deg, #c9b896, #a89774)',
  'linear-gradient(135deg, #98c4b8, #6fa396)',
  'linear-gradient(135deg, #b8a4c9, #957aab)',
  'linear-gradient(135deg, #dbc398, #c4a66a)',
];

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      await addToCart(product.id);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const colorIndex = product.id.charCodeAt(product.id.length - 1) % gradients.length;
  const gradient = gradients[colorIndex];

  return (
    <Link 
      to={`/products/${product.slug || product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'block' }}
    >
      <div className="card" style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s',
      }}>
        {/* Image */}
        <div style={{
          aspectRatio: '1',
          position: 'relative',
          overflow: 'hidden',
          background: '#f5f1eb',
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s',
              }}
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
              <ShoppingBag style={{ width: '4rem', height: '4rem', color: 'rgba(255,255,255,0.4)' }} />
            </div>
          )}
          
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: showAdded ? '#10b981' : 'white',
              color: showAdded ? 'white' : '#2d2924',
              opacity: isHovered || showAdded ? 1 : 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {showAdded ? (
              <Check style={{ width: '1.25rem', height: '1.25rem' }} />
            ) : (
              <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
            )}
          </button>

          {/* Stock Badge */}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <div className="badge badge-warning" style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
            }}>
              Only {product.stock} left
            </div>
          )}
          {product.stock === 0 && (
            <div className="badge badge-error" style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
            }}>
              Out of stock
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem' }}>
          <h3 style={{
            fontWeight: 500,
            fontSize: '1rem',
            color: isHovered ? '#d95f3d' : '#2d2924',
            transition: 'color 0.2s',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            {product.title}
          </h3>
          {product.description && (
            <p style={{
              marginTop: '0.375rem',
              fontSize: '0.875rem',
              color: '#6b635a',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}>
              {product.description}
            </p>
          )}
          <p style={{
            marginTop: '0.75rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#d95f3d',
          }}>
            {formatPrice(product.priceCents, product.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
