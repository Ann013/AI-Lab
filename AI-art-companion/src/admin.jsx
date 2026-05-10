import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Users, Trash2, Eye, X, Heart, Upload, FileImage } from 'lucide-react';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userGallery, setUserGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploaded'); // 'uploaded' or 'generated'
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      console.log('Fetched users data:', data);
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setLoading(false);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const fetchUserGallery = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-images/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserGallery(data.images);
        setShowGallery(true);
        setActiveTab('uploaded'); // Default to uploaded tab
      }
    } catch (error) {
      console.error('Error fetching user gallery:', error);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/delete-user/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(user => user.user_id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Replace the deleteImage function in your admin.jsx with this improved version


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteImage = async (imageId) => {
  if (!window.confirm('Remove image from gallery?')) return;

  try {
    const response = await fetch(`http://localhost:5000/api/mark-image-generated/${imageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      setUserGallery(prevGallery =>
        prevGallery.map(image =>
          image.id === imageId
            ? { ...image, upload_status: 'generated' } // 🔄 update status in UI
            : image
        )
      );
      alert(data.message || 'Image removed from gallery');
    } else {
      alert(data.message || 'Failed to remove image');
    }
  } catch (err) {
    console.error('Error updating image status:', err);
    alert('Error removing image');
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const closeGallery = () => {
    setShowGallery(false);
    setSelectedUser(null);
    setUserGallery([]);
    setActiveTab('uploaded');
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Filter images based on active tab
  const filteredImages = userGallery.filter(image => {
  if (activeTab === 'uploaded') {
    return image.upload_status === 'uploaded';
  } else if (activeTab === 'generated') {
    return true; // Show ALL images regardless of status
  }
  return false;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  const uploadedCount = userGallery.filter(img => img.upload_status === 'uploaded').length;
  const generatedCount = userGallery.filter(img => img.upload_status === 'generated').length;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleLogout = () => {
  localStorage.removeItem('user');
  navigate('/login'); // Redirect to login page after logout
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 return (
  <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
    {/* Sidebar Navigation */}
    <aside className="w-64 bg-white/70 border-r border-purple-100 shadow-md flex flex-col">
      <div className="p-6 flex items-center space-x-3 border-b border-purple-200">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-800">Admin Panel</span>
      </div>

      <nav className="mt-6 flex flex-col space-y-2 px-4">
        
        <button onClick={() => navigate('/admin')} className="flex items-center space-x-2 text-purple-700 font-semibold">
          <Users className="w-5 h-5" />
          <span >User Management</span>
        </button>
        <button
  onClick={handleLogout}
  className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition mt-4"
>
  <X className="w-5 h-5" />
  <span>Logout</span>
</button>

      </nav>
    </aside>

     

      {/* Main Content */}
     <main className="container mx-auto px-6 py-12 overflow-visible">
  <div className="text-center mb-12">
    <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-300 to-blue-400 bg-clip-text text-transparent leading-tight">
      User Management
    </h1>
    <p className="mt-6 text-lg text-gray-600">
      Manage users and view their artwork galleries
    </p>
  </div>

         {/* Example user table */}
      <table className="w-full bg-white rounded-xl shadow border border-purple-100">
        <thead className="bg-purple-50 border-b border-purple-100">
        <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Name</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Email</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Joined</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Generated</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Uploaded</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-purple-700">Likes</th>
        </tr>
        </thead>

        <tbody>
        {users && users.map((user, index) => (
            <tr key={index} className="border-b last:border-none hover:bg-purple-50/40">
            <td className="px-6 py-3 text-sm text-gray-800">{user.name}</td>
            <td className="px-6 py-3 text-sm text-gray-800">{user.email}</td>
            <td className="px-6 py-3 text-sm text-gray-800">
                {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-3 text-sm text-purple-700 font-semibold">{user.generated_count || 0}</td>
            <td className="px-6 py-3 text-sm text-purple-700 font-semibold">{user.uploaded_count || 0}</td>
            <td className="px-6 py-3 text-sm text-pink-600 font-semibold">{user.total_likes || 0}</td>
            </tr>
        ))}
        </tbody>

      </table>
    

        {/* Users Grid */}
        <div className="grid mt-12 md:grid-cols-4 lg:grid-cols-3 gap-6 max-w-8xl mx-auto">
          {users.map((user) => (
            <div key={user.user_id} className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 hover:bg-white/70 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User ID:</span> {user.user_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Joined:</span> {formatDate(user.created_at)}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    fetchUserGallery(user.user_id);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Gallery</span>
                </button>
                <button
                  onClick={() => deleteUser(user.user_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No users found</p>
          </div>
        )}
      </main>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {selectedUser?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedUser?.name}'s Gallery</h2>
                  <p className="text-gray-600">{userGallery.length} total artworks</p>
                </div>
              </div>
              <button
                onClick={closeGallery}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'uploaded'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Uploaded Images ({uploadedCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('generated')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'generated'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileImage className="w-4 h-4" />
                <span>Generated Images ({userGallery.length})</span>
              </button>
            </div>

            {/* Gallery Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-200 relative">
                        <img
                          src={`http://localhost:5000${image.img_url}`}
                          alt="User artwork"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS4zIDEwMC43TDEwMCA4NkwxMTQuNyAxMDAuN0wxMjkuNCAxMTUuNEwxNDQuMSAxMDAuN0wxNTggMTE0LjZWMTUwSDQyVjExNC42TDU2IDEwMC43TDcwLjcgMTE1LjRMODUuMyAxMDAuN1oiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                          {image.upload_status}
                        </div>
                        {/* Delete button for uploaded images */}
                        {image.upload_status === 'uploaded' && (
                            <button
                                onClick={() => deleteImage(image.id)}
                                className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="remove Generated"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            )}

                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-red-500">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{image.likes || 0}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(image.created_at)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            image.upload_status === 'uploaded' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {image.upload_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">
                    No {activeTab} artworks found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;