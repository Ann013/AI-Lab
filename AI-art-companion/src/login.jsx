import React, { useState } from 'react';
import { Palette, Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  
 const handleSubmit = async () => {
  try {
    // Check for hardcoded admin credentials first
    if (formData.email.trim() === 'admin@gmail.com' && formData.password === 'admin2004') {
      // Save admin user in localStorage
      localStorage.setItem('user', JSON.stringify({
        user_id: 0,
        name: 'Admin',
        email: 'admin@gmail.com',
        isAdmin: true
      }));
      alert('Admin login successful');
      navigate('/admin'); // Redirect to admin page
      return;
    }

    // Regular user login (existing code)
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password
      })
    });

    const data = await response.json();

    if (data.success) {
      // Save user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Login successful');
      navigate('/userdb'); // or your dashboard
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred. Please try again.');
  }
};


  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-white/80 transition-all duration-200 shadow-sm"
      >
        <Home className="w-4 h-4 text-purple-600" />
        <span className="text-sm text-purple-700 font-medium">Back to Home</span>
      </button>

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">AI Art Companion</span>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 flex items-center justify-center space-x-2 mb-6 w-fit mx-auto">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium">Welcome Back, Artist</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Sign In</h2>
          <p className="text-gray-600 text-center mb-8">Continue your creative journey</p>

          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={handleSignUp}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;