// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

useEffect(() => {
  setLoading(true);

  fetch('http://localhost:5000/api/vendors/approved')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setVendors(data);
      } else {
        setVendors([]);
      }
    })
    .catch(err => {
      console.error('Failed to load vendors:', err);
      setVendors([]);
    })
    .finally(() => {
      setLoading(false);
    });

  // Optional: Load products for featured items
  fetch('http://localhost:5000/api/products')
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(err => console.error('Failed to load products:', err));
}, []);
  if (loading) return <p className="text-center">Loading vendors and menu...</p>;

  return (
    <div>
      {/* Hero Content */}
      {/* <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 text-white min-h-screen flex items-center justify-center relative overflow-hidden"> */}
        <div className='relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center'>
          {/* Background Image */}
          <div
            className='absolute inset-0 bg-cover bg-center brightness-75'
            style={{
              backgroundImage: `url(https://www.africanrecipes.com.ng/wp-content/uploads/2025/08/nigerian-shawarma-wrap-featured.png.webp)`,
              // filter: 'brightness(0.8)'
            }}
          ></div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 via-orange-400/80 to-red-500/80 text-white"></div>

          {/* Content */}
          {/* <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center"> */}
          <div className='relative z-10 text-white'>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Fresh Meals, <span className="underline">Delivered Fast</span>
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Order from your favorite local vendors — no delivery fees, no wait.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/onboard')}
                className="bg-white text-orange-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Join Our Vendors
              </button>
              <button 
                onClick={() => window.scrollTo({ top: document.getElementById('virtual-kitchens').offsetTop - 80, behavior: 'smooth' })}
                className="bg-white text-orange-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Browse Vendors
              </button>
            </div>
          </div>

          {/* Optional: Add subtle pattern */}
          <div className='absolute inset-0 opacity-0.3 pointer-events-none background-size: 30px 30px'>
            <div style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} className='w-full h-full bg-repeat'
            ></div>
          </div>
        </div>
      {/* Vendors section*/ }
      <section id="virtual-kitchens" className="py-16 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">Virtual Kitchens</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-6">
          {vendors.map(vendor => (
            <Link to={`/vendor/${vendor.slug}`} key={vendor.slug}>
              <div className="card text-center ">
                <h3 className="text-xl font-bold">{vendor.name}</h3>
                <p className="text-gray-600 mt-2">Tap to view menu</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section id="vendor-form" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-6">Become a Virtual Kitchen</h2>
          <p className="text-center text-gray-600 mb-8">
            Join our network of local vendors and start delivering fresh meals to customers.
          </p>
          
          <form className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2">
              <input type="text" placeholder="Full Name" className="border border-gray-300 rounded px-4 py-3" required />
              <input type="email" placeholder="Email Address" className="border border-gray-300 rounded px-4 py-3" required />
              <input type="tel" placeholder="Phone Number" className="border border-gray-300 rounded px-4 py-3" required />
              <input type="text" placeholder="Business Name" className="border border-gray-300 rounded px-4 py-3" required />
            </div>
            <textarea placeholder="Tell us about your menu and location" className="w-full border border-gray-300 rounded px-4 py-3 mt-6" rows="4" required></textarea>
            <button type="submit" className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition w-full">
              Submit Application
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;