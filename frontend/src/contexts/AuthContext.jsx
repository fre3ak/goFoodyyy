import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState(null); // 'admin' or 'vendor'

    useEffect(() => {
      // Check if user is logged in on app start
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const userData = localStorage.getItem('userData');

      if (token && storedUserType && userData) {
        setUser(JSON.parse(userData));
        setUserType(storedUserType);
      }
      setLoading(false);
    }, []);

    // Generic login method for the header dropdown
    const login = (userData, type, token) => {
      setUser(userData);
      setUserType(type);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type);
      localStorage.setItem('userData', JSON.stringify(userData));
    };

    // Admin Login
    const adminLogin = async (email, password) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', 'admin');
          localStorage.setItem('userData', JSON.stringify(data.admin));
          setUser(data.admin);
          setUserType('admin');
          return { success: true, data: data.admin };
        } else {
          return { success: false, error: data.message };
        }
       } catch (error) {
          return { success: false, error: 'Login failed. Please try again.' };
        }
      };

      // Vendor Login
      const vendorLogin = async (email, password) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/vendor/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'vendor');
            localStorage.setItem('userData', JSON.stringify(data.vendor));
            setUser(data.vendor);
            setUserType('vendor');
            return { success: true, data: data.vendor };
          } else {
            return { success: false, error: data.message };
          }
        } catch (error) {
          return { success: false, error: 'Login failed. Please try again.' };
        }
      };

      // Admin Signup
      const adminSignup = async (adminData) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/admin/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'admin');
            localStorage.setItem('userData', JSON.stringify(data.admin));
            setUser(data.admin);
            setUserType('admin');
            return { success: true, data: data.admin };
          } else {
            return { success: false, error: data.message };
          }
        } catch (error) {
          return { success: false, error: 'Signup failed. Please try again.'};
        }
      };

      // Vendor Signup
      const vendorSignup = async (vendorData) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/vendor/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(vendorData),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'vendor');
            localStorage.setItem('userData', JSON.stringify(data.vendor));
            setUser(data.vendor);
            setUserType('vendor');
            return { success: true, data: data.vendor };
          } else {
            return { success: false, error: data.message };
          }
        } catch (error) {
          return { success: false, error: 'Signup failed. Please try again.'};
        }
      };

      // Logout
      const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        setUser(null);
        setUserType(null);
      };

      const value = {
        user,
        userType,
        adminLogin,
        vendorLogin,
        adminSignup,
        vendorSignup,
        login,
        logout,
        loading
      };
      
      return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
}