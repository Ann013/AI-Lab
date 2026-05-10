//WHERE IT IS STATED 'YOUR-KEY-HERE' PASTE UOUR API KEY THERE TO RUN THE PROJECT

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Download, RotateCcw, Scissors, Sparkles, AlertCircle, CheckCircle, Info,Upload, Wand2, Image,Loader2,RefreshCw,Settings,Type,ImageIcon,Lock,X,Eye} from 'lucide-react';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// AI Service key
const CLIPDROP_API_KEY = 'YOUR-KEY-HERE';
const CLIPDROP_BASE_URL = 'https://clipdrop-api.co';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class AIService {
  static async makeRequest(endpoint, formData, options = {}) {
    try {
      const response = await fetch(`${CLIPDROP_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'x-api-key': CLIPDROP_API_KEY },
        body: formData,
        ...options
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  static async generateImage(prompt, style = 'realistic') {
    const formData = new FormData();
    const styleModifiers = {
      realistic: 'photorealistic, highly detailed, 8k resolution',
      anime: 'anime style, manga art, vibrant colors, clean lines',
      'digital-painting': 'digital painting, concept art, detailed brushwork',
      cyberpunk: 'cyberpunk aesthetic, neon lights, futuristic, sci-fi',
      watercolor: 'watercolor painting, soft edges, flowing colors',
      'oil-painting': 'oil painting, classical art, rich textures',
      abstract: 'abstract art, geometric shapes, artistic interpretation',
      minimalist: 'minimalist design, clean composition, simple forms'
    };
    const enhancedPrompt = `${prompt}, ${styleModifiers[style] || styleModifiers.realistic}, masterpiece, high quality`;
    formData.append('prompt', enhancedPrompt);
    
    const blob = await this.makeRequest('/text-to-image/v1', formData);
    return URL.createObjectURL(blob);
  }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  static async removeBackground(imageFile) {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    const blob = await this.makeRequest('/remove-background/v1', formData);
    return URL.createObjectURL(blob);
  }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  static async enhanceImageCanvas(imageUrl) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);
          data[i + 1] = Math.min(255, data[i + 1] * 1.1);
          data[i + 2] = Math.min(255, data[i + 2] * 1.1);
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create enhanced image'));
          }
        }, 'image/png', 0.95);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for enhancement'));
      img.src = imageUrl;
    });
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function blobUrlToFile(blobUrl, filename) {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status}`);
    }
    
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Empty blob received');
    }
    
    // Ensure proper MIME type
    const mimeType = blob.type || 'image/png';
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.error('Error converting blob to file:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Stability AI Configuration (from imgimg.jsx)
const STABILITY_API_KEY = 'YOUR-KEY-HERE';
const STABILITY_BASE_URL = 'https://api.stability.ai';

const AiArtGenerator = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('text-to-image');

  // User state
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', avatar: null });

  // Get user from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user?.user_id;
const isLoggedIn = !!userId;


const [isEnhancing, setIsEnhancing] = useState(false);


  // Usage limit state
  const [usageCount, setUsageCount] = useState(0);
  const USAGE_LIMIT = 10;

  // Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null);

  // Text to Image State (from generate.jsx)
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [imageHistory, setImageHistory] = useState([]);
  const [processingAction, setProcessingAction] = useState(null);

  // Image Transform State (from imgimg.jsx)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStyle, setTransformStyle] = useState('photographic');
  const [transformMood, setTransformMood] = useState('happy');

  // Constants from generate.jsx
  const STYLES = [
    { id: 'realistic', name: 'Realistic', thumbnail: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'anime', name: 'Anime', thumbnail: 'https://images.pexels.com/photos/7735652/pexels-photo-7735652.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'digital-painting', name: 'Digital Painting', thumbnail: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'cyberpunk', name: 'Cyberpunk', thumbnail: 'https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'watercolor', name: 'Watercolor', thumbnail: 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'oil-painting', name: 'Oil Painting', thumbnail: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'abstract', name: 'Abstract', thumbnail: 'https://images.pexels.com/photos/1292243/pexels-photo-1292243.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'minimalist', name: 'Minimalist', thumbnail: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=200' }
  ];

  const MOODS = [
    { id: 'happy', name: 'Happy', colorPalette: ['#FFD700', '#FF6B6B', '#4ECDC4'], keywords: 'bright, cheerful, vibrant, joyful, uplifting' },
    { id: 'melancholic', name: 'Melancholic', colorPalette: ['#6C5CE7', '#A29BFE', '#74B9FF'], keywords: 'moody, contemplative, soft, introspective, gentle' },
    { id: 'dramatic', name: 'Dramatic', colorPalette: ['#D63031', '#74B9FF', '#2D3436'], keywords: 'intense, bold, high contrast, powerful, striking' },
    { id: 'dreamy', name: 'Dreamy', colorPalette: ['#FD79A8', '#FDCB6E', '#6C5CE7'], keywords: 'ethereal, soft, magical, surreal, whimsical' },
    { id: 'mysterious', name: 'Mysterious', colorPalette: ['#2D3436', '#636E72', '#6C5CE7'], keywords: 'dark, enigmatic, shadowy, atmospheric, noir' },
    { id: 'energetic', name: 'Energetic', colorPalette: ['#FF7675', '#FDCB6E', '#00B894'], keywords: 'dynamic, vibrant, action-packed, lively, electric' }
  ];

  // Constants from imgimg.jsx
  const styleOptions = [
    { id: 'photographic', name: 'Photographic', description: 'Realistic photography style', stabilityStyle: 'photographic' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style', stabilityStyle: 'anime' },
    { id: 'digital-art', name: 'Digital Art', description: 'Digital artwork style', stabilityStyle: 'digital-art' },
    { id: 'fantasy-art', name: 'Fantasy Art', description: 'Fantasy and magical themes', stabilityStyle: 'fantasy-art' },
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like cinematography', stabilityStyle: 'cinematic' },
    { id: 'comic-book', name: 'Comic Book', description: 'Comic book illustration style', stabilityStyle: 'comic-book' },
    { id: 'line-art', name: 'Line Art', description: 'Clean line drawings', stabilityStyle: 'line-art' },
    { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel art style', stabilityStyle: 'pixel-art' },
    { id: 'analog-film', name: 'Analog Film', description: 'Vintage film photography', stabilityStyle: 'analog-film' },
    { id: 'enhance', name: 'Enhanced', description: 'AI enhanced realism', stabilityStyle: 'enhance' },
    { id: 'neon-punk', name: 'Neon Punk', description: 'Futuristic neon aesthetic', stabilityStyle: 'neon-punk' },
    { id: '3d-model', name: '3D Model', description: '3D rendered appearance', stabilityStyle: '3d-model' }
  ];

  const VALID_DIMENSIONS = [
    { width: 1024, height: 1024 },
    { width: 1152, height: 896 },
    { width: 1216, height: 832 },
    { width: 1344, height: 768 },
    { width: 1536, height: 640 },
    { width: 640, height: 1536 },
    { width: 768, height: 1344 },
    { width: 832, height: 1216 },
    { width: 896, height: 1152 }
  ];
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setIsUserSignedIn(true);
      setUserInfo(parsed);
    }

    // Load usage count for non-signed-in users
    if (!storedUser) {
      const savedUsage = localStorage.getItem('guestUsageCount');
      if (savedUsage) {
        setUsageCount(parseInt(savedUsage, 10));
      }
    }
  }, []);

  // Check if user has reached usage limit
  const hasReachedLimit = () => {
    return !isUserSignedIn && usageCount >= USAGE_LIMIT;
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Increment usage count
  const incrementUsage = () => {
    if (!isUserSignedIn) {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('guestUsageCount', newCount.toString());
    }
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Navigation handlers
  const handleGenerate = () => navigate('/gen');
  const handleAnalyze = () => navigate('/analyze');
  const handleGallery = () => navigate('/gallery');
  const handleCommunity = () => navigate('/community');
  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');
  const handleDashboard = () => navigate('/userdb');
  const handleImgimg = () => navigate('/imgimg');

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Toast functions (from generate.jsx)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const simulateProgress = () => {
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    return interval;
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Text to Image functions (from generate.jsx)
  const generateArtwork = async () => {
     if (hasReachedLimit()) {
    showToast('You have reached the limit of 10 free generations. Please sign in to continue.', 'error');
    return;}

    if (!prompt.trim()) {
      showToast('Please enter a prompt to generate artwork', 'error');
      return;
    }
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProcessingAction('generating');
    const progressInterval = simulateProgress();
    
    try {
      const moodInfluence = {
        happy: 'bright, cheerful, vibrant colors, uplifting atmosphere',
        melancholic: 'contemplative, muted colors, soft lighting, emotional depth',
        dramatic: 'intense, high contrast, dramatic lighting, powerful composition',
        dreamy: 'ethereal, soft focus, pastel colors, magical atmosphere',
        mysterious: 'dark, mysterious, shadows, enigmatic mood',
        energetic: 'dynamic, bold colors, movement, high energy'
      };

      const enhancedPrompt = `${prompt}, ${moodInfluence[selectedMood]}`;
      const imageUrl = await AIService.generateImage(enhancedPrompt, selectedStyle);
      
      setGenerationProgress(100);
      
      const newImage = {
        id: Date.now(),
        url: imageUrl,
        prompt: prompt,
        style: selectedStyle,
        mood: selectedMood,
        timestamp: new Date().toISOString()
      };
      
      setImageHistory(prev => [newImage, ...prev.slice(0, 9)]);
      setGeneratedImage(imageUrl);
      showToast('Artwork generated successfully!');


      // Auto-upload if user is logged in
if (isLoggedIn) {
  try {
    const file = await blobUrlToFile(imageUrl, `artwork_${Date.now()}.png`);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('image', file);

    const response = await fetch('http://localhost:5000/api/generate-image-record', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!data.success) {
      console.error('Server did not save image:', data.message);
    }
  } catch (error) {
    console.error('Failed to notify server:', error);
  }
}
      
      // Increment usage count
      incrementUsage();
      
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      
      let errorMessage = 'Failed to generate artwork. Please try again.';
      if (error.message.includes('401')) errorMessage = 'Invalid API key. Please check your credentials.';
      else if (error.message.includes('429')) errorMessage = 'Rate limit exceeded. Please wait before generating again.';
      else if (error.message.includes('400')) errorMessage = 'Invalid prompt. Please try a different description.';
      
      showToast(errorMessage, 'error');
      console.error('Generation error:', error);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProcessingAction(null);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const downloadArtwork = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `ai-artwork-${Date.now()}.png`;
      link.click();
      showToast('Artwork downloaded!');
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const downloadHistoryImage = (imageUrl, imageData) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-artwork-${imageData.style}-${imageData.mood}-${Date.now()}.png`;
    link.click();
    showToast('Image downloaded!');
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const openHistoryModal = (image) => {
    setSelectedHistoryImage(image);
    setShowHistoryModal(true);
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistoryImage(null);
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const removeBackground = async (imageUrl) => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      setProcessingAction('removing-background');
      showToast('Removing background...', 'info');
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: 'image/png' });
      
      const processedImageUrl = await AIService.removeBackground(file);
      setGeneratedImage(processedImageUrl);
      showToast('Background removed successfully!');
    } catch (error) {
      showToast('Failed to remove background. Please try again.', 'error');
      console.error('Background removal error:', error);
    } finally {
      setIsGenerating(false);
      setProcessingAction(null);
    }
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Image Transform functions (from imgimg.jsx)
  const getBestDimensions = (originalWidth, originalHeight) => {
    const aspectRatio = originalWidth / originalHeight;
    
    let bestMatch = VALID_DIMENSIONS[0];
    let minDifference = Math.abs((bestMatch.width / bestMatch.height) - aspectRatio);
    
    for (const dim of VALID_DIMENSIONS) {
      const dimAspectRatio = dim.width / dim.height;
      const difference = Math.abs(dimAspectRatio - aspectRatio);
      
      if (difference < minDifference) {
        minDifference = difference;
        bestMatch = dim;
      }
    }
    
    return bestMatch;
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const resizeImage = (file, targetWidth, targetHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTransformedImage(null);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setTransformedImage(null);
      }
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const generatePrompt = () => {
    const selectedMoodObj = MOODS.find(mood => mood.id === transformMood);
    const selectedStyleObj = styleOptions.find(style => style.id === transformStyle);
    
    return `Transform this image with ${selectedMoodObj.name.toLowerCase()} mood, ${selectedMoodObj.keywords}, in ${selectedStyleObj.name.toLowerCase()} style, high quality, detailed`;
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const transformImage = async () => {
    if (hasReachedLimit()) {
    showToast('You have reached the limit of 10 free transformations. Please sign in to continue.', 'error');
    return;
  }



    if (!selectedFile) {
      alert('Please select an image to transform');
      return;
    }

    setIsTransforming(true);

    try {
      const img = document.createElement('img');
      const imagePromise = new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(selectedFile);
      });
      
      await imagePromise;
      
      const targetDimensions = getBestDimensions(img.width, img.height);
      const resizedFile = await resizeImage(selectedFile, targetDimensions.width, targetDimensions.height);
      const selectedStyleObj = styleOptions.find(style => style.id === transformStyle);

      const formData = new FormData();
      formData.append('init_image', resizedFile);
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', '0.35');
      formData.append('text_prompts[0][text]', generatePrompt());
      formData.append('text_prompts[0][weight]', '1');
      formData.append('cfg_scale', '7');
      formData.append('samples', '1');
      formData.append('steps', '30');
      formData.append('style_preset', selectedStyleObj.stabilityStyle);

      const response = await fetch(`${STABILITY_BASE_URL}/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const responseJSON = await response.json();
      
      if (responseJSON.artifacts && responseJSON.artifacts.length > 0) {
        const base64Data = responseJSON.artifacts[0].base64;
        const transformedUrl = `data:image/png;base64,${base64Data}`;
        setTransformedImage(transformedUrl);

      
        // Increment usage count
        incrementUsage();
      } else {
        throw new Error('No image generated');
      }

    } catch (error) {
      console.error('Transform error:', error);
      alert(`Failed to transform image: ${error.message}. Please try again.`);
    } finally {
      setIsTransforming(false);
    }
  };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const downloadTransformedImage = () => {
    if (transformedImage) {
      const link = document.createElement('a');
      link.href = transformedImage;
      link.download = `transformed-${transformStyle}-${transformMood}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const saveTransformedImage = async () => {
  if (!transformedImage || !isLoggedIn) return;
  
  try {
    const file = await blobUrlToFile(transformedImage, `transformed_${Date.now()}.png`);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('image', file);

    const response = await fetch('http://localhost:5000/api/generate-image-record', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      showToast('Image saved successfully!');
    } else {
      showToast('Failed to save image', 'error');
    }
  } catch (error) {
    console.error('Failed to save image:', error);
    showToast('Failed to save image', 'error');
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const ToastIcon = ({ type }) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Navigation */}
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
              </div>
            </button>
          ) : (
            <>
              <button onClick={handleLogin} className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</button>
              <button onClick={handleSignUp} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Create Amazing<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AI Artwork
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Generate from text or transform existing images with advanced AI technology.
          </p>
          
          {/* Usage Limit Display for non-signed-in users */}
          {!isUserSignedIn && (
              <div className="mt-6 inline-flex items-center bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2">
                <Lock className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm text-purple-700">
                  Free usage: {USAGE_LIMIT - usageCount}/{USAGE_LIMIT} remaining {usageCount >= USAGE_LIMIT ? '(Limit reached - Sign in for unlimited access)' : ''}
                </span>
              </div>
            )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
            <button
              onClick={() => setActiveTab('text-to-image')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'text-to-image'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Type className="w-5 h-5 mr-2" />
              Text to Image
            </button>
            <button
              onClick={() => setActiveTab('image-transform')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'image-transform'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Image Transform
            </button>
          </div>
        </div>

        {/* Text to Image Tab */}
        {activeTab === 'text-to-image' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="space-y-8">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Describe your artwork</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A majestic dragon soaring through a sunset sky, digital painting style..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 bg-white/50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 backdrop-blur-sm"
                  />
                </div>

                {/* Style Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Art Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          selectedStyle === style.id ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg' : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img src={style.thumbnail} alt={style.name} className="w-full h-16 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-2">
                          <span className="text-white text-xs font-semibold">{style.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Mood & Atmosphere</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          selectedMood === mood.id ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 hover:border-purple-300 bg-white/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {mood.colorPalette.map((color, idx) => (
                            <div key={idx} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{mood.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateArtwork}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center px-6 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {isGenerating && processingAction === 'generating' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Artwork...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Artwork
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {isGenerating && processingAction === 'generating' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {!generatedImage ? (
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your generated artwork will appear here</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full group">
                    <img 
                      src={generatedImage} 
                      alt="Generated artwork" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={downloadArtwork}
                          disabled={isGenerating}
                          className="flex items-center px-3 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm disabled:opacity-50"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                        <button 
                          onClick={generateArtwork}
                          disabled={isGenerating || hasReachedLimit()}
                          className="flex items-center px-3 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Regenerate
                        </button>
                        <button 
                          onClick={() => removeBackground(generatedImage)}
                          disabled={isGenerating}
                          className="flex items-center px-3 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm disabled:opacity-50"
                        >
                          <Scissors className="w-4 h-4 mr-1" />
                          {processingAction === 'removing-background' ? 'Processing...' : 'Remove BG'}
                        </button>
                        
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Processing Status */}
              {isGenerating && processingAction !== 'generating' && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    <span className="text-sm font-medium">
                      {processingAction === 'enhancing' && 'Enhancing your image...'}
                      {processingAction === 'removing-background' && 'Removing background...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Transform Tab */}
        {activeTab === 'image-transform' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Panel - Upload & Controls */}
              <div className="space-y-6">
                {/* File Upload */}
                <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-purple-500" />
                    <span>Upload Image</span>
                  </h3>
                  
                  <div
                    className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-300 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Image className="w-12 h-12 text-purple-300 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">Drop your image here</p>
                          <p className="text-sm text-gray-500">or click to browse</p>
                          <p className="text-xs text-gray-400 mt-2">Images will be automatically resized to optimal dimensions</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Transform Controls */}
                <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    <span>Transform Settings</span>
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Mood Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose Mood
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {MOODS.map((mood) => (
                          <button
                            key={mood.id}
                            onClick={() => setTransformMood(mood.id)}
                            className={`p-3 rounded-lg border transition-all relative overflow-hidden ${
                              transformMood === mood.id
                                ? 'border-purple-400 bg-purple-50 text-purple-700'
                                : 'border-purple-200 bg-white/60 text-gray-700 hover:bg-white/80'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {mood.colorPalette.slice(0, 3).map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{mood.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Style Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Art Style
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {styleOptions.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setTransformStyle(style.id)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              transformStyle === style.id
                                ? 'border-purple-400 bg-purple-50 text-purple-700'
                                : 'border-purple-200 bg-white/60 text-gray-700 hover:bg-white/80'
                            }`}
                          >
                            <div className="text-sm font-medium">{style.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
  onClick={transformImage}
  disabled={!selectedFile || isTransforming}
  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
>
  {isTransforming ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Transforming...</span>
    </>
  ) : (
    <>
      <Wand2 className="w-5 h-5" />
      <span>Transform Image</span>
    </>
  )}
</button>

                </div>
              </div>

              {/* Right Panel - Result */}
              <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Transformed Image</span>
                </h3>

                        <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 min-h-96 flex items-center justify-center">
                          {transformedImage ? (
                            <div className="w-full space-y-4">
                              <img 
                                src={transformedImage} 
                                alt="Transformed artwork" 
                                className="w-full h-auto max-h-96 object-contain rounded-lg mx-auto block"
                              />
                              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                                <button
                                  onClick={downloadTransformedImage}
                                  className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </button>
                                {isLoggedIn && (
                                  <button
                                    onClick={saveTransformedImage}
                                    className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 flex items-center justify-center space-x-2"
                                  >
                                    <Upload className="w-4 h-4" />
                                    <span>Save</span>
                                  </button>
                                )}
                              </div>
                              </div>
                                    ) : isTransforming ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                      <p className="text-lg font-medium text-gray-700">Creating your transformation...</p>
                      <p className="text-sm text-gray-500">Applying {styleOptions.find(s => s.id === transformStyle)?.name} style with {MOODS.find(m => m.id === transformMood)?.name.toLowerCase()} mood</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <Image className="w-16 h-16 text-purple-300 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">Your transformed image will appear here</p>
                        <p className="text-sm text-gray-500">Upload an image and select your preferred style and mood</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image History (only show for text-to-image) */}
        {activeTab === 'text-to-image' && imageHistory.length > 0 && (
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Generations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {imageHistory.map((image) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.prompt}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => openHistoryModal(image)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHistoryModal(image);
                        }}
                        className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadHistoryImage(image.url, image);
                        }}
                        className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedHistoryImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Generated Artwork</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedHistoryImage.timestamp).toLocaleDateString()} • 
                  {selectedHistoryImage.style} • {selectedHistoryImage.mood}
                </p>
              </div>
              <button
                onClick={closeHistoryModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  <img
                    src={selectedHistoryImage.url}
                    alt="Generated artwork"
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg"
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadHistoryImage(selectedHistoryImage.url, selectedHistoryImage)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedImage(selectedHistoryImage.url);
                        closeHistoryModal();
                      }}
                      className="flex-1 bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View in Editor</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  {/* Prompt */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Original Prompt</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedHistoryImage.prompt}</p>
                    </div>
                  </div>

                  {/* Style & Mood */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Art Style</h4>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-700 capitalize">
                          {selectedHistoryImage.style.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Mood</h4>
                      <div className="bg-pink-50 p-3 rounded-lg flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {MOODS.find(m => m.id === selectedHistoryImage.mood)?.colorPalette.slice(0, 3).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium text-pink-700 capitalize">
                          {selectedHistoryImage.mood}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Generation Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Generation Details</h4>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-blue-700 font-medium">
                          {new Date(selectedHistoryImage.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Image ID:</span>
                        <span className="text-blue-700 font-mono text-xs">
                          {selectedHistoryImage.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setPrompt(selectedHistoryImage.prompt);
                          setSelectedStyle(selectedHistoryImage.style);
                          setSelectedMood(selectedHistoryImage.mood);
                          closeHistoryModal();
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Use Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedHistoryImage.prompt);
                          showToast('Prompt copied to clipboard!');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Copy Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 max-w-sm">
            <div className="flex items-center">
              <div className="mr-3">
                <ToastIcon type={toast.type} />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiArtGenerator;