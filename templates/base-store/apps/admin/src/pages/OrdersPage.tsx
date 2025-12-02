import { useEffect, useState } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp, ExternalLink, Truck, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { adminApi, Order, formatPrice, formatDateTime } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'badge-warning', icon: Clock },
  { value: 'paid', label: 'Paid', color: 'badge-success', icon: CheckCircle },
  { value: 'shipped', label: 'Shipped', color: 'badge-info', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'badge-success', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-error', icon: XCircle },
  { value: 'refunded', label: 'Refunded', color: 'badge-error', icon: RefreshCw },
];

export function OrdersPage() {
  const { selectedStore, isLoading: storeLoading } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStore]);

  async function loadOrders() {
    if (!selectedStore) return;
    setIsLoading(true);
    try {
      const data = await adminApi.getOrders(selectedStore.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!selectedStore) return;
    setUpdatingOrderId(orderId);
    try {
      await adminApi.updateOrderStatus(selectedStore.id, orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const statusCounts: Record<string, number> = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
  };

  function getStatusBadgeClass(status: string): string {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'badge-warning';
  }

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
        <p className="mt-2 text-surface-500">Select a store from the sidebar to view orders.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Orders" 
        description={`Order history for ${selectedStore.slug}`}
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                : 'text-surface-400 hover:bg-surface-800 border border-transparent'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {statusCounts[status] > 0 && (
              <span className="ml-2 text-xs opacity-60">({statusCounts[status]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 card">
          <ShoppingCart className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-surface-100">No orders found</h2>
          <p className="mt-1 text-surface-500">
            {statusFilter !== 'all' ? 'No orders with this status' : 'Orders will appear here once customers start purchasing'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-surface-100 text-left">
                      {order.userEmail}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-mono text-surface-100">
                      {formatPrice(order.totalCents, order.currency)}
                    </p>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-5 h-5 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-surface-500" />
                  )}
                </div>
              </button>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="px-5 py-4 border-t border-surface-800 bg-surface-900/50 animate-slide-up">
                  {/* Status Change Section */}
                  <div className="mb-6 pb-4 border-b border-surface-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">
                          Update Status
                        </h4>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {updatingOrderId === order.id && (
                            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-500">Current Status</p>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-surface-300">
                              {item.quantity}x {item.productTitle || 'Product'}
                            </span>
                            <span className="font-mono text-surface-100">
                              {formatPrice(item.priceCents * item.quantity, order.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
                        Shipping Address
                      </h4>
                      {order.shippingAddress ? (
                        <div className="text-sm text-surface-300">
                          <p className="font-medium text-surface-100">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.line1}</p>
                          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                          <p>
                            {order.shippingAddress.city}
                            {order.shippingAddress.state && `, ${order.shippingAddress.state}`} {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-surface-500 italic">No address provided</p>
                      )}
                    </div>

                    {/* Order Info */}
                    <div>
                      <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
                        Order Details
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-surface-500">Order ID</dt>
                          <dd className="text-surface-300 font-mono text-xs">{order.id}</dd>
                        </div>
                        {order.stripeCheckoutSessionId && (
                          <div className="flex justify-between">
                            <dt className="text-surface-500">Stripe</dt>
                            <dd className="text-surface-300 font-mono text-xs truncate max-w-[140px]">
                              {order.stripeCheckoutSessionId.slice(0, 16)}...
                            </dd>
                          </div>
                        )}
                        {order.stripePaymentIntentId && (
                          <div className="flex justify-between">
                            <dt className="text-surface-500">Payment</dt>
                            <dd className="text-surface-300 font-mono text-xs">
                              <a 
                                href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

