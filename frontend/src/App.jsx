import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import StrokeLogoLoader from './components/StrokeLogoLoader'
import StarBackground from './components/StarBackground'
import Footer from './components/Footer'
import DecryptedText from './components/DecryptedText/DecryptedText'
import './App.css';
import './styles/uiSystem.css';

function AppContent({ theme, onToggleTheme }) {
  const location = useLocation();
  const [showPageLoader, setShowPageLoader] = useState(true);
  const initialLoadRef = useRef(true);
  const [loaderVariant, setLoaderVariant] = useState('logo');
  const [loadingMessage, setLoadingMessage] = useState('ACCESSING DATA...');

  const pageMessages = useMemo(() => ({
    '/': 'ACCESSING HUB...',
    '/assessments': 'ANALYZING SKILLSET...',
    '/learning-plans': 'OPTIMIZING CURRICULUM...',
    '/progress': 'CALIBRATING PERFORMANCE...',
    '/ai-assistant': 'SYNCHRONIZING NEURAL AI...',
    '/about': 'RETRIEVING INTEL...'
  }), []);

  useEffect(() => {
    const isFirstLoad = initialLoadRef.current;
    setLoaderVariant(isFirstLoad ? 'logo' : 'brain');
    
    if (!isFirstLoad) {
      const msg = pageMessages[location.pathname] || 'ACCESSING DATA...';
      setLoadingMessage(msg);
    }

    setShowPageLoader(true);
    const timer = setTimeout(() => {
      setShowPageLoader(false);
      initialLoadRef.current = false;
    }, isFirstLoad ? 3000 : 1100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`app-container theme-${theme}`}>
      <StarBackground />
      <div className="bg-beam bg-beam-1"></div>
      <div className="bg-beam bg-beam-2"></div>
      <div className="bg-beam bg-beam-3"></div>

      <div className="app-content-wrapper">
        <Navbar theme={theme} onToggleTheme={onToggleTheme} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/assessments" element={<ProtectedRoute><Assessments theme={theme} /></ProtectedRoute>} />
          <Route path="/learning-plans" element={<ProtectedRoute><LearningPlans /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
        </Routes>

        <Footer />
      </div>

      {showPageLoader && (
        <div className="route-loader-overlay" aria-live="polite" aria-label="Loading page">
          {loaderVariant === 'logo' ? (
            <StrokeLogoLoader size={180} label="learning and beyond ..." fade="in" gradient={true} />
          ) : (
            <div className="decrypted-loader-wrapper">
              <DecryptedText 
                text={loadingMessage}
                speed={45}
                maxIterations={12}
                sequential={true}
                revealDirection="center"
                animateOn="view"
                className="revealed-text"
                encryptedClassName="encrypted-text"
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  letterSpacing: '0.15em',
                  fontFamily: '"Space Mono", monospace'
                }}
              />
              <div className="loader-sub-line">SYSTEM SECURE • ENCRYPTED TUNNEL ACTIVE</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('learnpath-theme') || 'dark')

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    localStorage.setItem('learnpath-theme', theme)
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return (
    <Router>
      <AppContent theme={theme} onToggleTheme={handleThemeToggle} />
    </Router>
  )
}

export default App
