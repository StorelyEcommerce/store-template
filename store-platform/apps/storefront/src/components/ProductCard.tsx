import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Product, formatPrice } from '../api/client';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

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

  const colorIndex = product.id.charCodeAt(product.id.length - 1) % gradients.length;
  const gradient = gradients[colorIndex];
  const productSlug = product.slug || product.id;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      await addToCart(product.id);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 1500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Link to={`/products/${productSlug}`} className="card" style={{
      display: 'block',
      overflow: 'hidden',
      textDecoration: 'none',
    }}>
      {/* Image */}
      <div style={{
        aspectRatio: '1',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
            <ShoppingBag style={{ width: '3rem', height: '3rem', color: 'rgba(255,255,255,0.4)' }} />
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
            borderRadius: '9999px',
            background: showAdded ? '#059669' : '#d95f3d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: isAdding ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {showAdded ? '✓' : <Plus size={18} />}
        </button>

        {/* Stock Badge */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <span style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            Out of Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#2d2924',
          marginBottom: '0.25rem',
        }}>
          {product.title}
        </h3>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#d95f3d',
        }}>
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </Link>
  );
}

