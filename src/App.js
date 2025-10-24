import React, { useState, useEffect } from "react";

// Daily Timeline — Teal Gradient Motivator with Checklists, Streaks & Colours
// Energetic but calm teal tones, mobile responsive, persistent state.

const defaultBlocks = [
  { id: 1, label: "Wake & Sunlight", time: "8:30 AM", note: "Hydrate + 10m sunlight", done: false },
  { id: 2, label: "Meditation", time: "9:30 - 10:00 AM", note: "30 min guided / breathwork", done: false },
  { id: 3, label: "Breakfast", time: "10:00 - 10:30 AM", note: "Protein-rich meal", done: false },
  { id: 4, label: "Work Block 1", time: "11:00 AM - 2:00 PM", note: "Deep work / focused tasks", done: false },
  { id: 5, label: "Lunch", time: "2:00 - 2:30 PM", note: "Balanced meal", done: false },
  { id: 6, label: "Rest / Prep", time: "2:30 - 3:15 PM", note: "Stretch, short walk", done: false },
  { id: 7, label: "Gym + Commute", time: "3:30 - 6:30 PM", note: "Workout + travel", done: false },
  { id: 8, label: "Work Block 2", time: "7:30 - 9:00 PM", note: "Admin / light work", done: false },
  { id: 9, label: "Dinner", time: "9:00 PM - 9:30 PM", note: "Nutritious meal", done: false },
  { id: 10, label: "Meetings", time: "9:30 - 11:30 PM", note: "Team syncs", done: false },
  { id: 11, label: "Wind Down", time: "11:30 PM - 12:15 AM", note: "Games, read, reflect", done: false },
  { id: 12, label: "Sleep", time: "1:00 AM", note: "Aim for 7+ hours", done: false }
];

function Block({ block, onEdit, onToggle }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(block);
  useEffect(() => setLocal(block), [block]);

  const colorMap = {
    1: 'bg-teal-50', 2: 'bg-teal-100', 3: 'bg-teal-50', 4: 'bg-emerald-50', 5: 'bg-lime-50',
    6: 'bg-cyan-50', 7: 'bg-sky-50', 8: 'bg-blue-50', 9: 'bg-indigo-50', 10: 'bg-violet-50', 11: 'bg-fuchsia-50', 12: 'bg-pink-50'
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-2xl shadow-md transition-all duration-200 ${block.done ? 'border border-teal-300 bg-gradient-to-r from-teal-50 to-emerald-50' : colorMap[block.id]}`}>
      <input
        type="checkbox"
        checked={block.done}
        onChange={() => onToggle(block.id)}
        className="mt-1 accent-teal-500 w-5 h-5 shrink-0"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          {editing ? (
            <input
              className="w-full text-lg font-semibold bg-slate-100 p-1 rounded"
              value={local.label}
              onChange={(e) => setLocal({ ...local, label: e.target.value })}
            />
          ) : (
            <div className={`text-lg font-semibold ${block.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>{block.label}</div>
          )}
          <button
            onClick={() => {
              if (editing) onEdit(local);
              setEditing(!editing);
            }}
            className="px-2 py-1 text-xs rounded bg-slate-200 hover:bg-slate-300"
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="text-sm text-slate-600 mt-1">
          {editing ? (
            <input
              className="w-full bg-slate-100 p-1 rounded"
              value={local.note}
              onChange={(e) => setLocal({ ...local, note: e.target.value })}
            />
          ) : (
            <span className={`${block.done ? 'text-slate-400' : ''}`}>{block.note}</span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-1">{block.time}</div>
      </div>
    </div>
  );
}

export default function DailyTimeline() {
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem('timeline.blocks.v3');
      return saved ? JSON.parse(saved) : defaultBlocks;
    } catch {
      return defaultBlocks;
    }
  });
  const [quote, setQuote] = useState(localStorage.getItem('timeline.quote.v3') || 'Progress beats perfection.');
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('timeline.streak.v3')) || 0);

  useEffect(() => localStorage.setItem('timeline.blocks.v3', JSON.stringify(blocks)), [blocks]);
  useEffect(() => localStorage.setItem('timeline.quote.v3', quote), [quote]);
  useEffect(() => localStorage.setItem('timeline.streak.v3', streak), [streak]);

  const handleEdit = (updated) => setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  const handleToggle = (id) => setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  const resetAll = () => setBlocks((prev) => prev.map((b) => ({ ...b, done: false })));
  const incrementStreak = () => setStreak((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 via-teal-200 to-teal-300 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-md sm:max-w-3xl">
        <header className="mb-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">Daily Motivator</h1>
          <input
            className="mt-2 text-base sm:text-lg font-medium text-teal-700 bg-transparent border-b border-teal-300 text-center w-full focus:outline-none"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
          <div className="mt-3 text-teal-700 font-medium">🔥 Streak: {streak} days</div>
        </header>

        <main className="grid gap-3 sm:gap-4">
          {blocks.map((block) => (
            <Block key={block.id} block={block} onEdit={handleEdit} onToggle={handleToggle} />
          ))}
        </main>

        <div className="flex justify-center gap-3 mt-6">
          <button onClick={incrementStreak} className="px-3 py-2 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600">+1 Day</button>
          <button onClick={resetAll} className="px-3 py-2 bg-slate-300 text-slate-800 rounded-lg shadow hover:bg-slate-400">Reset Checkmarks</button>
        </div>

        <footer className="text-center text-xs text-teal-700 mt-6">All progress saves locally • Reset anytime by clearing site data</footer>
      </div>
    </div>
  );
}