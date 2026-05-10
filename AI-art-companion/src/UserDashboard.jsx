import React, { useEffect, useState } from 'react';
import {
  Upload, User, Heart, Palette, Edit3, Calendar, Settings, LogOut, Eye, Download, X, Copy, Edit, Trash2,
  Sliders, Sun, Moon, Contrast, Lightbulb, Droplets, Resize, Save, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const base = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md';
  const variants = {
    primary: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500',
    outline: 'border-2 border-purple-400 text-purple-400 hover:bg-purple-50',
    danger: 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const ProfileIcon = ({ name, className = "w-10 h-10" }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md`}>
      {initials}
    </div>
  );
};

// Toast notification component
const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
useEffect
  if (!isVisible) return null;

  const bgColor = type === 'error' ? '#ef4444' : '#10b981';

  return (
    <div className="fixed top-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-0 opacity-100" style={{backgroundColor: bgColor}}>
      {message}
    </div>
  );
};

// Image Editor Component
const ImageEditor = ({ artwork, isOpen, onClose, onSave, user }) => {
  const [editSettings, setEditSettings] = useState({
    
    contrast: 0,
    brightness: 0,
    saturation: 0,
    temperature: 0,
    vibrance: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
 

  useEffect(() => {
    if (artwork && isOpen) {
      setEditSettings({
        contrast: 0,
        brightness: 0,
        saturation: 0,
        temperature: 0,
        vibrance: 0,
      });
    }
  }, [artwork, isOpen]);

  const handleSliderChange = (setting, value) => {
    setEditSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };


  const resetSettings = () => {
    setEditSettings({
      contrast: 0,
      brightness: 0,
      saturation: 0,
      temperature: 0,
      vibrance: 0,
    });
  };


  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call to save edited image
      const response = await fetch(`${API_BASE_URL}/api/edit-artwork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artwork_id: artwork.id,
          user_id: user.user_id,
          edit_settings: editSettings
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSave && onSave(result);
        onClose();
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !artwork) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Editor Modal */}
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Edit3 className="w-6 h-6 mr-2" />
                Edit Artwork
              </h2>
              <p className="text-sm text-gray-600">Adjust mood, lighting, and image properties</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(95vh-140px)] overflow-auto">
            {/* Image Preview Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Image Preview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Image */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Original</p>
                    <img
                      src={`${API_BASE_URL}${artwork.img_url}`}
                      alt="Original artwork"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  </div>
                  
                  {/* Edited Preview */}
                <div>
  <p className="text-sm text-gray-600 mb-2">Preview </p>
  <div className="relative w-full h-64 bg-gray-200 rounded-lg shadow-md overflow-hidden">
    
    <img
  src={`${API_BASE_URL}${artwork.img_url}`}
  alt="Live preview"
  className="w-full h-full object-cover transition-all duration-300"
  style={{
    filter: `
      brightness(${100 + editSettings.brightness}%)
      contrast(${100 + editSettings.contrast}%)
      saturate(${100 + editSettings.saturation}%)
      hue-rotate(${editSettings.temperature * 1.8}deg)
    `
  }}
/>
  </div>
</div>
                </div>

                
                
              </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
             
              {/* Image Properties */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Sliders className="w-5 h-5 mr-2 text-blue-600" />
                  Image Properties
                </h3>

                <div className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Brightness ({editSettings.brightness})
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editSettings.brightness}
                      onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Contrast className="w-4 h-4 mr-2" />
                      Contrast ({editSettings.contrast})
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editSettings.contrast}
                      onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Droplets className="w-4 h-4 mr-2" />
                      Saturation ({editSettings.saturation})
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editSettings.saturation}
                      onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Sun className="w-4 h-4 mr-2" />
                      Temperature ({editSettings.temperature})
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editSettings.temperature}
                      onChange={(e) => handleSliderChange('temperature', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Save className="w-5 h-5 mr-2 text-green-600" />
                  Save Changes
                </h3>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Saving...' : 'Save Edited Image'}
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="secondary"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  * Saving will create a new version of your artwork
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, artworkId }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 opacity-0 animate-pulse"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Artwork
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(artworkId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Artwork Detail Modal Component
const ArtworkModal = ({ artwork, isOpen, onClose, onMarkAsUploaded, onDelete, onEdit, user }) => {
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  const hideToast = () => {
    setToast({ message: '', isVisible: false, type: 'success' });
  };

  const handleDownload = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  fetch(`${API_BASE_URL}${artwork.img_url}`)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `artwork_${artwork.id}_${formatDate(artwork.created_at).replace(/\s+/g, '_')}.jpg`;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Artwork downloaded successfully!');
    })
    .catch(error => {
      console.error('Download failed:', error);
      showToast('Download failed. Please try again.', 'error');
    });
};

  const handleCopyId = () => {
    navigator.clipboard.writeText(artwork.id.toString());
    showToast('Artwork ID copied to clipboard!');
  };

  const handleDelete = () => {
    onDelete(artwork.id);
    onClose();
  };

  const handleEdit = () => {
    onEdit(artwork);
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'uploaded' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  if (!isOpen || !artwork) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-200 scale-95 hover:scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Artwork Details</h2>
              <p className="text-sm text-gray-600">{formatDate(artwork.created_at)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-140px)] overflow-auto">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={`${API_BASE_URL}${artwork.img_url}`}
                  alt="Artwork"
                  className="w-full h-80 object-cover rounded-xl shadow-md"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzUgOTZMMTU1IDExNkwxNDUgMTI2IiBzdHJva2U9IiM5QzlDQTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                  }}
                />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="font-semibold text-gray-700">{artwork.likes || 0} Likes</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(artwork.upload_status)}`}>
                  {artwork.upload_status === 'uploaded' ? 'Uploaded' : 'Generated'}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Artwork Information */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-600" />
                  Artwork Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created Date:</span>
                    <span className="font-medium text-blue-600">{formatDate(artwork.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Artwork ID:</span>
                    <button 
                      onClick={handleCopyId}
                      className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
                    >
                      {artwork.id}
                      <Copy className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(artwork.upload_status)}`}>
                      {artwork.upload_status === 'uploaded' ? 'Uploaded to Gallery' : 'Generated Only'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generation Details (if available) */}
              {(artwork.prompt || artwork.style || artwork.mood) && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-purple-600" />
                    Generation Details
                  </h3>
                  <div className="space-y-3">
                    {artwork.prompt && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Original Prompt:</span>
                        <p className="text-sm bg-white p-3 rounded-lg border">{artwork.prompt}</p>
                      </div>
                    )}
                    {artwork.style && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Art Style:</span>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {artwork.style}
                        </span>
                      </div>
                    )}
                    {artwork.mood && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Mood:</span>
                        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                          {artwork.mood}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Image
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>

                  {artwork.upload_status !== 'uploaded' && (
                    <button
                      onClick={() => {
                        onMarkAsUploaded(artwork.id, artwork.img_url);
                        showToast('Artwork marked as uploaded!');
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Mark as Uploaded
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={hideToast} type={toast.type} />
    </>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ artwork_count: 0, total_likes: 0 });
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', bio: '', location: '', website: '' });
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, artworkId: null });
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  const hideToast = () => {
    setToast({ message: '', isVisible: false, type: 'success' });
  };

 useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  if (storedUser) {
    setUser(storedUser);
    fetchUserProfile(storedUser.user_id);
  } else {
    setIsLoading(false);
  }
}, []);

