// frontend/src/App.jsx
import {
  BrowserRouter as Router,
  useNavigate,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { useCart } from "./contexts/CartContext";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import VendorLogin from "./pages/VendorLogin";
import VendorPage from "./pages/VendorPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import VendorOnboarding from "./pages/VendorOnboarding";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ToastContainer from "./components/ToastContainer";

function AppContent() {
  const { user, userType, logout } = useAuth();
  const { cartQuantity } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const loggedOutUserType = userType;
    logout(); // This will clear user state
    setUserMenuOpen(false);
    // Use navigate for a smoother SPA experience
    if (loggedOutUserType === "admin") {
      navigate("/admin/login");
    } else if (loggedOutUserType === "vendor") {
      navigate("/vendor/login");
    } else {
      navigate("/");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return user.name || user.vendorName || user.email || "user";
  };

  const getUserRole = () => {
    if (!userType) return "Customer";
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 text-white relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img
                src="/Go-4.png"
                alt="goFoodyyy"
                className="h-16 w-auto logo-dark hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          <nav className="flex items-center space-x-6 text-lg font-medium text-gray-700">
            <Link
              to="/"
              className="text-white hover:text-orange-100 transition-colors duration-200 font-semibold"
            >
              Home
            </Link>

            {/* User Authentication Section */}
            <div className="flex items-center space-x-4">
              {/* Cart = Always Visible */}
              <Link
                to="/cart"
                className="relative flex items-center space-x-2 text-white hover:text-orange-100 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
              >
                <ShoppingBasket size={22} />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartQuantity}
                  </span>
                )}
                <span className="font-semibold">Cart</span>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relaive">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-orange-100 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-sm font-semibold leading-none">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-orange-100">
                        {getUserRole()}
                      </div>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {getUserDisplayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getUserRole()} Account
                        </p>
                      </div>

                      {/* Dashboard Links */}
                      {userType === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={16} className="mr-3" />
                          Admin Dashboard
                        </Link>
                      )}

                      {userType === "vendor" && (
                        <Link
                          to="/vendor/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={16} className="mr-3" />
                          Vendor Dashboard
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-2"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Signup Button for Guests */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 shadow-sm"
                  >
                    <User size={18} />
                    <span>Login</span>
                  </button>

                  {/* Login Options Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          Choose Account Type
                        </p>
                      </div>

                      <Link
                        to="/vendor/login"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <ShoppingBag size={14} className="text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Vendor Login</div>
                          <div className="text-xs text-gray-500">
                            Manage your restaurant
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/admin/login"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Settings size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Admin Login</div>
                          <div className="text-xs text-gray-500">
                            Platform management
                          </div>
                        </div>
                      </Link>

                      {/* Customer Login */}
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500 text-center">
                          Customer Login coming soon
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Close dropdown when clicking outside */}
        {userMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setUserMenuOpen(false)}
          ></div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/vendor/:vendorSlug" element={<VendorPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/onboard" element={<VendorOnboarding />} />
          {/* <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/dashboard' element={<VendorDashboard />} /> */}

          {/* Authentication Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/vendor/login" element={<VendorLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute requiredUserType="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Vendor-specific dashboard with slug */}
          <Route
            path="/vendor/:vendorSlug/dashboard"
            element={
              <ProtectedRoute requiredUserType="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect root based on authentication */}
          <Route path="/" element={<Navigate to="/" replace />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="/Go-4.png"
                alt="goFoodyyy"
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm">
                Fresh meals from local vendors. Delivered fast across Nigeria.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Browse Vendors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Track Order
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/onboard" className="hover:text-white transition">
                    Join Platform
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor/login"
                    className="hover:text-white transition"
                  >
                    Vendor Login
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Vendor Resources
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <Link
                    to="/admin/login"
                    className="hover:text-white transition"
                  >
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 goFoodyyy. All rights reserved. Fresh meals from local
            vendors.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
