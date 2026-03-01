import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './Pages.css';
import './Assessments.css';

const quizQuestions = [
  {
    id: 1,
    category: 'JavaScript',
    difficulty: 'Medium',
    question: 'What is the output of `typeof null` in JavaScript?',
    options: ['null', 'undefined', 'object', 'string'],
    correct: 2,
    explanation: '`typeof null` returns "object" — this is a well-known JavaScript bug that has been kept for backward compatibility.'
  },
  {
    id: 2,
    category: 'React',
    difficulty: 'Easy',
    question: 'Which hook is used to perform side effects in a React functional component?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correct: 1,
    explanation: '`useEffect` is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.'
  },
  {
    id: 3,
    category: 'DSA',
    difficulty: 'Hard',
    question: 'What is the time complexity of searching in a balanced BST?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct: 1,
    explanation: 'In a balanced BST, each comparison eliminates half the tree, giving O(log n) search time.'
  },
  {
    id: 4,
    category: 'System Design',
    difficulty: 'Medium',
    question: 'Which database is best suited for storing unstructured data at scale?',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
    correct: 2,
    explanation: 'MongoDB is a document-oriented NoSQL database well-suited for storing unstructured or semi-structured data at scale.'
  },
];

const codingProblem = {
  title: 'Two Sum',
  difficulty: 'Easy',
  category: 'Arrays & Hashing',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6, return [1, 2].' },
  ],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
  starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
};
`,
};

const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export default function Assessments() {
  const [activeTab, setActiveTab] = useState('quiz');

  // Quiz state
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizDone, setQuizDone] = useState(false);

  // Code editor state
  const [code, setCode] = useState(codingProblem.starterCode);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const q = quizQuestions[current];

  const handleOptionSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    const correct = selected === q.correct;
    const newScore = correct ? score + 1 : score;
    setScore(newScore);

    if (current + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleCheck = () => setSubmitted(true);

  const resetQuiz = () => {
    setCurrent(0); setSelected(null); setSubmitted(false);
    setScore(0); setAnswers([]); setQuizDone(false);
  };

  const handleRun = () => {
    setRunning(true);
    setSubmitResult(null);
    setTimeout(() => {
      setOutput('✅  Test case passed\nInput:  nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExpected: [0,1]');
      setRunning(false);
    }, 1200);
  };

  const handleSubmit = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setSubmitResult({ status: 'Accepted', runtime: '68 ms', memory: '42.3 MB', beats: '87%' });
      setRunning(false);
    }, 1800);
  };

  return (
    <div className="page-container">
      <div className="assess-header">
        <h1 className="page-title" style={{ margin: 0 }}>Skill Assessments</h1>
        <div className="assess-tabs">
          <button className={`assess-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>📝 Quiz</button>
          <button className={`assess-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>💻 Coding Challenge</button>
        </div>
      </div>

      {activeTab === 'quiz' && (
        <div className="quiz-wrapper">
          {quizDone ? (
            <div className="quiz-result">
              <div className="result-circle">
                <span className="result-score">{score}/{quizQuestions.length}</span>
                <span className="result-label">Score</span>
              </div>
              <h2 style={{ color: 'white', marginTop: '1.5rem' }}>
                {score === quizQuestions.length ? '🏆 Perfect Score!' : score >= quizQuestions.length / 2 ? '🎯 Good Job!' : '📚 Keep Practicing!'}
              </h2>
              <p style={{ color: '#9ca3af' }}>You answered {score} out of {quizQuestions.length} questions correctly.</p>
              <button className="btn-primary" onClick={resetQuiz} style={{ marginTop: '1rem' }}>Retry Quiz</button>
            </div>
          ) : (
            <>
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((current) / quizQuestions.length) * 100}%` }} />
              </div>
              <div className="quiz-meta">
                <span className="quiz-cat">{q.category}</span>
                <span className="quiz-diff" style={{ color: DIFF_COLORS[q.difficulty] }}>{q.difficulty}</span>
                <span className="quiz-counter">{current + 1} / {quizQuestions.length}</span>
              </div>
              <div className="quiz-card">
                <p className="quiz-question">{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => {
                    let cls = 'quiz-option';
                    if (selected === i) cls += ' selected';
                    if (submitted && i === q.correct) cls += ' correct';
                    if (submitted && selected === i && i !== q.correct) cls += ' wrong';
                    return (
                      <button key={i} className={cls} onClick={() => handleOptionSelect(i)}>
                        <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`quiz-explanation ${selected === q.correct ? 'exp-correct' : 'exp-wrong'}`}>
                    <strong>{selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}</strong>
                    <p style={{ margin: '0.4rem 0 0' }}>{q.explanation}</p>
                  </div>
                )}
                <div className="quiz-actions">
                  {!submitted ? (
                    <button className="btn-primary" disabled={selected === null} onClick={handleCheck}>Check Answer</button>
                  ) : (
                    <button className="btn-primary" onClick={handleNext}>
                      {current + 1 < quizQuestions.length ? 'Next Question →' : 'See Results'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'code' && (
        <div className="code-layout">
          <div className="code-problem">
            <div className="prob-title-row">
              <h2 className="prob-title">{codingProblem.title}</h2>
              <span className="prob-diff" style={{ color: DIFF_COLORS[codingProblem.difficulty] }}>{codingProblem.difficulty}</span>
              <span className="prob-cat">{codingProblem.category}</span>
            </div>
            <p className="prob-desc">{codingProblem.description}</p>
            <div className="prob-section">
              <h4>Examples</h4>
              {codingProblem.examples.map((ex, i) => (
                <div key={i} className="prob-example">
                  <div><span className="prob-label">Input:</span> <code>{ex.input}</code></div>
                  <div><span className="prob-label">Output:</span> <code>{ex.output}</code></div>
                  {ex.explanation && <div className="prob-exp-text"><span className="prob-label">Explanation:</span> {ex.explanation}</div>}
                </div>
              ))}
            </div>
            <div className="prob-section">
              <h4>Constraints</h4>
              <ul className="prob-constraints">
                {codingProblem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
              </ul>
            </div>
          </div>

          <div className="code-editor-panel">
            <div className="editor-topbar">
              <span className="editor-lang">JavaScript</span>
              <div className="editor-btns">
                <button className="btn-run" onClick={handleRun} disabled={running}>
                  {running ? '⏳ Running...' : '▶ Run'}
                </button>
                <button className="btn-submit" onClick={handleSubmit} disabled={running}>
                  {running ? '⏳' : '⬆ Submit'}
                </button>
              </div>
            </div>
            <Editor
              height="380px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
            />
            {(output || submitResult) && (
              <div className="code-output">
                {submitResult ? (
                  <div className="submit-result accepted">
                    <span className="sr-status">✅ {submitResult.status}</span>
                    <div className="sr-stats">
                      <span>Runtime: <strong>{submitResult.runtime}</strong></span>
                      <span>Memory: <strong>{submitResult.memory}</strong></span>
                      <span>Beats: <strong>{submitResult.beats}</strong> of submissions</span>
                    </div>
                  </div>
                ) : (
                  <pre className="output-pre">{output}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
