import { useEffect, useState } from 'react';
import { Package, ShoppingCart, CreditCard, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { adminApi, Product, Order, Payment, formatPrice, formatDateTime } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { selectedStore, isLoading: storeLoading } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!selectedStore) return;
      setIsLoading(true);
      try {
        const [productsData, ordersData, paymentsData] = await Promise.all([
          adminApi.getProducts(selectedStore.id),
          adminApi.getOrders(selectedStore.id),
          adminApi.getPayments(selectedStore.id),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedStore]);

  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amountCents, 0);

  const recentOrders = orders.slice(0, 5);

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
        <p className="mt-2 text-surface-500">Select a store from the sidebar to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description={`Overview for ${selectedStore.slug}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatPrice(totalRevenue, 'usd')}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Products"
          value={products.length}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="amber"
        />
        <StatCard
          title="Payments"
          value={payments.filter(p => p.status === 'succeeded').length}
          icon={CreditCard}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
            <h2 className="font-semibold text-surface-100">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-surface-500">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {recentOrders.map(order => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-100 font-medium">{order.userEmail}</p>
                    <p className="text-xs text-surface-500">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-surface-100">{formatPrice(order.totalCents, order.currency)}</p>
                    <span className={`badge ${
                      order.status === 'paid' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-800">
            <h2 className="font-semibold text-surface-100">Store Performance</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-surface-400">Active Products</p>
                  <p className="text-lg font-semibold text-surface-100">
                    {products.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
              <span className="text-xs text-surface-500">
                of {products.length} total
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-surface-400">Pending Orders</p>
                  <p className="text-lg font-semibold text-surface-100">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
              <Link to="/orders" className="text-xs text-primary-400 hover:text-primary-300">
                View
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-surface-400">Successful Payments</p>
                  <p className="text-lg font-semibold text-surface-100">
                    {payments.filter(p => p.status === 'succeeded').length}
                  </p>
                </div>
              </div>
              <Link to="/payments" className="text-xs text-primary-400 hover:text-primary-300">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

