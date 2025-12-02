import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '9999px',
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'relative',
            width: '6rem',
            height: '6rem',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
          }}>
            <CheckCircle style={{ width: '3rem', height: '3rem', color: 'white' }} />
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '2rem',
          fontWeight: 600,
          color: '#2d2924',
          marginBottom: '1rem',
        }}>
          Thank you for your order!
        </h1>
        <p style={{ color: '#6b635a', marginBottom: '2rem' }}>
          Your payment was successful. We've sent a confirmation email with your order details.
        </p>

        {(orderId || sessionId) && (
          <div style={{
            background: '#f5f1eb',
            border: '1px solid #e8e2d9',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#9a9285', marginBottom: '0.25rem' }}>
              {orderId ? 'Order ID' : 'Session ID'}
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#4a443d',
              wordBreak: 'break-all',
            }}>
              {orderId || sessionId}
            </p>
          </div>
        )}

        {/* What's Next */}
        <div style={{
          background: 'white',
          border: '1px solid #e8e2d9',
          borderRadius: '1rem',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem',
        }}>
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#2d2924',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Package style={{ width: '1rem', height: '1rem', color: '#d95f3d' }} />
            What's next?
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#6b635a' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'rgba(217, 95, 61, 0.1)',
                color: '#d95f3d',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>1</span>
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'rgba(217, 95, 61, 0.1)',
                color: '#d95f3d',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>2</span>
              <span>We'll process and ship your order</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'rgba(217, 95, 61, 0.1)',
                color: '#d95f3d',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>3</span>
              <span>Track your package with the shipping confirmation</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          Continue Shopping
          <ArrowRight style={{ width: '1rem', height: '1rem' }} />
        </Link>
      </div>
    </div>
  );
}

