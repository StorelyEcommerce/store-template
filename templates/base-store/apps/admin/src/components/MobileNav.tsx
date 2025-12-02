import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard,
  Menu,
  X,
  Store,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
];

export function MobileNav() {
  const location = useLocation();
  const { stores, selectedStore, selectStore } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-900 border-b border-surface-800">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-surface-100">Admin</span>
          </Link>
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-surface-400 hover:text-surface-100"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-surface-950/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {menuOpen && (
      <div className="lg:hidden fixed top-14 left-0 right-0 z-50 bg-surface-900 border-b border-surface-800 animate-slide-up">
        {/* Store Selector */}
        <div className="p-4 border-b border-surface-800">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface-800 rounded-lg text-sm"
          >
            <span className="truncate text-surface-100">
              {selectedStore?.slug || 'Select store'}
            </span>
            <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${storeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {storeDropdownOpen && stores.length > 0 && (
            <div className="mt-2 bg-surface-800 border border-surface-700 rounded-lg overflow-hidden">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => {
                    selectStore(store.id);
                    setStoreDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    selectedStore?.id === store.id ? 'bg-primary-500/10 text-primary-400' : 'text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  {store.slug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
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
      </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-900 border-t border-surface-800 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map(item => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  isActive ? 'text-primary-400' : 'text-surface-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

