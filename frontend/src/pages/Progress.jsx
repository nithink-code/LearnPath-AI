import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Legend, ReferenceLine
} from 'recharts';
import './Progress.css';

/* ─────────────────────────────────────────
   DUMMY DATA
───────────────────────────────────────── */
const rankData = [
  { date: 'Feb 1',  rank: 2480 }, { date: 'Feb 3',  rank: 2410 },
  { date: 'Feb 5',  rank: 2350 }, { date: 'Feb 8',  rank: 2290 },
  { date: 'Feb 10', rank: 2240 }, { date: 'Feb 13', rank: 2180 },
  { date: 'Feb 15', rank: 2120 }, { date: 'Feb 18', rank: 2050 },
  { date: 'Feb 20', rank: 1990 }, { date: 'Feb 22', rank: 1930 },
  { date: 'Feb 25', rank: 1870 }, { date: 'Feb 27', rank: 1800 },
  { date: 'Mar 1',  rank: 1740 }, { date: 'Mar 3',  rank: 1700 },
];

const codingData = [
  { date: 'Feb 1',  solved: 2 }, { date: 'Feb 3',  solved: 1 },
  { date: 'Feb 5',  solved: 1 }, { date: 'Feb 8',  solved: 13 },
  { date: 'Feb 10', solved: 5 }, { date: 'Feb 13', solved: 3 },
  { date: 'Feb 15', solved: 7 }, { date: 'Feb 18', solved: 4 },
  { date: 'Feb 20', solved: 9 }, { date: 'Feb 22', solved: 2 },
  { date: 'Feb 25', solved: 6 }, { date: 'Feb 27', solved: 11 },
  { date: 'Mar 1',  solved: 8 }, { date: 'Mar 3',  solved: 5 },
];

const mcqData = [
  { date: 'Feb 1',  solved: 0 }, { date: 'Feb 3',  solved: 0 },
  { date: 'Feb 5',  solved: 1 }, { date: 'Feb 8',  solved: 0 },
  { date: 'Feb 10', solved: 0 }, { date: 'Feb 13', solved: 2 },
  { date: 'Feb 15', solved: 0 }, { date: 'Feb 18', solved: 0 },
  { date: 'Feb 20', solved: 1 }, { date: 'Feb 22', solved: 0 },
  { date: 'Feb 25', solved: 0 }, { date: 'Feb 27', solved: 0 },
  { date: 'Mar 1',  solved: 0 }, { date: 'Mar 3',  solved: 1 },
];

const quizData = [
  { name: 'RED Quiz - Programming in C++', score: 130, fill: '#ff2e63' },
  { name: 'Data Structures Basics',        score: 87,  fill: '#c01b48' },
  { name: 'Algorithms I',                  score: 104, fill: '#a01540' },
];

/* ─────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, inverted = false }) => {
  if (active && payload?.length) {
    return (
      <div className="pg-tooltip">
        <p className="pg-tooltip-date">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="pg-tooltip-val" style={{ color: entry.color }}>
            {entry.name}:{' '}
            <strong>{inverted ? `#${entry.value}` : entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────── */
const SkeletonCard = ({ height = 200 }) => (
  <div className="pg-skeleton-card" style={{ height }}>
    <div className="pg-skeleton-line" style={{ width: '40%', height: 14 }} />
    <div className="pg-skeleton-line" style={{ width: '25%', height: 11, marginTop: 8 }} />
    <div className="pg-skeleton-block" style={{ marginTop: 24, flex: 1, borderRadius: 8 }} />
  </div>
);

/* ─────────────────────────────────────────
   STAT BOX
───────────────────────────────────────── */
const StatBox = ({ label, value, trend, color = '#ff2e63' }) => (
  <div className="pg-stat-box">
    <span className="pg-stat-label">{label}</span>
    <span className="pg-stat-value" style={{ color }}>{value}</span>
    {trend && <span className="pg-stat-trend">{trend}</span>}
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Progress() {
  const [loaded, setLoaded] = useState(false);

  // Simulate async data fetch + skeleton delay
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pg-root">
      <div className="pg-layout">

        {/* ══════════════ LEFT (70%) ══════════════ */}
        <div className="pg-left">

          {/* ── Card 1: Rank Trend ── */}
          {!loaded ? (
            <SkeletonCard height={300} />
          ) : (
            <div className="pg-card pg-card-rank pg-fade-in">
              <div className="pg-card-header">
                <div>
                  <h2 className="pg-card-title">Track Your Progress</h2>
                  <p className="pg-card-sub">Showing Daily Rank / Score for the last 30 days</p>
                </div>
                <div className="pg-rank-stats">
                  <StatBox label="Overall Rank" value="#1,700" trend="↑ 780 places" />
                  <StatBox label="Overall Score" value="4,820" trend="+320 pts" color="#22c55e" />
                </div>
              </div>

              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={rankData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rankGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2e63" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ff2e63" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    reversed
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `#${v}`}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip content={<CustomTooltip inverted />} />
                  <Line
                    type="monotoneX"
                    dataKey="rank"
                    name="Rank"
                    stroke="#ff2e63"
                    strokeWidth={2.5}
                    dot={{ fill: '#ff2e63', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#ff2e63', stroke: 'rgba(255,46,99,0.3)', strokeWidth: 6 }}
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Bottom Row: 3 mini-cards ── */}
          <div className="pg-bottom-row">

            {/* ── Card 2: Daily Coding ── */}
            {!loaded ? (
              <SkeletonCard height={230} />
            ) : (
              <div className="pg-card pg-fade-in pg-delay-1">
                <h3 className="pg-card-title">Daily Coding Questions</h3>
                <p className="pg-card-sub">Problems solved per day</p>
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart data={codingData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2e63" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7b0025" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      axisLine={false} tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,46,99,0.05)' }} />
                    <Bar
                      dataKey="solved"
                      name="Solved"
                      fill="url(#barGrad)"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive
                      animationDuration={1000}
                      animationEasing="ease-out"
                      animationBegin={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Card 3: MCQs ── */}
            {!loaded ? (
              <SkeletonCard height={230} />
            ) : (
              <div className="pg-card pg-fade-in pg-delay-2">
                <h3 className="pg-card-title">Daily In-Video MCQs</h3>
                <p className="pg-card-sub">MCQs solved per day</p>
                <ResponsiveContainer width="100%" height={155}>
                  <LineChart data={mcqData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      axisLine={false} tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      axisLine={false} tickLine={false}
                      allowDecimals={false}
                      domain={[0, 3]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="solved"
                      name="MCQs"
                      stroke="#ff2e63"
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                      dot={{ fill: '#ff2e63', r: 3, fillOpacity: 0.7, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#ff2e63' }}
                      isAnimationActive
                      animationDuration={1200}
                      animationBegin={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Card 4: Recent Quiz ── */}
            {!loaded ? (
              <SkeletonCard height={230} />
            ) : (
              <div className="pg-card pg-fade-in pg-delay-3">
                <h3 className="pg-card-title">Recent Quiz Scores</h3>
                <p className="pg-card-sub">Latest quiz performance</p>
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart
                    data={quizData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      axisLine={false} tickLine={false}
                      domain={[0, 160]}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={({ x, y, payload }) => (
                        <foreignObject x={x - 90} y={y - 10} width={88} height={24}>
                          <div style={{
                            fontSize: 8,
                            color: '#9ca3af',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            textAlign: 'right',
                            paddingRight: 4
                          }}>
                            {payload.value}
                          </div>
                        </foreignObject>
                      )}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,46,99,0.05)' }} />
                    <Bar
                      dataKey="score"
                      name="Score"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive
                      animationDuration={1000}
                      animationBegin={600}
                    >
                      {quizData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>{/* end pg-bottom-row */}
        </div>{/* end pg-left */}

        {/* ══════════════ RIGHT (30%) ══════════════ */}
        <div className="pg-right">

          {/* ── Profile Card ── */}
          {!loaded ? (
            <SkeletonCard height={320} />
          ) : (
            <div className="pg-card pg-profile-card pg-fade-in">
              <div className="pg-avatar-wrap">
                <div className="pg-avatar">
                  {/* Gradient avatar placeholder */}
                  <div className="pg-avatar-inner">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#2a1a3e" />
                          <stop offset="100%" stopColor="#0d0d1a" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="50" fill="url(#bgGrad)" />
                      {/* Body */}
                      <ellipse cx="50" cy="85" rx="22" ry="18" fill="#6d28d9" opacity="0.9" />
                      {/* Head */}
                      <circle cx="50" cy="52" r="18" fill="#fbbf80" />
                      {/* Hair */}
                      <ellipse cx="50" cy="37" rx="19" ry="10" fill="#1a0a3a" />
                      <ellipse cx="50" cy="34" rx="14" ry="7" fill="#2d1060" />
                      {/* Eyes */}
                      <circle cx="44" cy="52" r="2.5" fill="#1e1b4b" />
                      <circle cx="56" cy="52" r="2.5" fill="#1e1b4b" />
                      {/* Smile */}
                      <path d="M44 58 Q50 63 56 58" stroke="#c97b4f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="pg-avatar-badge">
                  <span>4.8%</span>
                </div>
              </div>

              <h2 className="pg-profile-name">Alex Johnson</h2>
              <p className="pg-profile-handle">@alexcodes · Full Stack Track</p>

              <div className="pg-profile-stats">
                <div className="pg-pstat-card">
                  <span className="pg-pstat-icon">📚</span>
                  <div>
                    <div className="pg-pstat-label">Lectures Progress</div>
                    <div className="pg-pstat-val">
                      <span className="pg-pstat-hi">29</span>
                      <span className="pg-pstat-total"> / 598 Completed</span>
                    </div>
                    <div className="pg-pstat-bar-bg">
                      <div className="pg-pstat-bar-fill" style={{ width: `${(29 / 598) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pg-pstat-card">
                  <span className="pg-pstat-icon">⌨️</span>
                  <div>
                    <div className="pg-pstat-label">Coding Problems</div>
                    <div className="pg-pstat-val">
                      <span className="pg-pstat-hi">28</span>
                      <span className="pg-pstat-total"> / 381 Solved</span>
                    </div>
                    <div className="pg-pstat-bar-bg">
                      <div className="pg-pstat-bar-fill" style={{ width: `${(28 / 381) * 100}%`, background: '#ff2e63' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* ── Weekly Activity Summary ── */}
          {!loaded ? (
            <SkeletonCard height={130} />
          ) : (
            <div className="pg-card pg-fade-in pg-delay-3">
              <div className="pg-card-header" style={{ marginBottom: '0.75rem' }}>
                <h3 className="pg-card-title">This Week</h3>
                <span className="pg-badge-green">On Track</span>
              </div>
              <div className="pg-week-dots">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="pg-dot-col">
                    <div className={`pg-dot ${i < 5 ? 'pg-dot-done' : ''}`} />
                    <span className="pg-dot-label">{d}</span>
                  </div>
                ))}
              </div>
              <p className="pg-week-msg">5 of 7 days active — you're crushing it! 🚀</p>
            </div>
          )}

        </div>{/* end pg-right */}
      </div>{/* end pg-layout */}
    </div>
  );
}
