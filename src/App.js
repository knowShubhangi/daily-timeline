import React, { useEffect, useState, useRef } from 'react';

// Daily Timeline v2 — Core/Lite Planner
// Single-file React component (Tailwind classes assumed available)
// Features: Core / Lite toggle, daywise checklist, daily archive, 7-day bar graph + text list, editable greeting/quote

const CORE_BLOCKS = [
  { id: 1, label: 'Wake & Sunlight', time: '10:30 AM' },
  { id: 2, label: 'Freshen up / Shower', time: '10:50 - 11:20 AM' },
  { id: 3, label: 'Make & Eat Breakfast', time: '11:20 - 12:00 PM' },
  { id: 4, label: 'Meditation', time: '12:00 - 12:30 PM' },
  { id: 5, label: 'Transition / Prep', time: '12:30 - 1:00 PM' },
  { id: 6, label: 'Work Block 1', time: '1:00 - 4:00 PM' },
  { id: 7, label: 'Lunch', time: '4:00 - 4:30 PM' },
  { id: 8, label: 'Gym / Movement', time: '4:30 - 6:30 PM' },
  { id: 9, label: 'Shower + Snack', time: '7:00 - 7:30 PM' },
  { id: 10, label: 'Work Block 2', time: '7:30 - 9:00 PM' },
  { id: 11, label: 'Dinner', time: '9:00 - 9:30 PM' },
  { id: 12, label: 'Meetings', time: '9:30 - 10:30 PM' },
  { id: 13, label: 'Relax / Wind-down', time: '10:30 - 12:30 AM' },
  { id: 14, label: 'Sleep', time: '2:30 - 3:00 AM' }
];

const LITE_BLOCKS = [
  { id: 1, label: 'Wake & Sunlight', time: 'By 11:30 AM' },
  { id: 2, label: '10-min Self-care', time: 'Anytime' },
  { id: 3, label: '2 focused hours', time: 'Anytime' },
  { id: 4, label: '15-20 min movement', time: 'Anytime' },
  { id: 5, label: 'Two proper meals', time: 'Anytime' },
  { id: 6, label: '20 min no-screen wind-down', time: 'Before bed' }
];

const STORAGE_KEY = 'dtv2.storage.v1';

function todayKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export default function DailyTimelineV2() {
  const [mode, setMode] = useState('core'); // 'core' or 'lite'
  const [blocks, setBlocks] = useState([]);
  const [doneMap, setDoneMap] = useState({}); // { date: { id: true }} for current day only
  const [quote, setQuote] = useState('Progress beats perfection.');
  const [greetingName, setGreetingName] = useState('Shubhangi');
  const [history, setHistory] = useState({}); // { '2025-10-27': {completed, total} }
  const dateRef = useRef(todayKey());

  // load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMode(parsed.mode || 'core');
        setQuote(parsed.quote || 'Progress beats perfection.');
        setGreetingName(parsed.greetingName || 'Shubhangi');
        setHistory(parsed.history || {});
        const currentDate = todayKey();
        const savedToday = parsed.today && parsed.today.date === currentDate ? parsed.today : null;
        const initialBlocks = (parsed.mode === 'lite' ? LITE_BLOCKS : CORE_BLOCKS);
        setBlocks(initialBlocks.map(b => ({ ...b })));
        if (savedToday && savedToday.doneMap) {
          setDoneMap(savedToday.doneMap);
        } else {
          // initialize empty doneMap
          setDoneMap({});
        }
      } else {
        setMode('core');
        setQuote('Progress beats perfection.');
        setBlocks(CORE_BLOCKS.map(b => ({ ...b })));
        setDoneMap({});
      }
    } catch (err) {
      console.error('load err', err);
      setBlocks(CORE_BLOCKS.map(b => ({ ...b })));
      setDoneMap({});
    }
  }, []);

  // persist storage
  useEffect(() => {
    const payload = {
      mode,
      quote,
      greetingName,
      history,
      today: { date: todayKey(), doneMap }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [mode, quote, greetingName, history, doneMap]);

  // if mode changes, swap blocks and clear today's doneMap (but keep saved today's doneMap if date same)
  useEffect(() => {
    setBlocks((mode === 'lite' ? LITE_BLOCKS : CORE_BLOCKS).map(b => ({ ...b })));
    // don't clear doneMap automatically; keep user progress for the day
  }, [mode]);

  // helper to toggle checkbox
  function toggle(id) {
    setDoneMap(prev => {
      const next = { ...prev };
      next[id] = !next[id];
      return next;
    });
  }

  // compute today's stats
  function todayStats() {
    const total = blocks.length;
    const completed = Object.values(doneMap).filter(Boolean).length;
    return { completed, total };
  }

  // archive previous day at midnight — we'll check every 30s
  useEffect(() => {
    const tick = () => {
      const current = todayKey();
      if (dateRef.current !== current) {
        // day changed — archive previous
        const prevDate = dateRef.current;
        const completed = Object.values(doneMap).filter(Boolean).length;
        const total = blocks.length;
        setHistory(prev => {
          const h = { ...prev };
          h[prevDate] = { completed, total };
          // keep only last 30 days
          const keys = Object.keys(h).sort((a,b)=>b.localeCompare(a)).slice(0, 90);
          const trimmed = {};
          keys.reverse().forEach(k => { trimmed[k] = h[k]; });
          return trimmed;
        });
        // reset for new day
        dateRef.current = current;
        setDoneMap({});
      }
    };
    const id = setInterval(tick, 30_000);
    // also run once on mount to handle timezone switches
    tick();
    return () => clearInterval(id);
  }, [doneMap, blocks.length]);

  // quick helpers to export/import history or reset
  function resetTodayChecks() {
    setDoneMap({});
  }

  function clearAllData() {
    if (!confirm('Clear all stored planner data? This will remove history and settings.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setHistory({});
    setDoneMap({});
    setMode('core');
    setQuote('Progress beats perfection.');
  }

  // derive last 7 days for chart
  function lastNDays(n=7) {
    const arr = [];
    const today = new Date();
    for (let i = n-1; i >=0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const k = todayKey(d);
      const rec = history[k];
      if (k === todayKey()) {
        const cur = todayStats();
        arr.push({ date:k, completed:cur.completed, total:cur.total });
      } else if (rec) {
        arr.push({ date:k, completed:rec.completed, total:rec.total });
      } else {
        arr.push({ date:k, completed:0, total: blocks.length });
      }
    }
    return arr;
  }

  const stats = todayStats();
  const recent = lastNDays(7);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-700 to-teal-500 text-slate-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm opacity-80">Hi <input value={greetingName} onChange={(e)=>setGreetingName(e.target.value)} className="bg-transparent border-b border-teal-600 text-xl font-semibold text-white w-36 focus:outline-none" /> 🌼</div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">{quote}</h1>
            <div className="text-sm opacity-80 mt-1">Today: {todayKey()}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/8 px-3 py-2 rounded-full text-sm text-emerald-100">Mode</div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
              <button onClick={()=>setMode('core')} className={`px-3 py-1 rounded-full ${mode==='core' ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}>Core</button>
              <button onClick={()=>setMode('lite')} className={`px-3 py-1 rounded-full ${mode==='lite' ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}>Lite</button>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: checklist */}
          <section className="md:col-span-2 bg-white/6 rounded-2xl p-4 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm opacity-80">{mode==='core' ? 'Core Routine' : 'Lite Routine'}</div>
                <div className="text-lg font-semibold">Progress: {stats.completed}/{stats.total}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={resetTodayChecks} className="px-3 py-2 bg-white/10 rounded">Reset Checkmarks</button>
                <button onClick={clearAllData} className="px-3 py-2 bg-white/10 rounded">Clear All</button>
              </div>
            </div>

            <div className="space-y-2">
              {blocks.map((b) => (
                <div key={b.id} className={`flex items-center justify-between p-3 rounded-xl ${doneMap[b.id] ? 'bg-emerald-600/80 text-white' : 'bg-white/10'}`}>
                  <div>
                    <div className="font-semibold">{b.label}</div>
                    <div className="text-xs opacity-80">{b.time}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm opacity-80">{doneMap[b.id] ? 'Done' : ''}</div>
                    <input type="checkbox" checked={!!doneMap[b.id]} onChange={()=>toggle(b.id)} className="h-5 w-5 accent-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: stats & history */}
          <aside className="bg-white/6 rounded-2xl p-4">
            <div className="mb-4">
              <div className="text-sm opacity-80">7-day progress</div>
              <div className="mt-3 space-y-2">
                {recent.map((r, i) => {
                  const pct = r.total ? Math.round((r.completed / r.total) * 100) : 0;
                  return (
                    <div key={r.date} className="flex items-center gap-3">
                      <div className="text-xs w-20 opacity-80">{r.date.slice(5)}</div>
                      <div className="flex-1 h-3 bg-white/10 rounded overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-3 bg-emerald-400`}></div>
                      </div>
                      <div className="text-sm w-12 text-right">{r.completed}/{r.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm opacity-80 mb-2">Recent log</div>
              <div className="text-xs space-y-1">
                {Object.keys(history).slice().reverse().slice(0,7).map(d => (
                  <div key={d} className="flex justify-between">
                    <div className="opacity-90">{d}</div>
                    <div className="font-medium">{history[d].completed}/{history[d].total}</div>
                  </div>
                ))}
                {/* include today too */}
                <div className="flex justify-between mt-2 border-t border-white/6 pt-2">
                  <div className="opacity-90">{todayKey()}</div>
                  <div className="font-medium">{stats.completed}/{stats.total}</div>
                </div>
              </div>
            </div>

          </aside>
        </div>

        <footer className="mt-6 text-center text-sm opacity-80">All data stored locally • No reminders • Toggle Core / Lite as needed</footer>
      </div>
    </div>
  );
}
