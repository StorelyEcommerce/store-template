import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api, formatPrice, ShippingAddress } from '../api/client';

// Warm gradient colors for placeholder images
const gradients = [
  'linear-gradient(135deg, #e8a598, #d4776a)',
  'linear-gradient(135deg, #c9b896, #a89774)',
  'linear-gradient(135deg, #98c4b8, #6fa396)',
  'linear-gradient(135deg, #b8a4c9, #957aab)',
  'linear-gradient(135deg, #dbc398, #c4a66a)',
];

export function CartPage() {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setCheckoutError('Please enter your email');
      return;
    }
    if (!shippingAddress.name.trim() || !shippingAddress.line1.trim() || 
        !shippingAddress.city.trim() || !shippingAddress.postalCode.trim()) {
      setCheckoutError('Please fill in all required address fields');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const { checkoutUrl } = await api.createCheckout(email, shippingAddress);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setCheckoutError(error.message || 'Failed to create checkout session');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0 && !isLoading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '28rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            width: '6rem',
            height: '6rem',
            margin: '0 auto',
            background: '#f5f1eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <ShoppingBag style={{ width: '2.5rem', height: '2.5rem', color: '#9a9285' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: "'Fraunces', Georgia, serif", color: '#2d2924' }}>Your cart is empty</h1>
          <p style={{ marginTop: '0.5rem', color: '#4a443d' }}>
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b635a',
              marginBottom: '1rem',
              fontSize: '0.9375rem',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Continue Shopping
          </Link>
          <h1 style={{ fontSize: '2rem', fontFamily: "'Fraunces', Georgia, serif", color: '#2d2924', fontWeight: 500 }}>Your Cart</h1>
          <p style={{ marginTop: '0.25rem', color: '#4a443d' }}>
            {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.items.map(item => {
                if (!item.product) return null;
                
                const colorIndex = item.product.id.charCodeAt(item.product.id.length - 1) % gradients.length;
                const gradient = gradients[colorIndex];
                const productSlug = item.product.slug || item.product.id;

                return (
                  <div
                    key={item.productId}
                    className="card"
                    style={{ padding: '1rem', display: 'flex', gap: '1rem' }}
                  >
                    {/* Image */}
                    <Link
                      to={`/products/${productSlug}`}
                      style={{
                        width: '6rem',
                        height: '6rem',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
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
                          <ShoppingBag style={{ width: '2rem', height: '2rem', color: 'rgba(255,255,255,0.4)' }} />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Link
                            to={`/products/${productSlug}`}
                            style={{ fontWeight: 500, color: '#2d2924' }}
                          >
                            {item.product.title}
                          </Link>
                          <p style={{ fontSize: '0.875rem', color: '#6b635a', marginTop: '0.25rem' }}>
                            {formatPrice(item.product.priceCents, item.product.currency)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          style={{
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#9a9285',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Quantity */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #e8e2d9',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            style={{
                              padding: '0.5rem',
                              background: 'white',
                              border: 'none',
                              color: '#6b635a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Minus style={{ width: '0.875rem', height: '0.875rem' }} />
                          </button>
                          <span style={{
                            width: '2.5rem',
                            textAlign: 'center',
                            color: '#2d2924',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            style={{
                              padding: '0.5rem',
                              background: 'white',
                              border: 'none',
                              color: '#6b635a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <p style={{ fontWeight: 600, color: '#d95f3d' }}>
                          {formatPrice(item.product.priceCents * item.quantity, item.product.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '6rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2d2924', marginBottom: '1.5rem' }}>Order Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b635a' }}>Subtotal</span>
                    <span style={{ color: '#2d2924' }}>{formatPrice(cart.subtotalCents, 'usd')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b635a' }}>Shipping</span>
                    <span style={{ color: '#9a9285' }}>Calculated at checkout</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e8e2d9', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#2d2924', fontWeight: 500 }}>Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#d95f3d' }}>
                      {formatPrice(cart.totalCents, 'usd')}
                    </span>
                  </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4a443d', marginBottom: '0.5rem' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input"
                      required
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #e8e2d9', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2d2924', marginBottom: '1rem' }}>
                      Shipping Address
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label htmlFor="name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={shippingAddress.name}
                          onChange={e => handleAddressChange('name', e.target.value)}
                          placeholder="John Doe"
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="line1" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          id="line1"
                          value={shippingAddress.line1}
                          onChange={e => handleAddressChange('line1', e.target.value)}
                          placeholder="123 Main St"
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="line2" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          id="line2"
                          value={shippingAddress.line2}
                          onChange={e => handleAddressChange('line2', e.target.value)}
                          placeholder="Apt, Suite, etc. (optional)"
                          className="input"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label htmlFor="city" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                            City *
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={shippingAddress.city}
                            onChange={e => handleAddressChange('city', e.target.value)}
                            placeholder="City"
                            className="input"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="state" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                            State
                          </label>
                          <input
                            type="text"
                            id="state"
                            value={shippingAddress.state}
                            onChange={e => handleAddressChange('state', e.target.value)}
                            placeholder="State"
                            className="input"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label htmlFor="postalCode" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            value={shippingAddress.postalCode}
                            onChange={e => handleAddressChange('postalCode', e.target.value)}
                            placeholder="12345"
                            className="input"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="country" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#6b635a', marginBottom: '0.25rem' }}>
                            Country
                          </label>
                          <select
                            id="country"
                            value={shippingAddress.country}
                            onChange={e => handleAddressChange('country', e.target.value)}
                            className="input"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {checkoutError && (
                    <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{checkoutError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isCheckingOut || cart.items.length === 0}
                    className="btn btn-primary"
                    style={{ padding: '1rem', marginTop: '0.5rem' }}
                  >
                    {isCheckingOut ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard style={{ width: '1.25rem', height: '1.25rem' }} />
                        Checkout with Stripe
                      </>
                    )}
                  </button>
                </form>

                <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9a9285', textAlign: 'center' }}>
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
