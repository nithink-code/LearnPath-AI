import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './Pages.css';
import './AiAssistant.css';
const API_BASE = 'http://localhost:3000';

const AiAssistant = () => {
  const { isSignedIn, getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [noSolutionsMessage, setNoSolutionsMessage] = useState('');
  const refreshInFlightRef = useRef(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const isChatInitDoneRef = useRef(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! How can I assist you with your skill set or technology learning today?'
    }
  ]);

  // Load user-specific data when userId is available
  useEffect(() => {
    if (isSignedIn && userId && !isChatInitDoneRef.current) {
      const savedChat = localStorage.getItem(`ai_chat_messages_${userId}`);
      if (savedChat) {
        try { 
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
          }
        } catch (e) { console.error(e); }
      }
      const savedAnalysis = localStorage.getItem(`ai_skill_analysis_${userId}`);
      if (savedAnalysis) {
        try { setAnalysis(JSON.parse(savedAnalysis)); } catch (e) { console.error(e); }
      }
      isChatInitDoneRef.current = true;
    } else if (!isSignedIn) {
      // Clear current state on logout/not-signed-in
      setChatMessages([{ role: 'assistant', content: 'Hello! How can I assist you with your skill set or technology learning today?' }]);
      setAnalysis(null);
      isChatInitDoneRef.current = false;
    }
  }, [isSignedIn, userId]);

  // Persist messages whenever they change (user-specific)
  useEffect(() => {
    if (isSignedIn && userId && isChatInitDoneRef.current) {
      localStorage.setItem(`ai_chat_messages_${userId}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, isSignedIn, userId]);

  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'analysis', 'notes'
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isNewData, setIsNewData] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Autoscroll removed as requested: stay at top
  }, [chatMessages, chatSending, activeTab]);

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!isSignedIn) return;

    if (!force && refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    // Detection logic
    const updatedFlag = localStorage.getItem('learning_activity_updated');
    const isNew = updatedFlag === 'true';

    setLoading(true);
    if (force) setIsManualRefresh(true);
    setError('');
    if (isNew) setIsNewData(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/assessment/ai-analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.details ? `${data.error} (${data.details})` : (data?.error || 'Failed to generate analysis.'));
      }

      if (data?.noSubmissions) {
        setAnalysis(null);
        setNoSolutionsMessage(data.message || 'No solution submitted to view AI analysis.');
        if (userId) localStorage.removeItem(`ai_skill_analysis_${userId}`);
      } else {
        setNoSolutionsMessage('');
        setAnalysis(data);
        if (userId) localStorage.setItem(`ai_skill_analysis_${userId}`, JSON.stringify(data));
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      setIsNewData(false);
      localStorage.removeItem('learning_activity_updated');
    } catch (err) {
      setNoSolutionsMessage('');
      if (!analysis) setError(err.message || 'Unable to load strategy analysis.');
    } finally {
      setLoading(false);
      setIsManualRefresh(false);
      refreshInFlightRef.current = false;
    }
  }, [isSignedIn, userId, getToken, setLoading, setAnalysis, setIsManualRefresh]);

  // Notes CRUD
  const fetchNotes = useCallback(async () => {
    if (!isSignedIn || !userId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) { console.error("Notes fetch error:", err); }
  }, [isSignedIn, userId, getToken]);

  const saveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim() || !isSignedIn) return;
    try {
      const token = await getToken();
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote ? `${API_BASE}/api/notes/${editingNote._id}` : `${API_BASE}/api/notes`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });

      if (res.ok) {
        const savedData = await res.json();
        
        // Optimistic update: instantly refresh the local list without a full reload
        if (editingNote) {
          setNotes(prev => prev.map(n => n._id === savedData._id ? savedData : n));
        } else {
          setNotes(prev => [savedData, ...prev]);
        }
        
        // Force clear all inputs
        setNoteTitle('');
        setNoteContent('');
        setEditingNote(null);
        
        // Fetch to ensure background sync
        fetchNotes();
      }
    } catch (err) { console.error("Note save error:", err); }
  };

  const deleteNote = async (id) => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n._id !== id));
        fetchNotes(); 
      }
    } catch (err) { console.error("Note delete error:", err); }
  };

  useEffect(() => {
    if (isSignedIn) {
      // Analysis is now strictly manual (requested: donot update automatically)
      fetchNotes();
    }
  }, [isSignedIn, fetchNotes]);

  const sendChatMessage = useCallback(async () => {
    const message = chatInput.trim();
    if (!message || chatSending || !isSignedIn) return;

    const nextMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatSending(true);

    try {
      const token = await getToken();
      const conversation = nextMessages.slice(-10).map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const res = await fetch(`${API_BASE}/api/assessment/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: conversation }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to get mentor response.');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: (data?.response || 'I can help with tech skills, coding, and learning strategy. Ask me a specific question.')
                   .replace(/\*\*/g, ''),
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err?.message || 'Unable to respond right now. Please try again.',
        }
      ]);
    } finally {
      setChatSending(false);
    }
  }, [chatInput, chatSending, isSignedIn, chatMessages, getToken]);

  if (!isSignedIn) {
    return (
      <div className="page-container">
        <h1 className="page-title">AI Submission Analysis</h1>
        <div className="page-content">
          <p>Please sign in to view real-time weak areas and improvement suggestions from your latest submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ai-assistant-theme">
      {/* Premium Option Bar / Tabs */}
      <div className="option-bar-container">
        <div className="premium-option-bar">
          <button 
            className={`option-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            AI Doubt Solver
          </button>
          <button 
            className={`option-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Improvement Areas
          </button>
          <button 
            className={`option-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Your Notes
          </button>
        </div>
      </div>

      <div className="assistant-main-content">
        {activeTab === 'chat' && (
          <aside className="assistant-centered-pane animate-fade-in">
            <div className="chat-shell">
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    <div className="message-bubble">
                      {msg.role === 'assistant' && (
                        <div className="bubble-header">
                          <span className="icon">🤖</span> AI Assistant
                        </div>
                      )}
                      <div className="message-content">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatSending && (
                  <div className="message-wrapper assistant">
                    <div className="message-bubble">
                      <div className="bubble-header">
                        <span className="icon">🤖</span> AI Assistant
                      </div>
                      <div className="message-content typing">Processing your technical inquiry...</div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area-wrap">
                <div className="chat-input-area">
                  <textarea
                    placeholder="Enter your prompt to talk to the AI..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    disabled={chatSending}
                    rows={1}
                  />
                </div>
                <button 
                  className="send-btn" 
                  onClick={sendChatMessage} 
                  disabled={chatSending || !chatInput.trim()}
                  title="Send Prompt"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        )}

        {activeTab === 'analysis' && (
          <section className="assistant-centered-pane animate-fade-in">
            <div className="assistant-header compact">
              <div className="header-left">
                <div className={`status-badge ${loading ? 'syncing' : ''}`}>
                  {loading ? 'AI SYNCHRONIZATION ACTIVE...' : 'AI ANALYTICS SECURE'}
                </div>
                <div className="evaluation-title-row">
                  <h1 className="hero-title">Skill <span className="gradient-text">Evaluation Pulse</span></h1>
                  <button 
                    className={`analyse-btn ${isManualRefresh ? 'loading-state' : ''}`} 
                    onClick={() => fetchAnalysis(true)} 
                    disabled={loading}
                    title="Analyse Latest Performance"
                  >
                    <span className="btn-text">
                      {isManualRefresh && <span className="spinner"></span>}
                      {isManualRefresh ? 'Analysing Latest Insights...' : 'Analyse Strategy'}
                    </span>
                  </button>
                </div>
                {lastUpdated && <span className="last-updated-tag">Latest Update: {lastUpdated} {isNewData && '• NEW SYNC'}</span>}
              </div>
            </div>

            {loading && !analysis ? (
              <div className="skeleton-grid-single">
                <div className="skeleton-card" style={{ height: '120px' }}></div>
                <div className="skeleton-card" style={{ height: '300px' }}></div>
                <div className="skeleton-card" style={{ height: '200px' }}></div>
              </div>
            ) : error ? (
              <div className="error-card">
                <p>No analysis found. Complete your technical assessment to view personalized improvement areas.</p>
                <button className="btn-secondary" onClick={() => fetchAnalysis(true)}>Retry Synchronization</button>
              </div>
            ) : analysis ? (
              <div className="analysis-grid stretch animate-fade-in">
                <div className="summary-card glass-effect">
                  <div className="card-header">
                    <span className="icon">📊</span>
                    <h3>Executive Summary</h3>
                    <div className="level-badge gradient-glow">{analysis.level || 'Emerging'}</div>
                  </div>
                  <p className="summary-text">{analysis.summary || analysis.executiveSummary}</p>
                </div>

                <div className="analysis-card red-theme entry-1">
                  <div className="card-header"><span className="icon">🎯</span><h3>Critical Weak Areas</h3></div>
                  <div className="gap-list">
                    {(analysis.weakAreas || analysis.skillGaps || []).map((gap, i) => (
                      <div key={i} className="gap-item">
                        <div className="gap-meta">
                          <span className="gap-area">{gap.area}</span>
                          <span className={`severity-badge ${gap.severity?.toLowerCase()}`}>{gap.severity}</span>
                        </div>
                        <p className="gap-desc">{gap.reason || gap.gap}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analysis-card blue-theme entry-2">
                  <div className="card-header"><span className="icon">⚡</span><h3>Acceleration Tactics</h3></div>
                  <ul className="standards-list">
                    {(analysis.improvementAreas || analysis.bestPractices || []).map((item, i) => (
                      <li key={i}>{typeof item === 'string' ? item : item.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Synthesis engine waiting for new performance records.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'notes' && (
          <div className="notes-container animate-fade-in single-pane">
            <div className="note-editor-pane">
              <div className="note-shell">
                <div className="note-header">
                  <h3>{editingNote ? 'Refining Technical Entry' : 'Captured Knowledge Entry'}</h3>
                </div>
                <div className="note-input-wrap">
                  <div className="note-inputs">
                    <input 
                      type="text" 
                      placeholder="Knowledge Title (e.g., GraphQL Schema Design)..." 
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                    <textarea 
                      placeholder="Capture technical insights..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <button 
                    className="send-btn" 
                    onClick={saveNote} 
                    disabled={!noteContent.trim()}
                    title={editingNote ? 'Sync Update' : 'Store Intelligence'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  </button>
                </div>
                {editingNote && (
                  <div className="edit-cancel-wrap">
                    <button className="btn-ghost" onClick={() => { setEditingNote(null); setNoteTitle(''); setNoteContent(''); }}>Cancel Selection</button>
                  </div>
                )}

                {/* Recent Notes List Integrated Below */}
                <div className="recent-notes-integrated">
                  <div className="notes-header-row">
                    <h3>Recent Insights</h3>
                    <span className="notes-count">{notes.length} Captured</span>
                  </div>
                  
                  {notes.length === 0 ? (
                    <div className="empty-notes-prompt small">
                      Zero technical insights stored in current knowledge base.
                    </div>
                  ) : (
                    <div className="notes-scroll-area">
                      {notes.map((note) => (
                        <div key={note._id} className="note-card-item mini">
                          <div className="note-card-content" onClick={() => {
                            setEditingNote(note);
                            setNoteTitle(note.title);
                            setNoteContent(note.content);
                          }}>
                            <div className="note-card-top">
                              <span className="note-card-title">{note.title}</span>
                              <span className="note-card-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="note-card-snippet">{note.content}</p>
                          </div>
                          <button 
                            className="delete-action-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Delete this technical insight?")) deleteNote(note._id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
