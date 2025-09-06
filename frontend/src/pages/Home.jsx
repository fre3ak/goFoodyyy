// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetch( 'http://localhost:5000/api/products' )
           .then(res=> res.json())
           .then(data => {
            setProducts(data);
            setLoading(false);
           })
           .catch(err => {
            console.error(err);
            setLoading(false);
           });
    }, []);

    if (loading) return <p className='text-center'>Loading products...</p>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">Available Meals</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-32 object-cover mb-4 rounded"
                        />
                      )}
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <p className="text-gray-600 mt-2">${product.price}</p>
                      <p className="text-sm text-gray-500">by {product.vendorName}</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition">
                        Add to Cart
                        </button>

                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="mt-2 w-full bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition">
                        View Details
                      </button>
                    </div>
                ))}
               </div>
           </div>
    );
}

export default Home;