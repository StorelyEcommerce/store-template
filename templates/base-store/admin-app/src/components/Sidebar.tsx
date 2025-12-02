import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Store,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
];

export function Sidebar() {
  const location = useLocation();
  const { stores, selectedStore, selectStore } = useStore();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  return (
    <aside className="w-64 bg-surface-900 border-r border-surface-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-surface-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-surface-100">Admin</span>
            <p className="text-xs text-surface-500">Store Platform</p>
          </div>
        </Link>
      </div>

      {/* Store Selector */}
      <div className="p-3 border-b border-surface-800">
        <div className="relative">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface-800 rounded-lg text-sm hover:bg-surface-700 transition-colors"
          >
            <span className="truncate text-surface-100">
              {selectedStore?.slug || 'Select store'}
            </span>
            <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${storeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {storeDropdownOpen && stores.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => {
                    selectStore(store.id);
                    setStoreDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-700 transition-colors ${
                    selectedStore?.id === store.id ? 'bg-primary-500/10 text-primary-400' : 'text-surface-300'
                  }`}
                >
                  {store.slug}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-800">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-surface-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

