import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Sparkles, Heart, Download, ArrowRight, User, Calendar, Eye, X, Flag, Copy } from 'lucide-react';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Gallery = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showArtistProfile, setShowArtistProfile] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistImages, setArtistImages] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  const fetchImages = async (pageNum) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch uploaded images with user details
      const res = await fetch(`${API_BASE_URL}/api/uploaded-images?page=${pageNum}&limit=20&include_user_details=true`);
      const data = await res.json();
      
      if (data.success) {
        // Filter only images with upload_status = 'uploaded'
        const uploadedImages = (data.images || []).filter(img => img.upload_status === 'uploaded');
        setImages(uploadedImages);
        setPagination(data.pagination || { totalPages: 1, currentPage: pageNum });
      } else {
        throw new Error(data.message || 'Failed to fetch images');
      }
    } catch (err) {
      console.error('Gallery fetch failed:', err);
      setError('Failed to load gallery images. Please try again.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    
    // Handle different URL formats
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    
    // Handle base64 images
    if (imgPath.startsWith('data:image/')) {
      return imgPath;
    }
    
    // Handle local file paths
    const cleanPath = imgPath.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanPath}`;
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Unknown time';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 7) {
      return formatDate(dateStr);
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleLike = async (imageId) => {
    if (!user) {
      alert('Please sign in to like images');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/like-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId }),
      });

      const data = await res.json();
      if (data.success) {
        setImages(prevImages => 
          prevImages.map(img => 
            img.id === imageId 
              ? { ...img, likes: (img.likes || 0) + 1 }
              : img
          )
        );
        
        // Update selected image if it's the one being liked
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
        }
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleDownload = async (imgUrl, filename) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'artwork.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imgUrl, '_blank');
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const openModal = (img) => {
    setSelectedImage(img);
    setShowModal(true);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleCopyPrompt = (prompt) => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      alert('Prompt copied to clipboard!');
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleViewProfile = async (artistName) => {
    if (!artistName) return;
    
    try {
      // Fetch all images by this artist
      const res = await fetch(`${API_BASE_URL}/api/artist-images?artist_name=${encodeURIComponent(artistName)}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedArtist(artistName);
        setArtistImages(data.images || []);
        setShowArtistProfile(true);
        setShowModal(false); // Close the main modal
      } else {
        // Fallback: filter current images by artist name
        const artistImgs = images.filter(img => img.user_name === artistName);
        setSelectedArtist(artistName);
        setArtistImages(artistImgs);
        setShowArtistProfile(true);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to fetch artist images:', error);
      // Fallback: filter current images by artist name
      const artistImgs = images.filter(img => img.user_name === artistName);
      setSelectedArtist(artistName);
      setArtistImages(artistImgs);
      setShowArtistProfile(true);
      setShowModal(false);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const closeArtistProfile = () => {
    setShowArtistProfile(false);
    setSelectedArtist(null);
    setArtistImages([]);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const NavButton = ({ onClick, children, className = "" }) => (
    <button onClick={onClick} className={`text-gray-600 hover:text-purple-600 ${className}`}>
      {children}
    </button>
  );
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const ImageCard = ({ img }) => {
    const imageUrl = getImageUrl(img.img_url);
    const [imageError, setImageError] = useState(false);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    
    return (
      <div
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group border border-purple-100"
        onMouseEnter={() => setHovered(img.id)}
        onMouseLeave={() => setHovered(null)}
      >
        {/* User Info Header */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">
                  {getUserInitials(img.user_name)}
                </span>
              </div>
              
              {/* User Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {img.user_name || 'Unknown Artist'}
                </h3>
              </div>
            </div>
            
            {/* Time badge */}
            <div className="flex items-center text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3 mr-1" />
              {formatRelativeTime(img.created_at)}
            </div>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative cursor-pointer" onClick={() => openModal(img)}>
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={`Artwork by ${img.user_name || 'Unknown'}`}
              className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center flex-col">
              <div className="text-gray-400 text-4xl mb-2">🖼️</div>
              <span className="text-gray-500 text-sm">Image not available</span>
            </div>
          )}

          {/* View overlay */}
          {hovered === img.id && imageUrl && !imageError && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/30 transition-colors">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </div>
            </div>
          )}
        </div>

        {/* Image Details Footer */}
        <div className="p-4">
          {/* Artwork Title/Description */}
          {img.prompt && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                "{img.prompt}"
              </p>
            </div>
          )}
          
          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(img.id);
                }}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{img.likes || 0}</span>
              </button>
              
              {img.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{img.views}</span>
                </div>
              )}

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(getImageUrl(img.img_url), `artwork-${img.id}.png`);
                }}
                className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
            
            {/* User Badge */}
            <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              <User className="w-3 h-3" />
              <span className="font-medium">
                {img.user_role || 'Member'}
              </span>
            </div>
          </div>
          
          {/* Additional metadata */}
          {(img.dimensions || img.file_size) && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                {img.dimensions && (
                  <span>{img.dimensions}</span>
                )}
                {img.file_size && (
                  <span>{(img.file_size / 1024).toFixed(1)} KB</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Gallery Artwork Modal Component
  const GalleryModal = ({ img, onClose }) => {
    const imageUrl = getImageUrl(img.img_url);
    const [imageError, setImageError] = useState(false);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">
                  {getUserInitials(img.user_name)}
                </span>
              </div>
              
              {/* User Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {img.user_name || 'Unknown Artist'}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatRelativeTime(img.created_at)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {imageUrl && !imageError ? (
                  <img 
                    src={imageUrl} 
                    alt={`Artwork by ${img.user_name || 'Unknown'}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col">
                    <div className="text-gray-400 text-6xl mb-4">🖼️</div>
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownload(imageUrl, `artwork-${img.id}.png`)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => handleLike(img.id)}
                  className="flex-1 bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>Like ({img.likes || 0})</span>
                </button>
              </div>

             
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Artwork Description */}
              {img.prompt && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Original Prompt</h3>
                  <p className="text-gray-700 leading-relaxed">
                    "{img.prompt}"
                  </p>
                  <button
                    onClick={() => handleCopyPrompt(img.prompt)}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Prompt</span>
                  </button>
                </div>
              )}

              {/* Artwork Stats */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">Artwork Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">Likes:</span>
                    <span className="font-medium">{img.likes || 0}</span>
                  </div>
                  
                  {img.views && (
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{img.views}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(img.created_at)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Artist:</span>
                    <span className="font-medium">{img.user_role || 'Member'}</span>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              {(img.dimensions || img.file_size) && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Technical Details</h3>
                  <div className="space-y-2 text-sm">
                    {img.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{img.dimensions}</span>
                      </div>
                    )}
                    {img.file_size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">{(img.file_size / 1024).toFixed(1)} KB</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Image ID:</span>
                      <span className="font-mono text-xs">{img.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Artist Profile Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">About the Artist</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {getUserInitials(img.user_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{img.user_name || 'Unknown Artist'}</p>
                    <p className="text-sm text-gray-600">{img.user_role || 'Community Member'}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewProfile(img.user_name)}
                    className="w-full bg-white/60 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/80 transition-colors flex items-center justify-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>View Artworks</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Artist Profile Modal Component
  const ArtistProfileModal = ({ artistName, images, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">
                  {getUserInitials(artistName)}
                </span>
              </div>
              
              {/* Artist Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {artistName || 'Unknown Artist'}
                </h2>
                <p className="text-gray-600">
                  {images.length} artwork{images.length !== 1 ? 's' : ''} shared
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Artist's Artworks */}
          <div className="p-6">
            {images.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🎨</div>
                <p className="text-xl text-gray-600">No artworks found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map(img => (
                  <ArtistImageCard key={img.id} img={img} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Simple Artist Image Card Component
  const ArtistImageCard = ({ img }) => {
    const imageUrl = getImageUrl(img.img_url);
    const [imageError, setImageError] = useState(false);
    
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200">
        {/* Image Display */}
        <div className="relative">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={`Artwork by ${img.user_name || 'Unknown'}`}
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center flex-col">
              <div className="text-gray-400 text-4xl mb-2">🖼️</div>
              <span className="text-gray-500 text-sm">Image not available</span>
            </div>
          )}
        </div>

        {/* Image Details */}
        <div className="p-4">
          {/* Prompt */}
          {img.prompt && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              "{img.prompt}"
            </p>
          )}
          
          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <button 
                onClick={() => handleLike(img.id)}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{img.likes || 0}</span>
              </button>
              
              {img.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{img.views}</span>
                </div>
              )}
            </div>
            
            {/* Creation Date */}
            <div className="text-xs text-gray-500">
              {formatRelativeTime(img.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800">AI Art Companion</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavButton onClick={() => navigate('/gen')}>Ai-art</NavButton>
          <NavButton onClick={() => navigate('/analyze')}>Analyze</NavButton>
          <NavButton onClick={() => navigate('/gallery')}>Gallery</NavButton>
          <NavButton onClick={() => navigate('/community')}>Community</NavButton>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <button onClick={() => navigate('/userdb')} className="border border-purple-300 rounded-full p-1 hover:shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getUserInitials(user.name)}</span>
              </div>
            </button>
          ) : (
            <>
              <NavButton onClick={() => navigate('/login')}>Sign In</NavButton>
              <button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Community <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover uploaded artworks shared by our talented community members.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading gallery...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
              <p>{error}</p>
              <button 
                onClick={() => fetchImages(page)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Gallery Content */}
        {!loading && !error && (
          <>
            {images.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🎨</div>
                <p className="text-xl text-gray-600 mb-2">No uploaded artworks yet.</p>
                <p className="text-gray-500">Be the first to share your creation!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {images.map(img => <ImageCard key={img.id} img={img} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded border border-purple-300 text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded transition-colors ${
                          page === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'border border-purple-300 text-purple-600 hover:bg-purple-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <span className="px-4 py-2 font-medium text-gray-700">
                  {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded border border-purple-300 text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-20 py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Share Your Art?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of creators and showcase your amazing artwork to the world.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/gen')}
              className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 shadow-md transition-all"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Create Artwork
            </button>
            {!user && (
              <button
                onClick={() => navigate('/signup')}
                className="border border-purple-300 text-purple-700 bg-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 shadow transition-all"
              >
                Join Community
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Gallery Modal */}
      {showModal && selectedImage && (
        <GalleryModal img={selectedImage} onClose={closeModal} />
      )}

      {/* Artist Profile Modal */}
      {showArtistProfile && selectedArtist && (
        <ArtistProfileModal 
          artistName={selectedArtist} 
          images={artistImages} 
          onClose={closeArtistProfile} 
        />
      )}
    </div>
  );
};

export default Gallery;