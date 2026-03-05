import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/learning-plans" element={<LearningPlans />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
