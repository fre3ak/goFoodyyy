// src/pages/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE;

function ProductPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch product from backend
        fetch( `${API_BASE}/api/products/${id}` )
           .then(res=> {
            if (!res.ok) throw new Error('Product not found');
            return res.json();
           })
           .then(data => {
             setProduct(data);
             setLoading(false);
           })
           .catch(err => {
             console.error(err);
             setLoading(false);
           });
    }, [id]);

    if (loading) return <p className='text-center'>Loading product...</p>;
    if (!product) return <p className='text-center'>Product not found.</p>;

    return (
  <div className='max-w-2xl mx-auto p-6'>
    <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
    {product.imageUrl && (
      <img
        src={`${API_BASE}${product.imageUrl}`}
        alt={product.name}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
    )}
    <p className='text-lg text-gray-700 mb-2'>Price: ₦{product.price}</p>
    <p className='text-gray-600 mb-4'>{product.description}</p>
    <p className='text-sm text-gray-500'>Sold by: {product.vendorName}</p>

    {/* Combined button section */}
    <div className='mt-6'>
      <button
        onClick={() => {
          addToCart(product);
          setAdded(true);
          // Reset after 2 seconds
          setTimeout(() => setAdded(false), 2000);
        }}
        className='btn-primary w-full'
      >
        {added ? '✅ Item Added!' : 'Add to Cart'}
      </button>

      {/* Show "Go to Cart" only after adding */}
      {added && (
        <button
          onClick={() => navigate("/cart")} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2 w-full">
          &rarr; Go to Cart
        </button>
      )}
    </div>
  </div>
);
}

export default ProductPage;