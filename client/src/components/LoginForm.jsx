import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Dummy credentials
  const DUMMY_EMAIL = "admin@gmail.com";
  const DUMMY_PHONE = "+140756789";
  const DUMMY_PASSWORD = "password123";

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailOrPhone = formData.email.trim();
    const password = formData.password;

    // Email or phone validation
    if (!emailOrPhone) {
      newErrors.email = 'Email or phone number is required';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const isPhone = /^\d{11}$/.test(emailOrPhone);
      if (!isEmail && !isPhone) {
        newErrors.email = 'Enter a valid email or 11-digit phone number';
      }
    }

    // Password validation
    if (!password || password.trim() === '') {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const input = formData.email.trim();
      const isEmail = input === DUMMY_EMAIL;
      const isPhone = input === DUMMY_PHONE;
      if ((isEmail || isPhone) && formData.password === DUMMY_PASSWORD) {
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setErrors({
          ...errors,
          submit: "Invalid email, phone, or password. Please try again."
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        submit: "Something went wrong. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Panel */}
  <div className="flex-1 bg-gradient-to-br from-[#000000] to-[#005660] flex flex-col justify-center items-center px-8 md:px-16 text-white">
        <div className="max-w-md flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl md:text-7xl font-bold mb-8 md:mb-12 tracking-wider">BASE</h1>
          <p className="text-xl md:text-3xl leading-relaxed">
            Enter your details to<br />
            access your account.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 md:px-16 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Please sign-in to your account
            </h2>
            <div className="text-xs text-gray-500 mb-4">
              <span className="block">Email: <span className="font-semibold text-green-700">admin@gmail.com</span></span>
              <span className="block">Phone: <span className="font-semibold text-green-700">+140756789</span></span>
              <span className="block">Password: <span className="font-semibold text-green-700">password123</span></span>
            </div>
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address or Phone number"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full h-14 bg-gray-100 rounded-lg px-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[#005660] focus:outline-none ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
                required
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full h-14 bg-gray-100 rounded-lg px-4 pr-12 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[#005660] focus:outline-none ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                }`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Forget Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-[#005660] hover:bg-black text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-[#005660] hover:underline font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div> */}

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              All rights reserved ©BASE. {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;