// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://gofoodyyy.onrender.com';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch vendors
      const vendorsResponse = await fetch(`${API_BASE}/api/vendors/approved`);

      if (!vendorsResponse.ok) throw new Error('Failed to load vendors');
      const vendorsData = await vendorsResponse.json();
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);

      // Fetch products (optional - can be removed if not needed)
      try {
        const productsResponse = await fetch(`${API_BASE}/api/products`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (productsError) {
        console.warn('Products load failed, continuing without products:', productsError);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load vendors. Please try again later.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

//   fetch(`${API_BASE}/api/vendors/approved`)
//     .then(res => res.json())
//     .then(data => {
//       if (Array.isArray(data)) {
//         setVendors(data);
//       } else {
//         setVendors([]);
//       }
//     })
//     .catch(err => {
//       console.error('Failed to load vendors:', err);
//       setVendors([]);
//     })
//     .finally(() => {
//       setLoading(false);
//     });

//   // Optional: Load products for featured items
//   fetch(`${API_BASE}/api/products`)
//     .then(res => res.json())
//     .then(data => setProducts(data))
//     .catch(err => console.error('Failed to load products:', err));
// }, []);
  if (loading) return <p className="text-center">Loading vendors and menu...</p>;

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className='relative overflow-hidden'>
      {/* Hero Content */}
        <div className='relative min-h-[550px] flex items-center justify-center'>
          {/* --------------------
            NEW: VIDEO BACKGROUND ELEMENT
            -------------------- */}
          {/* <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className='absolute inset-0 w-full h-full object-cover'
              style={{ filter: 'brightness(0.75)' }} // Keep the dimming filter
          >
              {/* IMPORTANT: Replace 'your-background-video.mp4' with the actual path or URL */}
              {/* <source src="your-background-video.mp4" type="video/mp4" /> */}
              
              {/* Fallback for browsers that don't support the video format */}
              {/* Your browser does not support the video tag.
          </video> */}
          {/* --------------------
            NEW: SLIDESHOW CONTAINER
            -------------------- */}
          {/* <div id="slideshow-bg" className='absolute inset-0'>
              `<img src="https://res.cloudinary.com/dt9yqinhk/image/upload/v1758980263/samples/breakfast.jpg" alt="Slide 1" className="slide-image" />
              <img src="https://res.cloudinary.com/dt9yqinhk/image/upload/v1758980256/samples/food/fish-vegetables.jpg" alt="Slide 2" className="slide-image" />
              <img src="image 3" alt="Slide 3" className="slide-image" />
          </div>` */}
          {/* Background Image */}
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: `url(https://res.cloudinary.com/dt9yqinhk/image/upload/v1758980255/samples/food/dessert.jpg)`,
              // filter: 'brightness(0.8)'
            }}
          ></div>

          {/* Overlay */}
          {/*<div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 via-orange-400/80 to-red-500/80 text-white"></div>*/}

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