import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Eye, Users, Sparkles, ArrowRight } from 'lucide-react';

const AiArtCompanion = () => {
  const navigate = useNavigate();

  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', avatar: null });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setIsUserSignedIn(true);
      setUserInfo(parsed);
    }
  }, []);

  // ✅ Navigation Handlers
  const handleGenerate = () => navigate('/gen');
  const handleAnalyze = () => navigate('/analyze');
  const handleGallery = () => navigate('/gallery');
  const handleCommunity = () => navigate('/community');
  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');
  const handleDashboard = () => navigate('/userdb');
  const handleImgimg= () => navigate('/imgimg');

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-gray-800">AI Art Companion</span>
                </div>

        <div className="hidden md:flex items-center space-x-8">
          <button onClick={handleGenerate} className="text-gray-600 hover:text-purple-600 transition-colors">Ai-art</button>
          <button onClick={handleAnalyze} className="text-gray-600 hover:text-purple-600 transition-colors">Analyze</button>
          <button onClick={handleGallery} className="text-gray-600 hover:text-purple-600 transition-colors">Gallery</button>
          <button onClick={handleCommunity} className="text-gray-600 hover:text-purple-600 transition-colors">Community</button>
        </div>

        <div className="flex items-center space-x-4">
          {isUserSignedIn ? (
            <button onClick={handleDashboard} className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full p-2 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-medium">{getUserInitials(userInfo.name)}</span>
                )}
              </div> </button>) : (<> <button onClick={handleLogin} className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</button>
              <button onClick={handleSignUp} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-sm">
                Get Started </button> </>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium">Powered by Advanced AI</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Art Companion
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your artistic vision with cutting-edge AI. Generate stunning 
            artwork, analyze your drawings, and elevate your creative process.
          </p>
        </div>

        {/* Main Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
          <button onClick={handleGenerate}  className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Start Creating</span>
          </button>
          <button onClick={handleGallery} className="border border-purple-200 bg-white/60 backdrop-blur-sm text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-white/80 transition-all duration-200 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Explore Gallery</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* AI Generation Card */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center mb-6">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Generation</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create stunning artwork from text prompts and tronsform image styles with advanced AI models 
            </p>
            <button onClick={handleGenerate}  className="text-purple-600 font-medium flex items-center space-x-2 hover:text-purple-700 transition-colors">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Smart Analysis Card */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Analysis</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Get AI feedback on perspective and anatomy
            </p>
            <button onClick={handleAnalyze}  className="text-purple-600 font-medium flex items-center space-x-2 hover:text-purple-700 transition-colors">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Community Gallery Card */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-300 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Gallery</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Share your art and discover amazing creations from other artists
            </p>
            <button onClick={handleGallery} className="text-purple-600 font-medium flex items-center space-x-2 hover:text-purple-700 transition-colors">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiArtCompanion;