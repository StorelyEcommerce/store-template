import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { adminApi, Payment, formatPrice, formatDateTime } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function PaymentsPage() {
  const { selectedStore, isLoading: storeLoading } = useStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, [selectedStore]);

  async function loadPayments() {
    if (!selectedStore) return;
    setIsLoading(true);
    try {
      const data = await adminApi.getPayments(selectedStore.id);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter(p => p.status === statusFilter);

  const statusCounts = {
    all: payments.length,
    succeeded: payments.filter(p => p.status === 'succeeded').length,
    requires_payment: payments.filter(p => p.status === 'requires_payment').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
  };

  const totalSucceeded = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amountCents, 0);

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-surface-100">No store selected</h2>
        <p className="mt-2 text-surface-500">Select a store from the sidebar to view payments.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Payments" 
        description={`Payment history for ${selectedStore.slug}`}
      />

      {/* Summary Card */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-surface-500">Total Successful Payments</p>
            <p className="text-3xl font-semibold text-surface-100 mt-1">
              {formatPrice(totalSucceeded, 'usd')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="badge badge-success">
              {statusCounts.succeeded} succeeded
            </span>
            {statusCounts.refunded > 0 && (
              <span className="badge badge-warning">
                {statusCounts.refunded} refunded
              </span>
            )}
            {statusCounts.failed > 0 && (
              <span className="badge badge-error">
                {statusCounts.failed} failed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'succeeded', 'requires_payment', 'failed', 'refunded'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                : 'text-surface-400 hover:bg-surface-800 border border-transparent'
            }`}
          >
            {status === 'requires_payment' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-60">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-20 card">
          <CreditCard className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-surface-100">No payments found</h2>
          <p className="mt-1 text-surface-500">
            {statusFilter !== 'all' ? 'No payments with this status' : 'Payments will appear here once customers complete purchases'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Status</th>
                <th>Order</th>
                <th>Stripe Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td className="font-mono text-surface-100">
                    {formatPrice(payment.amountCents, payment.currency)}
                  </td>
                  <td>
                    <span className={`badge ${
                      payment.status === 'succeeded' ? 'badge-success' :
                      payment.status === 'requires_payment' ? 'badge-warning' :
                      payment.status === 'refunded' ? 'badge-info' : 'badge-error'
                    }`}>
                      {payment.status === 'requires_payment' ? 'pending' : payment.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-surface-400">
                    {payment.orderId.slice(0, 12)}...
                  </td>
                  <td>
                    <a
                      href={`https://dashboard.stripe.com/payments/${payment.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs font-mono"
                    >
                      {payment.stripePaymentIntentId.slice(0, 16)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="text-surface-400 text-sm">
                    {formatDateTime(payment.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

