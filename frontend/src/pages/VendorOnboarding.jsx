// import { remove } from 'dom/lib/mutation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

function VendorOnboarding() {
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorSlug: '',
    phone: '',
    email: '',
    bank: '',
    accountName: '',
    accountNumber: '',
    delivery: false,
    pickup: false,
    menu: [{ name: '', price: '', description: '', image: null }]
  });
  const [logo, setLogo] = useState(null);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMenuChange = (index, field, value) => {
    const newMenu = [...formData.menu];
    newMenu[index][field] = value;
    setFormData(prev => ({ ...prev, menu: newMenu }));
  };

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menu: [...prev.menu, { name: '', price: '', description: '', image: '' }]
    }));
  };

  const removeMenuItem = (index) => {
    const newMenu = formData.menu.filter((_, i) => i !== index);
    setFormData(prev => ({...prev, menu: newMenu}));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setloading(true);
  setError('');

  const data = new FormData();

  // Append vendor info
  Object.entries(formData).forEach(([key, value]) => {
    if (key !== 'menu') {
      data.append(key, value);
    }
  });

  // Append menu text fields
  formData.menu.forEach((item, i) => {
    data.append(`menuName${i}`, item.name);
    data.append(`menuPrice${i}`, item.price);
    data.append(`menuDescription${i}`, item.description);
  });

  // ✅ Append ALL images under same field name 'menuImages'
  formData.menu.forEach(item => {
    if (item.image instanceof File) {
      console.log('Uploading:', item.image.name, item.image.size, item.image.type);
      data.append('menuImages', item.image); // ✅ Fixed: `item.image`, not `item,image`
    } else if (item.image) {
      console.warn('⚠️ Invalid file object:', item.image);
    }
  });

  // Append logo
  if (logo instanceof File) {
    console.log('Uploading logo:', logo.name, logo.size);
    data.append('logo', logo);
  }

  try {
    const res = await fetch(`${API_BASE}/api/vendors/onboard`, {
      method: 'POST',
      body: data
    });

    const result = await res.json();

    if (res.ok) {
      alert('Thank you! Your shop will be live soon.');
      navigate('/');
    } else {
      setError(result.error || 'Something went wrong');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setloading(false);
  }
};
  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Onboard Your Kitchen</h1>
      {error && <p className='text-red-600 mb-4'>{error}</p>}

      <form onSubmit={handleSubmit} encType='multipart/form-data'>
        {/* Vendor Info */}
        <div className='grid gap-4 sm:grid-cols-2 mb-6'>
          <input
            type='text'
            name='vendorName'
            placeholder='Vendor Name (e.g., Meals by Zubs'
            value={formData.vendorName}
            onChange={handleChange}
            required
            className='border border-gray-300 rounded px-4 py-2'
          />
          <input
            type='text'
            name='vendorSlug'
            placeholder='URL Slug (e.g., meals-by-zubs)'
            value={formData.vendorSlug}
            onChange={handleChange}
            required
            className='border border-gray-300 rounded px-4 py-2'
          /> 
          <input
            type='tel'
            name='phone'
            placeholder='Phone Number (Whatsapp Number preferred'
            value={formData.phone}
            onChange={handleChange}
            required
            className='border border-gray-300 rounded px-4 py-2'
          />
          <input
            type='email'
            name='email'
            placeholder='Email Address'
            value={formData.email}
            onChange={handleChange}
            required
            className='border border-gray-300 rounded px-4 py-2'
          />
          <input
            type="text"
            name="openingHours"
            placeholder="Mon-Fri 8AM–8PM"
            value={formData.openingHours}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            />
        </div>

        {/*Bank Details*/}
        <div className='mb-6'>
          <h3 className='font-bold mb-2'>Bank Details</h3>
          <input
            type='text'
            name='bank'
            placeholder='Bank Name'
            value={formData.bank}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded px-4 py-2 mb-2'
          /> 
          <input
            type='text'
            name='accountName'
            placeholder='Account Name'
            value={formData.accountName}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded px-4 py-2 mb-2'
          />
          <input
            type='text'
            name='accountNumber'
            placeholder='Account Number'
            value={formData.accountNumber}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded px-4 py-2 mb-2'
          /> 
        </div>

        {/* Delivery/Pickup */}
        <div className='flex gap-6 mb-6'>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              name='delivery'
              checked={formData.delivery}
              onChange={handleChange}
            />
            <span>Delivery</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              name='pickup'
              checked={formData.pickup}
              onChange={handleChange}
            />
            <span>Pickup</span>
          </label>
        </div>

        {/* Logo Upload */}
        <div className='mb-6'>
          <label className='block mb-2'>Upload Logo</label>
          <input
            type='file'
            name='logo'
            onChange={(e) => setLogo(e.target.files[0])}
            className='border border-gray-300 rounded px-4 py-2'
          />
        </div>

        {/* Menu Items */}
        <div className='mb-6'>
          <h3 className='font-bold mb-2'>Menu Items</h3>
          {formData.menu.map((item, index) => (
            <div key={index} className='border p-4 mb-4 rounded relative'>
              <button
                type='button'
                onClick={() => removeMenuItem(index)}
                className='absolute top-2 right-2 text-red-600'
              >
                x
              </button>
              <input
                type='text'
                placeholder='Food Name'
                value={item.name}
                onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                required
                className='w-full border border-gray-300 rounded px-4 py-2 mb-2'
              />
              <input
                type='number'
                placeholder='Price (₦)'
                value={item.price}
                onChange={(e) => handleMenuChange(index, 'price', e.target.value)}
                required
                className='w-full border border-gray-300 rounded px-4 py-2 mb-2'
              />
              <textarea
                placeholder='Description'
                value={item.description}
                onChange={(e) => handleMenuChange(index, 'description', e.target.value)}
                className='border border-gray-300 rounded px-4 py-2'
              />
              <input
                type='file'
                // name={`menuImage${index}`}
                onChange={(e) => handleMenuChange(index, 'image', e.target.files[0])}
                className='border border-gray-300 rounded px-4 py-2'
              />
            </div>
          ))}
         <button
             type='button'
             onClick={addMenuItem}
             className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
         >
           + Add Another Item
         </button>
        </div>

        {/* Submit */}
        <button
            type='submit'
            disabled={loading}
            className='bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full'
        >
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}

export default VendorOnboarding;