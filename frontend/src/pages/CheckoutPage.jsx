// src/pages/CheckoutPage.jsx
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
    const { cart } = useCart();
    const navigate = useNavigate();

    // Add state for customer details
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [name, setName] = React.useState("");

    // Calculate total price
    const itemTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const formattedTotal = itemTotal.toFixed(2);

    // Flutterwave payment handler
    const handleFlutterwavePayment = () => {
      // Validate input fields
      if (!email || !phone || !name) {
        alert("Please fill in all customer details before proceeding to payment.");
        return;
      }
      
      // Ensure Flutterwave script is loaded
      const totalKobo = Math.round(formattedTotal * 100); // Convert to kobo

      window.FlutterwaveCheckout({
        public_key: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X', // Replace with your Flutterwave public key
        tx_ref: "mealzubs-" + Date.now(), // Unique transaction reference
        amount: totalKobo,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd, mobilemoney, credit",
        customer: {
          email: email, // Replace with actual customer email
          phone_number: phone, // Replace with actual customer phone
          name: name, // Replace with actual customer name
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
    }

    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* 🛒 Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
         <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

         <ul className="space-y-3">
            {cart.length === 0 ? (
              <li>Your cart is empty.</li>
            ) : (
              cart.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))
            )}
         </ul>

         <div className="border-t mt-4 p-3 font-semibold">
           <div className="flex justify-between">
             <span>Subtotal:</span>
             <span> ${formattedTotal}</span>
           </div>
           <div className="flex justify-between text-sm text-gray-600 mt-1">
             <span>Shipping will be calculated after payment</span>
           </div>
         </div>
        </div>

        {/* 🧑 Add Customer Info Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="+2348012345678"
                required
              />
            </div>
          </div>
        </div>

        {/* 💳 Payment Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          
          {/* Bank Transfer Option */}
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-medium">🏦 Bank Transfer</h3>
            <p className="text-gray-600 mt-2">
                Please transfer <strong>${formattedTotal}</strong> to the following account:
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
              <p><strong>Bank:</strong> Jaiz Bank</p>
              <p><strong>Account Name:</strong> Saidu Umar</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>SWIFT Code:</strong> JAIZNGLA</p>
              <p><strong>Reference:</strong> Order-{Date.now().toString().slice(-6)}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              After payment, send on whatsapp or email proof to info@goFoodyyy.com - we'll confirm and dispatch your order!
            </p>
          </div>
           
          {/* Optional: Stripe Placeholder */}
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
          onClick={() => {
            alert('Thank you for your order! We will contact you shortly.');
            navigate('/');
          }}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Confirm Order (Cash on Delivery)
        </button>
      </div>
    </div>
    );
}

export default CheckoutPage;