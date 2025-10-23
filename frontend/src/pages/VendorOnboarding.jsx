// import { remove } from 'dom/lib/mutation';
import { useEffect } from "react";
import { useState } from "react";
import { useAsyncError, useNavigate } from "react-router-dom";

const BANKS_API_URL = 'https://nigerianbanks.xyz/';

const useNigerianBanks = () => {
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState('');

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch(BANKS_API_URL);
        const result = await response.json();

        if (Array.isArray(result)) {
          // Sort banks alphabetically
          const sortedBanks = result.data
            .sort((a, b) => a.name.localeCompare(b.name));

          setBanks(sortedBanks);
        } else {
          setBanksError('Failed to load banks list');
          // Fallback list if API fails
          setBanks([
            'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank','First Bank', 'First City Monument Bank (FCMB)', 'Globus Bank', 'Guaranty Trust Bank (GTBank)', 'Heritage Bank', 'Jaiz Bank', 'Keystone Bank', 'Kuda Bank', 'Opay','PalmPay', 'Parallex Bank', 'Polaris Bank', 'Providus Bank','Stanbic IBTC Bank', 'Standard Chartered', 'Sterling Bank','Suntrust Bank', 'Taj Bank', 'Titan Trust Bank', 'Union Bank','United Bank for Africa (UBA)', 'Unity Bank', 'VFD Microfinance Bank', 'Wema Bank', 'Zenith Bank'
          ]);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        setBanksError('Error loading banks. Using default list.');
        // Fallback banks
        setBanks([
          'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank','First Bank', 'First City Monument Bank (FCMB)', 'Globus Bank', 'Guaranty Trust Bank (GTBank)', 'Heritage Bank', 'Jaiz Bank', 'Keystone Bank', 'Kuda Bank', 'Opay','PalmPay', 'Parallex Bank', 'Polaris Bank', 'Providus Bank','Stanbic IBTC Bank', 'Standard Chartered', 'Sterling Bank','Suntrust Bank', 'Taj Bank', 'Titan Trust Bank', 'Union Bank','United Bank for Africa (UBA)', 'Unity Bank', 'VFD Microfinance Bank', 'Wema Bank', 'Zenith Bank'
        ]);
      } finally {
          setBanksLoading(false);
      }
    };

      fetchBanks();
    }, []);

    return { banks, banksLoading, banksError };
  };

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const API_BASE = import.meta.env.VITE_API_BASE;

function VendorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { banks, banksLoading, banksError } = useNigerianBanks();
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    vendorName: "",
    vendorSlug: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    city: "",
    address: "",
    openingHours: "",

    // Step 2: Bank Details
    bank: "",
    accountName: "",
    accountNumber: "",

    // Step 3: Service Type
    delivery: false,
    pickup: false,

    // Step 4: Menu
    menu: [
      { name: "", price: "", description: "", image: null, imagePreview: "" },
    ],
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setloading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Auto-generate slug from vendor name
  useEffect(() => {
    if (formData.vendorName && !formData.vendorSlug) {
      const generatedSlug = formData.vendorName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      setFormData((prev) => ({ ...prev, vendorSlug: generatedSlug }));
    }
  }, [formData.vendorName]);

  // Validate Nigerian phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Validate Nigerian bank account number
  const validateAccountNumber = (accountNumber) => {
    return /^\d{10}$/.test(accountNumber);
  };

  // Step validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = "Vendor name is required";
    }

    if (!formData.vendorSlug.trim()) {
      newErrors.vendorSlug = "Vendor slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.vendorSlug)) {
      newErrors.vendorSlug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone =
        "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.state) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.bank) {
      newErrors.bank = "Bank name is required";
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!validateAccountNumber(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep4 = () => {
    const newErrors = {};

    if (formData.menu.length === 0) {
      newErrors.menu = "At least one menu item is required";
    } else {
      formData.menu.forEach((item, index) => {
        if (!item.name.trim()) {
          newErrors[`menuName${index}`] = `Menu item #${
            index + 1
          } name is required`;
        }
        if (!item.price || parseFloat(item.price) <= 0) {
          newErrors[`menuPrice${index}`] = `Menu item #${
            index + 1
          } must have a valid price`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMenuChange = (index, field, value) => {
    const newMenu = [...formData.menu];

    if (field === "image" && value instanceof File) {
      // Create preview for image
      const previewUrl = URL.createObjectURL(value);
      newMenu[index] = {
        ...newMenu[index],
        [field]: value,
        imagePreview: previewUrl,
      };
    } else {
      newMenu[index] = { ...newMenu[index], [field]: value };
    }

    setFormData((prev) => ({ ...prev, menu: newMenu }));
  };

  const addMenuItem = () => {
    setFormData((prev) => ({
      ...prev,
      menu: [
        ...prev.menu,
        { name: "", price: "", description: "", image: null, imagePreview: "" },
      ],
    }));
  };

  const removeMenuItem = (index) => {
    const newMenu = formData.menu.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, menu: newMenu }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          logo: "Please upload a JPEG, PNG, or WebP image",
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, logo: "Image must be less than 5MB" }));
        return;
      }

      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const nextStep = () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    setErrors("");

    if (!validateStep4()) {
      setloading(false);
      return;
    }

    const data = new FormData();

    // Append vendor info
    const vendorFields = [
      "vendorName",
      "vendorSlug",
      "phone",
      "email",
      "password",
      "bank",
      "accountName",
      "accountNumber",
      "openningHours",
      "state",
      "city",
      "address",
    ];

    vendorFields.forEach((field) => {
      if (formData[field]) {
        data.append(field, formData[field]);
      }
    });

    // Append service types
    data.append("delivery", formData.delivery);
    data.append("pickup", formData.pickup);

    // Append menu text fields
    formData.menu.forEach((item, i) => {
      data.append(`menuName${i}`, item.name);
      data.append(`menuPrice${i}`, item.price);
      data.append(`menuDescription${i}`, item.description || "");
    });

    // Append menu images
    formData.menu.forEach((item) => {
      if (item.image instanceof File) {
        // console.log('Uploading:', item.image.name, item.image.size, item.image.type);
        data.append("menuImages", item.image);
      }
    });

    // Append logo
    if (logo instanceof File) {
      // console.log('Uploading logo:', logo.name, logo.size);
      data.append("logo", logo);
    }

    try {
      const res = await fetch(`${API_BASE}/api/vendors/onboard`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(
          "Application submitted successfully! You will receive a confirmation email shortly."
        );
        setTimeout(() => {
          navigate("/vendor-login");
        }, 3000);
      } else {
        setErrors({
          submit: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      setErrors({
        submit: "Network error. Please check your connection and try again.",
      });
    } finally {
      setloading(false);
    }
  };

  // Progress percentage
  const progress = ((currentStep - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join goFoodyyy as a Virtual Kitchen Vendor
          </h1>
          <p className="text-gray-600">
            Reach thousands of customers across Nigeria. Complete your
            application in five simple steps.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Basic Info</span>
            <span>Bank Details</span>
            <span>Services</span>
            <span>Logo</span>
            <span>Menu</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    name="vendorName"
                    placeholder="e.g., Tasty Bites Restaurant"
                    value={formData.vendorName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.vendorName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.vendorName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.vendorName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Slug *
                  </label>
                  <input
                    type="text"
                    name="vendorSlug"
                    placeholder="e.g., tasty-bites-restaurant"
                    value={formData.vendorSlug}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.vendorSlug ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.vendorSlug && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.vendorSlug}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This will be your unique URL: gofoodyyy.com/vendor/
                    {formData.vendorSlug || "your-slug"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g., 08012345678 or +2348012345678"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g., tastybites@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g., Ungwan Rimi"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    placeholder="Enter your complete business address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    placeholder="e.g., Mon-Fri 8:00 AM - 10:00 PM, Sat-Sun 9:00 AM - 11:00 PM"
                    value={formData.openingHours}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next: Bank Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">
                Bank Account Details
              </h2>
              <p className="text-gray-600 mb-6">
                This is where we'll send your payments. Please ensure details
                are accurate.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <select
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focuss:ring-blue-500 focus:border-transparent ${
                      errors.bank ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">{banksLoading ? 'Loading banks...' : 'Select Bank'}</option>
                    {banks.map((bank) => (
                      <option key={bank.code || bank} value={bank.name || bank}>
                        {bank.name || bank}
                      </option>
                    ))}
                  </select>
                  {errors.bank && (
                    <p className="mt-1 text-sm text-yellow-600">{banksError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    placeholder="e.g., Tasty Bites Enterprises"
                    value={formData.accountName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.accountName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.accountName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.accountName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="10-digit account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.accountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next: Services
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Service Type */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Service Options</h2>
              <p className="text-gray-600 mb-6">
                Choose how customers receive their orders from you.
              </p>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                  <input
                    type="checkbox"
                    name="delivery"
                    checked={formData.delivery}
                    onChange={handleChange}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Delivery Service
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Customers can have their orders delivered to their
                      location. You'll need to specify your delivery areas and
                      fees.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                  <input
                    type="checkbox"
                    name="pickup"
                    checked={formData.pickup}
                    onChange={handleChange}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Pickup Service
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Customers can pick up their orders directly from their
                      location.
                    </p>
                  </div>
                </label>
              </div>

              {!formData.delivery && !formData.pickup && (
                <p className="mt-4 text-sm text-red-600">
                  Please select at least one service option
                </p>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.delivery && !formData.pickup}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next: Logo
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Logo Upload */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Business Logo</h2>
              <p className="text-gray-600 mb-6">
                Upload your restaurant/kitchen logo. This will be displayed on
                your store page.
              </p>

              <div className="flex flex-col items-center">
                {logoPreview ? (
                  <div className="mb-4">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                <label className="cursor-pointer">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>

                {errors.logo && (
                  <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
                )}

                <p className="mt-4 text-sm text-gray-500 text-center">
                  Recommended: Square image, at least 300x300 pixels, max 5MB.{" "}
                  <br />
                  Formats: JPG, PNG, WebP
                </p>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next: Menu Setup
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Menu Setup */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Menu Setup</h2>
              <p className="text-gray-600 mb-6">
                Add your food items. You can add more items later from your
                vendor dashboard.
              </p>

              {errors.menu && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">{errors.menu}</p>
                </div>
              )}

              <div className="space-y-6">
                {formData.menu.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="absolute top-3 right-3 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                    >
                      x
                    </button>

                    <h3 className="font-medium text-gray-900 mb-4">
                      Menu Item #{index + 1}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Food Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Jollof Rice with Chicken"
                          value={item.name}
                          onChange={(e) =>
                            handleMenuChange(index, "name", e.target.value)
                          }
                          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`menuName${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`menuName${index}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`menuName${index}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₦) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 2500"
                          value={item.price}
                          onChange={(e) =>
                            handleMenuChange(index, "price", e.target.value)
                          }
                          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`menuPrice${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`menuPrice${index}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`menuPrice${index}`]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          placeholder="Describe this dish (ingredients, serving size, etc.)"
                          value={item.description}
                          onChange={(e) =>
                            handleMenuChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows="2"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:rind-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Food Image
                        </label>

                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) =>
                              handleMenuChange(
                                index,
                                "image",
                                e.target.files[0]
                              )
                            }
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {item.imagePreview && (
                            <img
                              src={item.imagePreview}
                              alt="Preview"
                              className="w-16 h-16 rounded object-cover border"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMenuItem}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add Another Menu Item</span>
                  </div>
                </button>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Your application will be reviewed within 24-48 hours. You'll receive
            an email once approved.
          </p>
          <p className="mt-2">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@gofoodyyy.com"
              className="text-blue-600 hover:underline"
            >
              support@gofoodyyy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VendorOnboarding;
