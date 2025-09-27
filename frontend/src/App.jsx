// frontend/src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { Link } from 'react-router-dom';
import Home from './pages/Home';
import VendorPage from './pages/VendorPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VendorOnboarding from './pages/VendorOnboarding';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { cartQuantity } = useCart();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */ }
        <header className="bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 text-white relative">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/Go-4.png" alt="goFoodyyy" className="h-16 w-auto logo-dark" />
              {/* <span className="text-2xl font-extrabold text-gray-900 tracking-tight">goFoodyyy</span> */}
            </div>
            <nav className="flex items-center space-x-6 text-lg font-medium text-gray-700">
              <Link to="/" className="nav-link hover:text-red-600 transition">Home</Link>
              <Link to="/cart" className="nav-link flex items-center space-x-1 text-gray-900 font-semibold hover:text-red-600 transition">
                <span>🛒</span> 
                <span>Cart ({cartQuantity})</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vendor/:vendorSlug" element={<VendorPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path='/onboard' element={<VendorOnboarding/>} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/dashboard' element={<VendorDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-6 text-center text-gray-600 text-sm">
          © 2025 goFoodyyy. Fresh meals from local vendors.
        </footer>
      </div>
    </Router>
  );
}

export default App;