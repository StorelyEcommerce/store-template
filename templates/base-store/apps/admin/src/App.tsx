import { Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentsPage } from './pages/PaymentsPage';

function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-surface-950">
        {/* Desktop Sidebar - Fixed position */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:block">
          <Sidebar />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Main Content - Offset by sidebar width on desktop */}
        <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;
