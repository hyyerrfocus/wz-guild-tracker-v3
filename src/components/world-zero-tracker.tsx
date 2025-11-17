import React, { useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  Target,
  Calendar as CalendarIcon,
  Edit2,
  Check,
  X,
  StickyNote,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BarChart3,
  CalendarDays
} from 'lucide-react';

type PlayerShape = {
  name: string;
  dungeons: Record<string, boolean>;
  worldEvents: Record<string, boolean>;
  towers: Record<string, boolean>;
  infiniteTower: { floor: number };
  guildQuests: { easy: boolean; medium: boolean; hard: boolean };
};

const WorldZeroTracker: React.FC = () => {
  // State
  const [playerName, setPlayerName] = useState<string>('');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerShape | null>(null);
  const [history, setHistory] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState<string>('');
  const [currentSeason, setCurrentSeason] = useState<number>(18);
  const [showSeasonModal, setShowSeasonModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importData, setImportData] = useState<string>('');
  const [collapsedWorlds, setCollapsedWorlds] = useState<Record<number, boolean>>({});
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Helper: today's tracking date in EST with 5 PM cutoff
  const getTodayEST = (): string => {
    const now = new Date();
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    if (estNow.getHours() < 17) estNow.setDate(estNow.getDate() - 1);
    const yyyy = estNow.getFullYear();
    const mm = String(estNow.getMonth() + 1).padStart(2, '0');
    const dd = String(estNow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [currentDate] = useState<string>(getTodayEST());

  // Season start/end (configurable)
  const seasonStartISO = '2024-11-14T17:00:00-05:00';
  const getSeasonStart = () => new Date(seasonStartISO);
  const getAllSeasonDates = (): string[] => {
    const start = new Date(getSeasonStart());
    const today = new Date(getTodayEST() + 'T12:00:00-05:00');
    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= today) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  // Worlds + Towers data
  const worlds = useMemo(() => [
    { num:1, color:'bg-slate-600', bosses:['Big Tree Guardian','Crab Prince','Dire Boarwolf'], dungeons:[
      {name:'1-1 Crabby Crusade', normal:1, challenge:2},{name:'1-2 Scarecrow Defense', normal:1, challenge:2},{name:'1-3 Dire Problem', normal:1, challenge:2},{name:'1-4 Kingslayer', normal:1, challenge:2},{name:'1-5 Gravetower Dungeon', normal:1, challenge:2}
    ]},
    { num:2, color:'bg-green-600', bosses:['Big Poison Flower','Dark Goblin Knight','Red Goblins'], dungeons:[
      {name:'2-1 Temple of Ruin',normal:1,challenge:2},{name:'2-2 Mama Trauma',normal:1,challenge:2},{name:"2-3 Volcano's Shadow",normal:2,challenge:3},{name:'2-4 Volcano Dungeon',normal:2,challenge:3}
    ]},
    { num:3, color:'bg-blue-600', bosses:['Icy Blob','Castle Commander','Dragon Protector'], dungeons:[
      {name:'3-1 Mountain Pass',normal:2,challenge:3},{name:'3-2 Winter Cavern',normal:2,challenge:3},{name:'3-3 Winter Dungeon',normal:2,challenge:3}
    ]},
    { num:4, color:'bg-orange-600', bosses:['Elder Golem','Buff Twins (Cac & Tus)','Fire Scorpion'], dungeons:[
      {name:'4-1 Scrap Canyon',normal:3,challenge:4},{name:'4-2 Deserted Burrowmine',normal:3,challenge:4},{name:'4-3 Pyramid Dungeon',normal:3,challenge:4}
    ]},
    { num:5, color:'bg-pink-600', bosses:['Great Blossom Tree','Blue Goblin Gatekeeper','Hand of Ignis'], dungeons:[
      {name:'5-1 Konoh Heartlands',normal:3,challenge:4},{name:'5-2 Konoh Inferno',normal:4,challenge:5}
    ]},
    { num:6, color:'bg-teal-600', bosses:['Whirlpool Scorpion','Lava Shark'], dungeons:[
      {name:'6-1 Rough Waters',normal:4,challenge:5},{name:'6-2 Treasure Hunt',normal:4,challenge:5}
    ]},
    { num:7, color:'bg-red-600', bosses:['Son of Ignis','Hades','Minotaur'], dungeons:[
      {name:'7-1 The Underworld',normal:5,challenge:6},{name:'7-2 The Labyrinth',normal:5,challenge:6}
    ]},
    { num:8, color:'bg-yellow-700', bosses:['Gargantigator','Ancient Emerald Guardian','Toa: Tree of the Ruins','Ruinous, Poison Dragon'], dungeons:[
      {name:'8-1 Rescue in the Ruins',normal:5,challenge:6},{name:'8-2 Ruin Rush',normal:6,challenge:7}
    ]},
    { num:9, color:'bg-purple-700', bosses:['Aether Lord','Giant Minotaur','Redwood Mammoose'], dungeons:[
      {name:'9-1 Treetop Trouble',normal:6,challenge:7},{name:'9-2 Aether Fortress',normal:6,challenge:7}
    ]},
    { num:10, color:'bg-fuchsia-800', bosses:['Crystal Assassin','Crystal Alpha','Crystal Tyrant'], dungeons:[
      {name:'10-1 Crystal Chaos',normal:7,challenge:8},{name:'10-2 Astral Academy',normal:7,challenge:8}
    ]}
  ], []);

  const towers = useMemo(() => [
    { name: 'Prison Tower', points: 15, color: 'bg-pink-300' },
    { name: 'Atlantis Tower', points: 15, color: 'bg-cyan-400' },
    { name: 'Mezuvian Tower', points: 15, color: 'bg-red-400' },
    { name: 'Oasis Tower', points: 15, color: 'bg-orange-300' },
    { name: 'Aether Tower', points: 15, color: 'bg-purple-400' },
    { name: 'Arcane Tower', points: 15, color: 'bg-pink-500' },
    { name: 'Celestial Tower', points: 15, color: 'bg-yellow-400' }
  ], []);

  // Load saved state
  useEffect(() => {
    const name = localStorage.getItem('hyyerr_player_name');
    if (name) setPlayerName(name);
    const s = localStorage.getItem('hyyerr_current_season');
    if (s) setCurrentSeason(parseInt(s, 10));
    const seasonKey = `season${s || currentSeason}`;
    const hist = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
    const nts = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
    if (hist) {
      try { setHistory(JSON.parse(hist)); } catch (e) { console.error(e); }
    }
    if (nts) {
      try { setNotes(JSON.parse(nts)); } catch (e) { console.error(e); }
    }
  }, []); // eslint-disable-line

  // Save currentPlayer daily and update history
  useEffect(() => {
    if (!currentPlayer) return;
    localStorage.setItem(`hyyerr_player_${currentDate}`, JSON.stringify(currentPlayer));
    const pts = calculatePoints(currentPlayer);
    const key = `season${currentSeason}`;
    const updated = { ...history, [currentDate]: pts };
    setHistory(updated);
    localStorage.setItem(`hyyerr_points_history_${key}`, JSON.stringify(updated));
    // eslint-disable-next-line
  }, [currentPlayer]);

  // Initialize player
  const initializePlayer = () => {
    const name = playerName.trim();
    if (!name) return;
    localStorage.setItem('hyyerr_player_name', name);
    const stored = localStorage.getItem(`hyyerr_player_${currentDate}`);
    if (stored) {
      try { setCurrentPlayer(JSON.parse(stored)); return; } catch {}
    }
    const blank: PlayerShape = { name, dungeons: {}, worldEvents: {}, towers: {}, infiniteTower: { floor: 0 }, guildQuests: { easy: false, medium: false, hard: false } };
    setCurrentPlayer(blank);
  };

  // Utilities
  const formatDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculatePoints = (player: PlayerShape | null) => {
    if (!player) return 0;
    let points = 0;
    worlds.forEach(world => {
      world.dungeons.forEach(d => {
        if (player.dungeons[`${d.name}_normal`]) points += d.normal;
        if (player.dungeons[`${d.name}_challenge`]) points += d.challenge;
      });
      world.bosses.forEach(b => {
        if (player.worldEvents[`world${world.num}_${b}`]) points += 1;
      });
    });
    towers.forEach(t => { if (player.towers[t.name]) points += t.points; });
    if (player.infiniteTower.floor > 0) points += Math.floor(player.infiniteTower.floor / 5) * 5;
    if (player.guildQuests.easy) points += 25;
    if (player.guildQuests.medium) points += 50;
    if (player.guildQuests.hard) points += 100;
    return points;
  };

  // Update functions
  const updateCompletion = (category: keyof PlayerShape | 'infiniteTower', key: string | null, value: any) => {
    if (!currentPlayer) return;
    const updated: any = { ...currentPlayer };
    if (category === 'guildQuests' || category === 'infiniteTower') {
      updated[category] = { ...updated[category], ...value };
    } else {
      updated[category] = { ...updated[category], [key as string]: value };
    }
    setCurrentPlayer(updated);
  };

  // History edit/save
  const startEdit = (date: string, points: number) => { setEditingDate(date); setEditValue(String(points || 0)); };
  const saveEdit = () => {
    if (!editingDate) return;
    const key = `season${currentSeason}`;
    const updated = { ...history, [editingDate]: parseInt(editValue || '0', 10) || 0 };
    setHistory(updated);
    localStorage.setItem(`hyyerr_points_history_${key}`, JSON.stringify(updated));
    setEditingDate(null);
    setEditValue('');
  };
  const cancelEdit = () => { setEditingDate(null); setEditValue(''); };

  // Notes
  const startNoteEdit = (date: string) => { setEditingNote(date); setNoteValue(notes[date] || ''); };
  const saveNote = () => {
    if (!editingNote) return;
    const key = `season${currentSeason}`;
    const updated = { ...notes, [editingNote]: noteValue };
    setNotes(updated);
    localStorage.setItem(`hyyerr_notes_${key}`, JSON.stringify(updated));
    setEditingNote(null);
    setNoteValue('');
  };
  const cancelNote = () => { setEditingNote(null); setNoteValue(''); };

  // Export / Import
  const exportData = () => {
    const payload: any = { version: '1.0', exportDate: new Date().toISOString(), playerName, currentSeason, allSeasons: {} };
    for (let s = 1; s <= currentSeason; s++) {
      const sk = `season${s}`;
      const h = localStorage.getItem(`hyyerr_points_history_${sk}`);
      const n = localStorage.getItem(`hyyerr_notes_${sk}`);
      if (h || n) payload.allSeasons[s] = { history: h ? JSON.parse(h) : {}, notes: n ? JSON.parse(n) : {} };
    }
    const td = localStorage.getItem(`hyyerr_player_${currentDate}`);
    if (td) payload.todayData = JSON.parse(td);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyyerr-backup-${currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const importDataFromFile = () => {
    try {
      const data = JSON.parse(importData);
      if (!data.version || !data.allSeasons) { alert('Invalid backup file format'); return; }
      if (!window.confirm(`This will import data from backup created on ${new Date(data.exportDate).toLocaleString()}. This may overwrite existing data. Continue?`)) return;
      if (data.playerName) { localStorage.setItem('hyyerr_player_name', data.playerName); setPlayerName(data.playerName); }
      Object.keys(data.allSeasons).forEach(season => {
        const seasonKey = `season${season}`;
        const sd = (data.allSeasons as any)[season];
        if (sd.history) localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(sd.history));
        if (sd.notes) localStorage.setItem(`hyyerr_notes_${seasonKey}`, JSON.stringify(sd.notes));
      });
      if (data.currentSeason) {
        localStorage.setItem('hyyerr_current_season', data.currentSeason.toString());
        setCurrentSeason(data.currentSeason);
        const sk = `season${data.currentSeason}`;
        const sh = localStorage.getItem(`hyyerr_points_history_${sk}`);
        const sn = localStorage.getItem(`hyyerr_notes_${sk}`);
        setHistory(sh ? JSON.parse(sh) : {});
        setNotes(sn ? JSON.parse(sn) : {});
      }
      if (data.todayData) { localStorage.setItem(`hyyerr_player_${currentDate}`, JSON.stringify(data.todayData)); setCurrentPlayer(data.todayData); }
      alert('Data imported successfully!');
      setShowImportModal(false);
      setImportData('');
    } catch (e: any) {
      alert('Error importing data: ' + (e?.message || String(e)));
    }
  };

  // Calendar interactions
  const openCalendarForDate = (date: string) => {
    const pts = history[date] || 0;
    startEdit(date, pts);
    setShowCalendar(false);
  };

  // Toggle world collapse
  const toggleWorldCollapse = (n: number) => setCollapsedWorlds(prev => ({ ...prev, [n]: !prev[n] }));

  // Analytics
  const getAnalytics = () => {
    const sorted = Object.keys(history).sort();
    const last30 = sorted.slice(-30);
    const chart = last30.map(d => ({ date: formatDate(d), points: history[d] || 0 }));
    const daysOver300 = Object.values(history).filter(p => p >= 300).length;
    const totalDays = Object.keys(history).length;
    const goalPercentage = totalDays ? Math.round((daysOver300 / totalDays) * 100) : 0;
    const maxPoints = Math.max(0, ...Object.values(history));
    const last7 = sorted.slice(-7).map(d => history[d] || 0);
    const weeklyAvg = last7.length ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : 0;
    let streak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (history[sorted[i]] >= 300) streak++; else break;
    }
    return { chart, goalPercentage, daysOver300, totalDays, maxPoints, weeklyAvg, streak };
  };

  const analytics = getAnalytics();

  // Recent history helpers
  const recentHistory = Object.keys(history).sort().reverse().slice(0, 7).map(d => ({ date: d, points: history[d] || 0 }));
  const totalPoints = Object.values(history).reduce((a, b) => a + (b || 0), 0);
  const avgPoints = Object.keys(history).length ? Math.round(totalPoints / Object.keys(history).length) : 0;

  // Render
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-500/30">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={48} />
                  THE HYYERR GUILD
                </h1>
                <div className="flex gap-2">
                  <button onClick={() => setShowSeasonModal(true)} className="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Season Management"><RefreshCw size={24} /></button>
                  <button onClick={() => setShowExportModal(true)} className="text-gray-400 hover:text-green-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Export Data"><Download size={24} /></button>
                  <button onClick={() => setShowImportModal(true)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Import Data"><Upload size={24} /></button>
                  {recentHistory.length > 0 && (<button onClick={()=>setShowAnalytics(!showAnalytics)} className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="View Analytics"><BarChart3 size={24}/></button>)}
                  <button onClick={()=>setShowCalendar(true)} className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Calendar - Backdate Points"><CalendarDays size={24}/></button>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl text-yellow-400 font-semibold">World // Zero Point Tracker</h2>
              <p className="text-gray-300 mt-2 text-base md:text-lg">Season {currentSeason} • Daily Goal: 300+ Points</p>
              <p className="text-gray-500 text-xs mt-1">⏰ Day reset at 5:00 PM EST</p>
            </div>

            {showAnalytics && recentHistory.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 mb-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={24} className="text-purple-400"/> Performance Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Goal Success</div>
                    <div className="text-2xl font-bold text-green-400">{analytics.goalPercentage}%</div>
                    <div className="text-xs text-gray-500">{analytics.daysOver300}/{analytics.totalDays} days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Current Streak</div>
                    <div className="text-2xl font-bold text-yellow-400">{analytics.streak}</div>
                    <div className="text-xs text-gray-500">days ≥300pts</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">7-Day Avg</div>
                    <div className="text-2xl font-bold text-blue-400">{analytics.weeklyAvg}</div>
                    <div className="text-xs text-gray-500">points/day</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Best Day</div>
                    <div className="text-2xl font-bold text-purple-400">{analytics.maxPoints}</div>
                    <div className="text-xs text-gray-500">max points</div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Last 30 Days Trend</h4>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.chart.map((day, idx) => {
                      const height = Math.max((day.points / 400) * 100, 5);
                      const color = day.points >= 300 ? 'bg-green-500' : 'bg-yellow-500';
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className={`${color} w-full rounded-t transition-all hover:opacity-80 cursor-pointer`} style={{ height: `${height}%` }} title={`${day.date}: ${day.points} pts`} />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/20">
                            {day.date}: {day.points}pts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Oldest</span><span>Most Recent</span></div>
                </div>
              </div>
            )}

            {recentHistory.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CalendarIcon size={24} className="text-yellow-400"/> Your Point History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {recentHistory.map(({date, points}) => (
                    <div key={date} className={`rounded-lg p-3 ${date===currentDate?'bg-yellow-500/5 border border-yellow-500/30':'bg-white/5'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-gray-400 text-xs">{formatDate(date)}</div>
                          <div className={`text-lg font-bold ${points>=300?'text-green-400':'text-yellow-400'}`}>{points} pts</div>
                        </div>
                        <div className="flex gap-2">
                          {date===currentDate ? <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Today</span> : <>
                            <button onClick={()=>startNoteEdit(date)} className="text-gray-400 hover:text-blue-400" title="Add/Edit Note"><StickyNote size={16}/></button>
                            <button onClick={()=>startEdit(date, points)} className="text-gray-400 hover:text-white" title="Edit Points"><Edit2 size={16}/></button>
                          </>}
                        </div>
                      </div>
                      {notes[date] && (<div className="text-xs text-gray-400 bg-black/20 rounded p-2 mt-2"><div className="flex items-start gap-1"><StickyNote size={12} className="mt-0.5"/><span className="break-words">{notes[date]}</span></div></div>)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-3 border border-blue-500/30">
                    <div className="text-gray-300 text-xs mb-1">Total Points</div>
                    <div className="text-2xl font-bold text-blue-400">{totalPoints}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
                    <div className="text-gray-300 text-xs mb-1">Daily Average</div>
                    <div className="text-2xl font-bold text-green-400">{avgPoints}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{playerName?`Welcome back, ${playerName}!`:'Enter Your Name to Start'}</h3>
              <div className="flex gap-3">
                <input type="text" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} onKeyPress={(e)=>e.key==='Enter' && initializePlayer()} placeholder="Your Roblox username" className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button onClick={initializePlayer} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors">Start Tracking</button>
              </div>
            </div>

          </div>
        </div>

        {/* Edit Modal */}
        {editingDate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-2">Edit Points</h3>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">{formatDate(editingDate)}</p>
                {editingDate===currentDate ? <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Today</span> : <span className="inline-block mt-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Past Date</span>}
              </div>
              <input type="number" value={editValue} onChange={(e)=>setEditValue(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Enter points" autoFocus />
              <div className="flex gap-3">
                <button onClick={saveEdit} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"><Check size={18}/>Save</button>
                <button onClick={cancelEdit} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"><X size={18}/>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><StickyNote size={20}/> Add Note</h3>
              <p className="text-gray-400 text-sm mb-4">{formatDate(editingNote!)}</p>
              <textarea value={noteValue} onChange={(e)=>setNoteValue(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px] resize-y" placeholder="Add notes about this day..." autoFocus />
              <div className="flex gap-3">
                <button onClick={saveNote} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"><Check size={18}/>Save Note</button>
                <button onClick={cancelNote} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"><X size={18}/>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Season Modal */}
        {showSeasonModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><RefreshCw size={20}/> Season Management</h3>
              <p className="text-gray-400 text-sm mb-6">Currently viewing Season {currentSeason}</p>
              <div className="space-y-3">
                <button onClick={()=>{
                  const ns = currentSeason + 1;
                  setCurrentSeason(ns); localStorage.setItem('hyyerr_current_season', ns.toString()); setHistory({}); setNotes({}); setShowSeasonModal(false); alert(`Started Season ${ns}! Previous season data is saved.`);
                }} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"><RefreshCw size={18}/>Start Season {currentSeason+1}</button>
                <button onClick={()=>{
                  const s = prompt(`Enter season number to view (current: ${currentSeason}):`);
                  if(!s) return; const sn = parseInt(s,10); if(sn>0 && sn<=currentSeason){ setCurrentSeason(sn); localStorage.setItem('hyyerr_current_season', sn.toString()); const sk=`season${sn}`; const sh = localStorage.getItem(`hyyerr_points_history_${sk}`); const snotes = localStorage.getItem(`hyyerr_notes_${sk}`); setHistory(sh?JSON.parse(sh):{}); setNotes(snotes?JSON.parse(snotes):{}); setShowSeasonModal(false); }
                }} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"><CalendarIcon size={18}/>View Past Season</button>
                <button onClick={()=>setShowSeasonModal(false)} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Download size={20} className="text-green-400"/> Export Data</h3>
              <p className="text-gray-400 text-sm mb-6">Download a backup of all your guild tracking data including history, notes, and current progress for all seasons.</p>
              <div className="space-y-3">
                <button onClick={exportData} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"><Download size={18}/>Download Backup File</button>
                <button onClick={()=>setShowExportModal(false)} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Upload size={20} className="text-blue-400"/> Import Data</h3>
              <p className="text-gray-400 text-sm mb-4">Paste the content of your backup file below to restore your data.</p>
              <textarea value={importData} onChange={(e)=>setImportData(e.target.value)} placeholder='Paste backup JSON here...' className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[200px] resize-y font-mono text-xs" />
              <div className="space-y-3">
                <button onClick={importDataFromFile} disabled={!importData.trim()} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg">Import Data</button>
                <button onClick={()=>{ setShowImportModal(false); setImportData(''); }} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full border border-cyan-500/30 my-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarDays size={20} className="text-cyan-400"/> Season {currentSeason} Calendar - Select Date</h3>
                <button onClick={()=>setShowCalendar(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
              </div>
              <p className="text-gray-400 text-sm mb-6">Season starts {formatDate((getSeasonStart()).toISOString().slice(0,10))}. Select any date to add or update points for that day.</p>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500/30 border-2 border-green-500 rounded"></div><span className="text-gray-300">Goal reached (≥300)</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500/30 border-2 border-yellow-500 rounded"></div><span className="text-gray-300">Has points (&lt;300)</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded"></div><span className="text-gray-300">No data</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500/30 border-2 border-blue-500 rounded"></div><span className="text-gray-300">Today</span></div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 max-h-96 overflow-y-auto">
                {getAllSeasonDates().map((date) => {
                  const pts = history[date] || 0;
                  const has = history[date] !== undefined;
                  const isToday = date === currentDate;
                  const note = notes[date];
                  let cls = 'bg-gray-700 border-gray-600';
                  if (isToday) cls = 'bg-blue-500/30 border-blue-500';
                  else if (pts >= 300) cls = 'bg-green-500/30 border-green-500';
                  else if (has) cls = 'bg-yellow-500/30 border-yellow-500';
                  return (
                    <button key={date} onClick={()=>openCalendarForDate(date)} className={`${cls} border-2 rounded-lg p-3 hover:opacity-80 transition-all text-left relative group`} title={`${formatDate(date)}${has?` - ${pts} pts`:' - No data'}${note?`\nNote: ${note}`:''}`}>
                      <div className="text-white text-xs font-semibold mb-1">{new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                      {has ? <div className="text-gray-300 text-xs font-medium">{pts} pts</div> : <div className="text-gray-500 text-xs">No data</div>}
                      {isToday && <div className="absolute top-1 right-1"><div className="w-2 h-2 bg-blue-400 rounded-full"></div></div>}
                      {note && <div className="absolute bottom-1 right-1"><StickyNote size={10} className="text-gray-400"/></div>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-300 text-xs"><strong>Tip:</strong> Click any date to add or update points (backdate entries). Season start is configurable.</p>
              </div>

              <div className="mt-4"><button onClick={()=>setShowCalendar(false)} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Close Calendar</button></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorldZeroTracker;
