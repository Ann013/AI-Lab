import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Users, Share, Star, Sparkles, ArrowRight } from 'lucide-react';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Community = () => {
  const navigate = useNavigate();
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', avatar: null });
  const [communityStats, setCommunityStats] = useState({ total_users: 0, total_uploads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setIsUserSignedIn(true);
      setUserInfo(parsed);
    }

    fetch('http://localhost:5000/api/community-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCommunityStats({
            total_users: data.stats.total_users || 0,
            total_uploads: data.stats.total_uploads || 0
          });
        }
      })
      .catch(err => console.error('Failed to fetch stats:', err))
      .finally(() => setLoading(false));
  }, []);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const downloadImage = (imgUrl, fileName = 'artwork.png') => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
          <button onClick={() => navigate('/gen')} className="text-gray-600 hover:text-purple-600 transition-colors">Ai-art</button>
          <button onClick={() => navigate('/analyze')} className="text-gray-600 hover:text-purple-600 transition-colors">Analyze</button>
          <button onClick={() => navigate('/gallery')} className="text-gray-600 hover:text-purple-600 transition-colors">Gallery</button>
          <button onClick={() => navigate('/community')} className="text-gray-600 hover:text-purple-600 transition-colors">Community</button>
        </div>
        
        <div className="flex items-center space-x-4">
          {isUserSignedIn ? (
            <button onClick={() => navigate('/userdb')} className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full p-2 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-medium">{getUserInitials(userInfo.name)}</span>
                )}
              </div>
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</button>
              <button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-700 font-medium">Creative Community</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            {isUserSignedIn ? (
              <>
                Welcome Back, <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {userInfo.name || 'Creative Artist'}
                </span>
              </>
            ) : (
              <>
                Join Our <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Creative Community
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with fellow artists, share your work, and get inspired by amazing creations from around the world.
          </p>
        </div>

        {isUserSignedIn && (
          <>
            {/* Dynamic Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 text-center hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {loading ? '...' : communityStats.total_users}
                </div>
                <div className="text-sm text-gray-600">Artists Joined</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 text-center hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {loading ? '...' : communityStats.total_uploads}
                </div>
                <div className="text-sm text-gray-600">Artworks Shared</div>
              </div>
            </div>

            {/* Community Feature Cards */}
            <div className="flex justify-center gap-8 mb-16">
              <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 text-center hover:bg-white/70 transition-all duration-200 hover:shadow-lg w-80">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Share className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Share Your Art</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Upload and showcase your creations to inspire others.</p>
                <button
                  onClick={() => navigate('/gen')}
                  className="border border-purple-200 bg-white/60 backdrop-blur-sm text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/80 transition-all duration-200"
                >
                  Learn More
                </button>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 text-center hover:bg-white/70 transition-all duration-200 hover:shadow-lg w-80">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-rose-300 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Find Inspiration</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Discover artwork and connect with talented creators.</p>
                <button
                  onClick={() => navigate('/gallery')}
                  className="border border-purple-200 bg-white/60 backdrop-blur-sm text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/80 transition-all duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 max-w-4xl mx-auto hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {isUserSignedIn
                ? 'Thank You for Being Part of Our Community!'
                : 'Ready to Join Our Creative Community?'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              {isUserSignedIn
                ? 'You are already part of our growing creative family. Keep sharing and inspiring others with your amazing artwork!'
                : 'Start sharing your artwork, connecting with others, and exploring creativity like never before.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {!isUserSignedIn ? (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Create Account</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/gallery')}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Explore Gallery</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>  
    </div>    
  );
};

export default Community;