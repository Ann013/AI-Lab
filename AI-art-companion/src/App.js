import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AiArtCompanion from './home'; // Your home page component
import LoginPage from './login'; // Your login page component
import SignupPage from './signup'; // Your signup page component
import AiArtGenerator from './generate';
import UserDashboard from './UserDashboard';
import Analyze from './analyze';
import './index.css';
import './App.css';
import Community from 'community';
import Gallery from 'gallery';
import AdminPage from 'admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AiArtCompanion />} />
          <Route path="/home" element={<AiArtCompanion />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/gen" element={<AiArtGenerator />} />
          <Route path="/userdb" element={<UserDashboard />} />
          <Route path="/analyze" element={<Analyze />} />
           <Route path="/community" element={<Community />} />
           <Route path="/gallery" element={<Gallery />} />
           <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;