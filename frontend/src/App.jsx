import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import IntroAnimation from './components/IntroAnimation'
import Home from './pages/Home'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import './App.css';

function AppContent({ theme, onToggleTheme }) {
  const { pathname } = useLocation()
  const isLandingPage = pathname === '/'

  return (
    <div className={`app-container theme-${theme} ${isLandingPage ? 'home-dotted' : ''}`}>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/learning-plans" element={<LearningPlans />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
      </Routes>
    </div>
  )
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('learnpath-theme') || 'dark')

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2350)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('learnpath-theme', theme)
  }, [theme])

  return (
    <>
      {showIntro && <IntroAnimation />}
      <Router>
        <AppContent theme={theme} onToggleTheme={handleThemeToggle} />
      </Router>
    </>
  )
}

export default App
