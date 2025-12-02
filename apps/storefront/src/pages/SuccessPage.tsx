import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-display text-surface-100">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-surface-400">
          Your payment was successful. We've sent a confirmation email with your order details.
        </p>

        {sessionId && (
          <div className="mt-6 p-4 bg-surface-900 border border-surface-800 rounded-xl">
            <p className="text-xs text-surface-500 mb-1">Order Reference</p>
            <p className="font-mono text-sm text-surface-300 break-all">{sessionId}</p>
          </div>
        )}

        {/* What's Next */}
        <div className="mt-10 p-6 bg-surface-900 border border-surface-800 rounded-2xl text-left">
          <h2 className="text-sm font-medium text-surface-100 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent-400" />
            What's next?
          </h2>
          <ul className="space-y-3 text-sm text-surface-400">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500/10 text-accent-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500/10 text-accent-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
              <span>We'll process and ship your order</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500/10 text-accent-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
              <span>Track your package with the shipping confirmation</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

