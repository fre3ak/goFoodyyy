// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();

    // Add state for customer details
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [deliveryAddress, setDeliveryAddress] = React.useState("");
    const [notes, setNotes] = React.useState("");

    // Group cart items by vendor
    const cartByVendor = cart.reduce((acc, item) => {
      const slug = item.vendorSlug;
      if (!acc[slug]) {
        acc[slug] = {
          vendorName: item.vendorName,
          items: [],
          total: 0,
        };
      }
      acc[slug].items.push(item);
      acc[slug].total += item.price * item.quantity;
      return acc;
    }, {});

    // Checkout Validation
    const validateCheckout = () => {
       if (!name.trim()) {
           alert('Please enter your full name');
           return false;
       }
       if (!email.trim()) {
           alert('Please enter your email address');
           return false;
       }
       if (!phone.trim()) {
           alert('Please enter your phone number');
           return false;
       }
       return true;
    };

    // Confirm Order button click handler
    const handleConfirmOrder = async () => {
        if (!validateCheckout()) return;
        
        try {
          // Create order for each vendor
          for (const [vendorSlug, group] of Object.entries(cartByVendor)) {
              const orderData = {
                  customerName : name,
                  customerEmail: email,
                  customerPhone: phone,
                  deliveryAddress: "Customer will provide address via contact",
                  notes,
                  vendorSlug: vendorSlug,
                  items: group.items,
                  subtotal: group.total,
                  deliveryFee: 1000.00,
                  total: group.total + 1000.00,
                  paymentMethod: "bank_transfer"
              };

              const response = await fetch(`${API_BASE}/api/orders`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(orderData)
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create order');
              }
              
              const result = await response.json();
              console.log('Order created:', result);
            }

            alert('Order created successfully! Check your email for receipt.');
            clearCart();
            navigate('/');
          } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to create order: ' + error.message);
          }
      };

    // Fetch bank details for each vendor
    const [vendorBankDetails, setVendorBankDetails] = useState({});

    useEffect(() => {
      const fetchBankDetails = async () => {
        const details = {};
        for (const vendorSlug of Object.keys(cartByVendor)) {
          try {
            const res = await fetch(`${API_BASE}/api/vendors/${vendorSlug}`);
            if (res.ok) {
              const data = await res.json();
              details[vendorSlug] = data;
            } else {
              // Fallback if vendor not found
              details[vendorSlug] = {
                bankName: "Jaiz Bank",
                accountName: "Vendor Account",
                accountNumber: "1234567890"
              };
            }
          } catch (err) {
            console.error(`Failed to fetch bank details for ${vendorSlug}`, err);
            // Fallback
            details[vendorSlug] = {
              bankName: "Jaiz Bank",
              accountName: "Vendor Account",
              accountNumber: "1234567890"
            };
          }
        }
        setVendorBankDetails(details);
      };
        if (cart.length > 0) {
          fetchBankDetails();
        }
      }, [cart]);
    
    // Flutterwave payment handler
    const handleFlutterwavePayment = () => {
      // Validate input fields
      if (!email || !phone || !name) {
        alert("Please fill in all customer details before proceeding to payment.");
        return;
      }
      
      // Ensure Flutterwave script is loaded
      const totalKobo = Math.round(Object.values(cartByVendor)[0]?.total * 100 || 0); // Convert to kobo

      window.FlutterwaveCheckout({
        public_key: process.env.REACT_APP_FLUTTERWAVE_KEY || 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X', // Replace with your Flutterwave public key
        tx_ref: `order-${Date.now()}`, // Unique transaction reference
        amount: totalKobo,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd, mobilemoney, credit",
        customer: {
          email: email, // Replace with actual customer email
          phone_number: phone, // Replace with actual customer phone
          name: name // Replace with actual customer name
        },
        callback: (response) => {
          if (response.status === "successful") {
            console.log("Payment successful:", response);
            // Optional: Send order to backend
            navigate("/success");
          } else {
            alert("Payment failed or was canceled. Please try again.");
          }
          window.close(); // Close pop-up
        },
        onclose: () => {
          console.log("Payment window closed");
        },
        customizations: {
          title: "goFoodyyy",
          logo: "https://gofoodyyy.com/logo.png", // Replace with your logo URL
        },
      });
    };

    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1"> Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="House #, Street, Area, Landmark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Delivery Instructions (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="E.g., Ring bell, leave at gate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="+2348012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email Address (for receipt)</label>
              <input
                type="email"
                placeholder="Your Email (for receipt)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
              />
            </div>
          </div>
        </div>

        {/* 🛒 Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
         <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
         {Object.entries(cartByVendor).map(([vendorSlug, group]) => (
           <div key={vendorSlug} className="mb-6 border-b pb-4">
             <h3 className="font-bold text-lg">{group.vendorName}</h3>
             <ul className="space-y-2 mt-2">
               {group.items.map(item => (
                 <li key={item.id} className="flex justify-between text-sm">
                   <span>{item.name} x {item.quantity}</span>
                   <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                 </li>
               ))}
             </ul>
             <div className="mt-2 font-semibold">
               Total: ₦{group.total.toFixed(2)}
             </div>
          </div>
         ))}
      </div>

        {/* 💳 Payment Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

          {Object.entries(cartByVendor).map(([vendorSlug, group]) => {
            const bank = vendorBankDetails[vendorSlug];
            if (!bank) return null;

            return (
              <div key={vendorSlug} className="border rounded-lg p-4 mb-6">
                <h3 className="font-medium">🏦 Bank Transfer to {group.vendorName}</h3>
                <p className="text-gray-600 mt-2">
                  Transfer <strong>₦{group.total.toFixed(2)}</strong> to:
                </p>
                <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                  <p><strong>Bank:</strong> {bank.bankName}</p>
                  <p><strong>Account Name:</strong> {bank.accountName}</p>
                  <p><strong>Account Number:</strong> {bank.accountNumber}</p>
                  <p><strong>Reference:</strong> Order-{Date.now().toString().slice(-6)}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  After payment, send proof to {vendorSlug}@gofoodyyy.com — we'll confirm and dispatch your order!
                </p>
            </div>
            );
          })}
           
          {/* Optional: Flutterwave Placeholder */}
        <button
          // onClick={() => alert('Stripe integration coming soon!')}
          onClick={handleFlutterwavePayment}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          💳 Pay with Flutterwave
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Cart
        </button>
        <button
          onClick={handleConfirmOrder}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Confirm Order (Delivery fee will sent to you when payment is confirmed)
        </button>
      </div>
    </div>
    );
  }
export default CheckoutPage;