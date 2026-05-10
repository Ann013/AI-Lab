import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Upload, CheckCircle, AlertTriangle, Info, Palette, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

//WHERE IT IS STATED 'YOUR-KEY-HERE' PASTE UOUR API KEY THERE TO RUN THE PROJECT

const GEMINI_API_KEY = 'YOUR-KEY-HERE';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const Analyze = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState('perspective');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', avatar: null });
  const [freeUsesRemaining, setFreeUsesRemaining] = useState(10);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsUserSignedIn(true);
      setUserInfo(parsedUser);
    } else {
      const storedUses = localStorage.getItem('freeAnalysisUses');
      if (storedUses) {
        setFreeUsesRemaining(parseInt(storedUses));
      }
    }
  }, []);

  const ANALYSIS_TYPES = [
    { id: 'perspective', name: 'Perspective Check', description: 'Is the 3D depth and angles realistic?' },
    { id: 'anatomy', name: 'Body Proportions', description: 'Are the body parts the right size and shape?' },
    { id: 'mood', name: 'Mood & Colors', description: 'Get color palette suggestions based on your desired mood' }
  ];

  const MOOD_OPTIONS = [
    { id: 'happy', name: '😊 Happy & Energetic', colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] },
    { id: 'calm', name: '🌸 Calm & Peaceful', colors: ['#B8E6B8', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB6C1'] },
    { id: 'dramatic', name: '🔥 Bold & Dramatic', colors: ['#DC143C', '#8B0000', '#FF4500', '#B22222', '#800080'] },
    { id: 'mysterious', name: '🌙 Dark & Mysterious', colors: ['#2F4F4F', '#483D8B', '#800080', '#8B008B', '#4B0082'] },
    { id: 'nature', name: '🌿 Natural & Earthy', colors: ['#228B22', '#8FBC8F', '#DEB887', '#D2691E', '#CD853F'] },
    { id: 'dreamy', name: '✨ Soft & Dreamy', colors: ['#E6E6FA', '#F0F8FF', '#FFF8DC', '#FFFACD', '#F5F5DC'] }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleAnalyzeImage = async () => {
    if (!uploadedFile) return;
    
    if (!isUserSignedIn && freeUsesRemaining <= 0) {
      setAnalysisResult({
        error: true,
        message: "You've used all your free analyses! Sign up to continue getting feedback on your artwork."
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64 = await toBase64(uploadedFile);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const getPrompt = (type) => {
        const baseStructure = `You are an encouraging art teacher analyzing student artwork. Be positive and supportive and on point while providing constructive feedback.

SCORING GUIDELINES (be generous and encouraging):
- 90-100: Exceptional work with strong technical skills and artistic vision
- 80-89: Very good work with solid fundamentals and creative expression
- 70-79: Good work showing developing skills and artistic understanding
- 60-69: Decent effort with some technical issues but shows potential
- 50-59: Beginner work with multiple areas for improvement but shows promise
- Below 50: Only for work with fundamental issues across all areas

Remember: This is about encouraging artistic growth and pointing out important factors to improve. Focus on what's working well and provide constructive guidance for improvement. Consider the effort, creativity, and artistic expression, not just technical perfection.

Analyze this artwork and provide detailed, encouraging feedback. Return only valid JSON in this exact format:
{
  "score": [Give a fair, encouraging score from 0-100 based on overall artistic merit, effort, and skill level shown],
  "whatYouDidWell": "Specific positive feedback highlighting the strengths and successful elements in this artwork",
  "mainIssues": [{"problem": "specific area for improvement", "whyItMatters": "why improving this will enhance the artwork", "howToFix": "practical, actionable advice to improve this aspect"}],
  "quickTips": ["practical, easy-to-implement tips for immediate improvement"],
  "encouragement": "Motivating, personalized message that acknowledges the artist's effort and potential"`;

        const prompts = {
          perspective: `${baseStructure}}

Focus your analysis on: perspective accuracy, depth perception, spatial relationships, vanishing points, foreshortening, most suited form of prespective for drawn object and 3D form representation. Give credit for attempts at perspective even if not perfect.`,

          anatomy: `${baseStructure}}

Focus your analysis on: body proportions, anatomical structure, figure construction, gesture, and overall form. Consider the style and artistic intent - not all art needs perfect realism.`,

          mood: `${baseStructure},
  "colorPalettes": [{"mood": "suggested mood name", "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"], "description": "explanation of why these colors would enhance the artwork's emotional impact"}]}

Focus your analysis on: color harmony, emotional expression, mood conveyance, color theory application, and atmospheric effects. Suggest palettes that would complement or enhance the existing artwork.`
        };
        return prompts[type];
      };

      const result = await model.generateContent([
        { text: getPrompt(selectedAnalysis) },
        { inlineData: { data: base64.split(',')[1], mimeType: uploadedFile.type } }
      ]);

      let text = result.response.text().trim();
      text = text.replace(/```json|```/g, '').trim();
      
      const parsed = JSON.parse(text);
      
      // Ensure score is reasonable - add a minimum boost for any complete artwork
      if (parsed.score && parsed.score < 50) {
        parsed.score = Math.max(parsed.score, 55); // Minimum score for any submitted artwork
      }
      
      setAnalysisResult(parsed);
      
      if (!isUserSignedIn) {
        const newUsesRemaining = freeUsesRemaining - 1;
        setFreeUsesRemaining(newUsesRemaining);
        localStorage.setItem('freeAnalysisUses', newUsesRemaining.toString());
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        error: true,
        message: "Something went wrong analyzing your artwork. Please try again!"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ColorPalette = ({ colors, mood }) => (
    <div className="flex items-center space-x-2 mb-2">
      <div className="flex space-x-1">
        {colors.map((color, i) => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: color}} />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{mood}</span>
    </div>
  );

  const handleGenerate = () => navigate('/gen');
  const handleAnalyze = () => navigate('/analyze');
  const handleGallery = () => navigate('/gallery');
  const handleCommunity = () => navigate('/community');
  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');
  const handleDashboard = () => navigate('/userdb');

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

      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 flex items-center space-x-2 w-fit mx-auto mb-6">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium">AI Art Teacher</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Get Friendly Art
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Feedback & Tips</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Upload your artwork and get easy-to-understand feedback that helps you improve</p>
          
          {!isUserSignedIn && (
              <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 shadow-sm">
                <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-purple-600">Free usage: <span className="font-medium text-purple-600">{freeUsesRemaining}/10 remaining</span></span>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Upload & Controls */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>Upload Your Art</span>
            </h3>
            
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-300 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="imageUpload" />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 mb-2">Click to upload your drawing</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img src={uploadedImage} alt="Your artwork" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={() => setUploadedImage(null)} className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-lg text-sm hover:bg-black/70 transition-colors">Change Image</button>
              </div>
            )}

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">What should I check?</h4>
              <div className="space-y-3">
                {ANALYSIS_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedAnalysis(type.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnalysis === type.id ? 'border-purple-300 bg-purple-50' : 'border-purple-100 bg-white/40 hover:border-purple-200 hover:bg-white/60'
                    }`}
                  >
                    <div className="font-medium text-gray-800 mb-1">{type.name}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedAnalysis === 'mood' && (
              <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h5 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span>Popular Mood Palettes</span>
                </h5>
                <div className="space-y-2">
                  {MOOD_OPTIONS.slice(0, 3).map(mood => (
                    <ColorPalette key={mood.id} colors={mood.colors} mood={mood.name} />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyzeImage}
              disabled={!uploadedImage || isAnalyzing || (!isUserSignedIn && freeUsesRemaining <= 0)}
              className={`w-full mt-8 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                !uploadedImage || isAnalyzing || (!isUserSignedIn && freeUsesRemaining <= 0) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  <span>Get My Feedback</span>
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Your Artwork</span>
            </h3>
            
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-purple-100">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 mb-2">Your artwork will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 hover:bg-white/70 transition-all">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span>Your Feedback</span>
            </h3>
            
            {analysisResult ? (
              analysisResult.error ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{analysisResult.message}</p>
                  {!isUserSignedIn && freeUsesRemaining <= 0 ? (
                    <button onClick={handleSignUp} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">Sign Up for More</button>
                  ) : (
                    <button onClick={handleAnalyzeImage} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">Try Again</button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">{analysisResult.score}/100</div>
                    <div className="text-sm text-gray-600">Your Art Score</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900 text-sm mb-1">What You Did Great! 🎉</div>
                        <p className="text-green-800 text-sm leading-relaxed">{analysisResult.whatYouDidWell}</p>
                      </div>
                    </div>
                  </div>

                  {analysisResult.mainIssues?.map((issue, index) => (
                    <div key={index} className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                      <div className="font-medium text-sm mb-2 text-blue-900">💡 {issue.problem}</div>
                      <div className="text-xs text-blue-700 mb-2"><strong>Why:</strong> {issue.whyItMatters}</div>
                      <div className="text-xs text-blue-700"><strong>How to improve:</strong> {issue.howToFix}</div>
                    </div>
                  ))}

                  {analysisResult.quickTips && (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-900 text-sm mb-2">Quick Tips ⚡</div>
                          {analysisResult.quickTips.map((tip, index) => (
                            <div key={index} className="flex items-start space-x-2 mb-1">
                              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <span className="text-yellow-800 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult.colorPalettes && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="font-medium text-purple-900 text-sm mb-3 flex items-center space-x-2">
                        <Palette className="w-4 h-4" />
                        <span>Suggested Color Palettes</span>
                      </div>
                      {analysisResult.colorPalettes.map((palette, index) => (
                        <div key={index} className="mb-3">
                          <ColorPalette colors={palette.colors} mood={palette.mood} />
                          <p className="text-xs text-purple-700 ml-8">{palette.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-blue-900 text-sm mb-1">Keep Going! 🌟</div>
                        <p className="text-blue-800 text-sm leading-relaxed">{analysisResult.encouragement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-2">Your personalized feedback will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analyze;