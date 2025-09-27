// pages/VendorPage.jsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { use } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;

function VendorPage() {
  const { vendorSlug } = useParams();
  const { addToCart } = useCart();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/products?vendorSlug=${vendorSlug}`)
      .then(res => res.json())
      .then(data => {
        setVendorProducts(data);
        if (data.length > 0) setVendorName(data[0].vendorName);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [vendorSlug]);

  if (loading) return <p className='text-center'>Loading menu...</p>;
  if (vendorProducts.length === 0) return <p className='text-center'>No menu found for this vendor.</p>;

  return (
    <div>
      <header className="text-center py-6 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{vendorName}</h1>
        <p className="text-gray-600">Fresh meals, delivered fast</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6">
        {vendorProducts.map(product => (
          <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm">
            {product.imageUrl && (
              <img
                src={`http://localhost:5000${product.imageUrl}`}
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-lg font-medium">{product.name}</h3>
            <p className="text-red-600 font-semibold mt-1">₦{product.price}</p>
            <p className="text-sm text-gray-500 mb-3">{product.description}</p>

            <button
              onClick={() => addToCart(product)}
              className="btn-primary w-full"
            >
              Add to Cart
            </button>
            <button
              onClick={() => window.location.href = `/product/${product.id}`}
              className="block text-center mt-2 text-blue-600 hover:underline"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorPage;