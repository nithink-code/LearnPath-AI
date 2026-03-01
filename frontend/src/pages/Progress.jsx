import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import './Pages.css';
import './Progress.css';

const solvedData = [
  { day: 'Feb 3', solved: 2 },
  { day: 'Feb 5', solved: 5 },
  { day: 'Feb 8', solved: 3 },
  { day: 'Feb 10', solved: 7 },
  { day: 'Feb 13', solved: 4 },
  { day: 'Feb 15', solved: 9 },
  { day: 'Feb 18', solved: 6 },
  { day: 'Feb 20', solved: 11 },
  { day: 'Feb 22', solved: 8 },
  { day: 'Feb 25', solved: 13 },
  { day: 'Feb 27', solved: 10 },
  { day: 'Mar 1', solved: 15 },
];

const weeklyStreak = [
  { week: 'W1', streak: 3 },
  { week: 'W2', streak: 5 },
  { week: 'W3', streak: 2 },
  { week: 'W4', streak: 7 },
  { week: 'W5', streak: 6 },
  { week: 'W6', streak: 7 },
];

const categoryData = [
  { name: 'Arrays', solved: 24, color: '#6366f1' },
  { name: 'Strings', solved: 18, color: '#8b5cf6' },
  { name: 'Trees', solved: 12, color: '#a78bfa' },
  { name: 'Graphs', solved: 8, color: '#c4b5fd' },
  { name: 'DP', solved: 15, color: '#7c3aed' },
  { name: 'Sorting', solved: 10, color: '#4f46e5' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-val">{payload[0].value} {payload[0].name === 'solved' ? 'problems' : 'days'}</p>
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const totalSolved = solvedData.reduce((s, d) => s + d.solved, 0);
  const currentStreak = 7;
  const bestStreak = 7;

  return (
    <div className="page-container">
      <h1 className="page-title">Growth Analytics</h1>

      {/* Stat Cards */}
      <div className="prog-stats">
        {[
          { label: 'Total Solved', value: totalSolved, icon: '✅', color: '#22c55e' },
          { label: 'Current Streak', value: `${currentStreak} days`, icon: '🔥', color: '#f59e0b' },
          { label: 'Best Streak', value: `${bestStreak} days`, icon: '🏆', color: '#8b5cf6' },
          { label: 'Accuracy', value: '84%', icon: '🎯', color: '#6366f1' },
        ].map((stat) => (
          <div key={stat.label} className="prog-stat-card">
            <span className="prog-stat-icon">{stat.icon}</span>
            <div>
              <div className="prog-stat-val" style={{ color: stat.color }}>{stat.value}</div>
              <div className="prog-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Questions Solved Over Time */}
      <div className="prog-chart-card">
        <h3 className="prog-chart-title">Questions Solved Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={solvedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="solved" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#solvedGrad)" dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="prog-row">
        {/* Weekly Streak */}
        <div className="prog-chart-card" style={{ flex: 1 }}>
          <h3 className="prog-chart-title">Weekly Streak</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyStreak} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="streak" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="prog-chart-card" style={{ flex: 1 }}>
          <h3 className="prog-chart-title">Category Breakdown</h3>
          <div className="prog-categories">
            {categoryData.map((cat) => {
              const max = Math.max(...categoryData.map(c => c.solved));
              return (
                <div key={cat.name} className="prog-cat-row">
                  <span className="prog-cat-name">{cat.name}</span>
                  <div className="prog-cat-bar-bg">
                    <div className="prog-cat-bar-fill" style={{ width: `${(cat.solved / max) * 100}%`, background: cat.color }} />
                  </div>
                  <span className="prog-cat-count">{cat.solved}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