const fetchUserProfile = async (userId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/user-profile-data/${userId}`);
    const data = await res.json();
    if (data.success) {
      setProfileData({
        name: data.profile.name || '',
        email: data.profile.email || '',
        bio: data.profile.bio || '',
        location: data.profile.location || '',
        website: data.profile.website || ''
      });
    }
    fetchUserStats(userId);
  } catch (err) {
    console.error('Fetch profile error:', err);
    setIsLoading(false);
  }
};

  const fetchUserStats = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-stats/${userId}`);
      const data = await res.json();
      setStats({
        artwork_count: data.artwork_count || 0,
        total_likes: data.total_likes || 0,
      });
      setRecentArtworks(data.recent_artworks || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleNavigate = (path) => navigate(path);

  const handleMarkAsUploaded = async (artId, imgUrl) => {
    try {
      console.log('Marking as uploaded:', { 
        image_id: artId, 
        user_id: user.user_id, 
        img_url: imgUrl 
      });
      
      const res = await fetch(`${API_BASE_URL}/api/mark-uploaded`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          image_id: artId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log('Upload response:', result);

      if (result.success) {
        const updatedArtworks = recentArtworks.map(a =>
          a.id === artId ? { ...a, upload_status: 'uploaded' } : a
        );
        setRecentArtworks(updatedArtworks);
        
        // Update selected artwork if it's the same one
        if (selectedArtwork && selectedArtwork.id === artId) {
          setSelectedArtwork({ ...selectedArtwork, upload_status: 'uploaded' });
        }
        
        fetchUserStats(user.user_id);
        showToast('Image marked as uploaded successfully!');
      } else {
        console.error('Upload failed:', result.message);
        showToast(`Upload failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(`Network error occurred: ${error.message}. Please check your connection and try again.`, 'error');
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    try {
      console.log('Deleting artwork:', artworkId, 'for user:', user.user_id);
      
      const res = await fetch(`${API_BASE_URL}/api/delete-artwork/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.user_id
        })
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      // Check if response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await res.text();
        console.error('Server returned non-JSON response:', textResponse);
        showToast('Server error: Invalid response format', 'error');
        return;
      }

      const result = await res.json();
      console.log('Delete response:', result);

      if (res.ok && result.success) {
        // Remove the artwork from the state
        const updatedArtworks = recentArtworks.filter(art => art.id !== artworkId);
        setRecentArtworks(updatedArtworks);
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          artwork_count: prevStats.artwork_count - 1
        }));

        // Close modals
        setDeleteModal({ isOpen: false, artworkId: null });
        
        showToast('Artwork deleted successfully!');
        
        // Refresh user stats
        fetchUserStats(user.user_id);
      } else {
        showToast(`Failed to delete artwork: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.message.includes('Unexpected token')) {
        showToast('Server returned invalid response. Please check if the API endpoint exists.', 'error');
      } else {
        showToast('Network error occurred while deleting artwork.', 'error');
      }
    }
  };

  const handleArtworkClick = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const handleEditArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    setIsEditorOpen(true);
  };

  const handleSaveEditedArtwork = (editedArtwork) => {
    // Update the artwork in the state
    const updatedArtworks = recentArtworks.map(art =>
      art.id === editedArtwork.id ? editedArtwork : art
    );
    setRecentArtworks(updatedArtworks);
    
    // Refresh user stats
    fetchUserStats(user.user_id);
    showToast('Artwork edited successfully!');
  };

  const handleDownload = (artwork) => {
  fetch(`${API_BASE_URL}${artwork.img_url}`)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `artwork_${artwork.id}_${formatDate(artwork.created_at).replace(/\s+/g, '_')}.jpg`;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Download failed:', error);
      showToast('Download failed. Please try again.', 'error');
    });
};
  const openDeleteModal = (artworkId) => {
    setDeleteModal({ isOpen: true, artworkId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, artworkId: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800">AI Art Companion</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => handleNavigate('/gen')} className="text-gray-600 hover:text-purple-600 transition-colors">Ai-art</button>
          <button onClick={() => handleNavigate('/analyze')} className="text-gray-600 hover:text-purple-600 transition-colors">Analyze</button>
          <button onClick={() => handleNavigate('/gallery')} className="text-gray-600 hover:text-purple-600 transition-colors">Gallery</button>
          <button onClick={() => handleNavigate('/community')} className="text-gray-600 hover:text-purple-600 transition-colors">Community</button>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <button onClick={() => handleNavigate('/userdb')} className="border border-purple-300 rounded-full p-1 hover:shadow-md">
              <ProfileIcon name={user.name} />
            </button>
          ) : (
            <>
              <button onClick={() => handleNavigate('/login')} className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</button>
              <button onClick={() => handleNavigate('/signup')} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Dashboard Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <p className="text-gray-600 text-xl mb-6">Please log in to view your dashboard</p>
          <Button onClick={() => handleNavigate('/login')}>Go to Login</Button>
        </div>
      ) : (
        <div className="px-6 py-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <ProfileIcon name={user.name} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
                <p className="text-gray-600">Your artistic dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'artworks', label: 'Artworks', icon: Upload },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100'}`}
              >
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={Upload} label="Artworks Created" value={stats.artwork_count} color="purple" />
                <StatCard icon={Heart} label="Total Likes" value={stats.total_likes} color="pink" />
                <StatCard icon={User} label="Email" value={user.email} color="blue" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Artworks</h2>
                {recentArtworks.length === 0 ? (
                  <div className="text-gray-500">No artworks yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentArtworks.map(art => (
                      <div key={art.id} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleArtworkClick(art)}>
                        <img 
                          src={`${API_BASE_URL}${art.img_url}`} 
                          alt="art" 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzUgOTZMMTU1IDExNkwxNDUgMTI2IiBzdHJva2U9IiM5QzlDQTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                        <div className="p-3 text-sm text-gray-700 flex justify-between">
                          <span><Heart className="w-4 h-4 inline text-pink-500 mr-1" /> {art.likes || 0}</span>
                          <span>{formatDate(art.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'artworks' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">My Artworks ({stats.artwork_count})</h2>

              {recentArtworks.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm p-12 rounded-xl border border-purple-100 text-center">
                  <Upload className="mx-auto text-gray-400 mb-4 w-16 h-16" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No artworks yet</h3>
                  <p className="text-gray-600 mb-6">Start creating amazing AI-generated artwork</p>
                  <Button onClick={() => handleNavigate('/gen')}>
                    Create Your First Artwork
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentArtworks.map((art) => (
                    <div key={art.id} className="bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                      <div className="relative">
                        <img
                          src={`${API_BASE_URL}${art.img_url}`}
                          alt="art"
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => handleArtworkClick(art)}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzUgOTZMMTU1IDExNkwxNDUgMTI2IiBzdHJva2U9IiM5QzlDQTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                        
                        {/* Hover overlay with action buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtworkClick(art);
                            }}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditArtwork(art);
                            }}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Edit Image"
                          >
                            <Edit className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(art);
                            }}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(art.id);
                            }}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-pink-500" />
                            {art.likes || 0} Likes
                          </span>
                          <span>{formatDate(art.created_at)}</span>
                        </div>

                        {/* Status indicator */}
                        <div className="mb-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            art.upload_status === 'uploaded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                             {art.upload_status === 'uploaded' ? 'Uploaded' : art.upload_status === 'edited' ? 'Edited' : 'Generated'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditArtwork(art)}
                            variant="secondary"
                            className="flex-1 text-sm py-2"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {art.upload_status !== 'uploaded' && (
                            <Button
                              onClick={() => handleMarkAsUploaded(art.id, art.img_url)}
                              variant="primary"
                              className="flex-1 text-sm py-2"
                            >
                              Upload
                            </Button>
                          )}
                          <Button
                            onClick={() => openDeleteModal(art.id)}
                            variant="danger"
                            className="text-sm py-2 px-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
  <div className="bg-white/60 p-6 rounded-xl shadow-sm max-w-2xl">
    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
      <Settings className="w-5 h-5 mr-2 text-purple-600" />
      Edit Profile
    </h2>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Name" 
          value={profileData.name} 
          disabled={!isEditing}
          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
        />
        <InputField 
          label="Email" 
          value={profileData.email} 
          disabled={!isEditing}
          type="email"
          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
        />
      </div>

      <TextAreaField
        label="Bio"
        value={profileData.bio}
        disabled={!isEditing}
        placeholder="Tell us about yourself and your artistic journey..."
        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Location" 
          value={profileData.location} 
          disabled={!isEditing}
          placeholder="e.g., New York, USA"
          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} 
        />
        <InputField 
          label="Website" 
          value={profileData.website} 
          disabled={!isEditing}
          type="url"
          placeholder="https://your-portfolio.com"
          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} 
        />
      </div>

      {!isEditing ? (
        <Button onClick={() => setIsEditing(true)} className="mt-4 flex items-center">
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      ) : (
        <div className="flex space-x-4 mt-4">
          <Button onClick={async () => {
            setIsUpdating(true);
            try {
              const res = await fetch(`${API_BASE_URL}/api/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, ...profileData })
              });
              const result = await res.json();
              if (result.success) {
                const updated = { ...user, name: profileData.name, email: profileData.email };
                setUser(updated);
                localStorage.setItem('user', JSON.stringify(updated));
                setIsEditing(false);
                showToast('Profile updated successfully!');
              } else {
                showToast('Failed to update profile.', 'error');
              }
            } catch (err) {
              showToast('Server error', 'error');
            } finally {
              setIsUpdating(false);
            }
          }} disabled={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            fetchUserProfile(user.user_id);
          }}>Cancel</Button>
        </div>
      )}
    </div>

    {/* Profile Preview */}
    {!isEditing && (
      <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2 text-purple-600" />
          Profile Preview
        </h3>
        <div className="space-y-2 text-sm">
          {profileData.bio && (
            <div>
              <span className="text-gray-600 font-medium">Bio:</span>
              <p className="text-gray-700 mt-1">{profileData.bio}</p>
            </div>
          )}
          {profileData.location && (
            <div>
              <span className="text-gray-600 font-medium">Location:</span>
              <p className="text-gray-700">{profileData.location}</p>
            </div>
          )}
          {profileData.website && (
            <div>
              <span className="text-gray-600 font-medium">Website:</span>
              <a 
                href={profileData.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                {profileData.website}
              </a>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Delete Account Button */}
              <div className="mt-8 p-6 bg-red-50 rounded-xl border-2 border-red-200">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Danger Zone
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your profile, artworks, and all associated data.
                </p>
                <Button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/delete-user/${user.user_id}`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        const result = await res.json();
                        if (res.ok && result.success) {
                          localStorage.removeItem('user');
                          showToast('Account deleted successfully!');
                          setTimeout(() => navigate('/signup'), 2000);
                        } else {
                          showToast('Failed to delete account', 'error');
                        }
                      } catch (error) {
                        showToast('Error deleting account', 'error');
                      }
                    }
                  }}
                  variant="danger"
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
  </div>
)}
        </div>
      )}

      {/* Artwork Detail Modal */}
      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArtwork(null);
        }}
        onMarkAsUploaded={handleMarkAsUploaded}
        onDelete={openDeleteModal}
        onEdit={handleEditArtwork}
        user={user}
      />

      {/* Image Editor Modal */}
      <ImageEditor
        artwork={selectedArtwork}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedArtwork(null);
        }}
        onSave={handleSaveEditedArtwork}
        user={user}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteArtwork}
        artworkId={deleteModal.artworkId}
      />

      {/* Toast Notification */}
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={hideToast} type={toast.type} />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/60 p-4 rounded-xl text-center shadow-sm">
    <Icon className={`mx-auto text-${color}-600 w-6 h-6 mb-1`} />
    <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
    <p className="text-gray-700 text-sm">{label}</p>
  </div>
);

const InputField = ({ label, value, onChange, disabled, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full p-3 rounded-lg border transition-colors ${
        disabled 
          ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed' 
          : 'bg-white border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none'
      }`}
    />
  </div>
);

const TextAreaField = ({ label, value, onChange, disabled, placeholder = '' }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      rows={4}
      className={`w-full p-3 rounded-lg border transition-colors resize-none ${
        disabled 
          ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed' 
          : 'bg-white border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none'
      }`}
    />
  </div>
);

export default UserDashboard;