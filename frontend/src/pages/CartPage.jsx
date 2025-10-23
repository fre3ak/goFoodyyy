// src/pages/CartPage.jsx
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

function CartPage() {
  const { cart, removeFromCart } = useCart(); // ✅ Removed unused addToCart
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {cart.map(item => (
              <li key={item.id} className="flex items-center border-b pb-4">
                <div className="flex items-center w-full"> {/* ✅ Replaced <> with div */}
                  {/* Image */}
                  {item.imageUrl && (
                    <img
                      src={`${API_BASE}${item.imageUrl}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-blue-600">₦{item.price} × {item.quantity}</p> {/* ✅ × symbol */}
                    <p className="text-gray-600">by {item.vendorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₦{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)} // ✅ Remove item from cart
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-xl font-bold">
              Total: ₦{totalPrice}
            </span>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline"
        >
          ← Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default CartPage;