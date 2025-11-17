import React, { useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  Target,
  Calendar,
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

  const getTodayEST = (): string => {
    const now = new Date();
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    if (est.getHours() < 17) est.setDate(est.getDate() - 1);
    const yyyy = est.getFullYear();
    const mm = String(est.getMonth() + 1).padStart(2, '0');
    const dd = String(est.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [currentDate] = useState<string>(getTodayEST());

  const worlds = useMemo(() => [
    { num:1, color:'bg-slate-600', bosses:['Big Tree Guardian','Crab Prince','Dire Boarwolf'], dungeons:[{name:'1-1 Crabby Crusade',normal:1,challenge:2},{name:'1-2 Scarecrow Defense',normal:1,challenge:2},{name:'1-3 Dire Problem',normal:1,challenge:2},{name:'1-4 Kingslayer',normal:1,challenge:2},{name:'1-5 Gravetower Dungeon',normal:1,challenge:2}]},
    { num:2, color:'bg-green-600', bosses:['Big Poison Flower','Dark Goblin Knight','Red Goblins'], dungeons:[{name:'2-1 Temple of Ruin',normal:1,challenge:2},{name:'2-2 Mama Trauma',normal:1,challenge:2},{name:\"2-3 Volcano's Shadow\",normal:2,challenge:3},{name:'2-4 Volcano Dungeon',normal:2,challenge:3}]},
    { num:3, color:'bg-blue-600', bosses:['Icy Blob','Castle Commander','Dragon Protector'], dungeons:[{name:'3-1 Mountain Pass',normal:2,challenge:3},{name:'3-2 Winter Cavern',normal:2,challenge:3},{name:'3-3 Winter Dungeon',normal:2,challenge:3}]},
    { num:4, color:'bg-orange-600', bosses:['Elder Golem','Buff Twins (Cac & Tus)','Fire Scorpion'], dungeons:[{name:'4-1 Scrap Canyon',normal:3,challenge:4},{name:'4-2 Deserted Burrowmine',normal:3,challenge:4},{name:'4-3 Pyramid Dungeon',normal:3,challenge:4}]},
    { num:5, color:'bg-pink-600', bosses:['Great Blossom Tree','Blue Goblin Gatekeeper','Hand of Ignis'], dungeons:[{name:'5-1 Konoh Heartlands',normal:3,challenge:4},{name:'5-2 Konoh Inferno',normal:4,challenge:5}]},
    { num:6, color:'bg-teal-600', bosses:['Whirlpool Scorpion','Lava Shark'], dungeons:[{name:'6-1 Rough Waters',normal:4,challenge:5},{name:'6-2 Treasure Hunt',normal:4,challenge:5}]},
    { num:7, color:'bg-red-600', bosses:['Son of Ignis','Hades','Minotaur'], dungeons:[{name:'7-1 The Underworld',normal:5,challenge:6},{name:'7-2 The Labyrinth',normal:5,challenge:6}]},
    { num:8, color:'bg-yellow-700', bosses:['Gargantigator','Ancient Emerald Guardian','Toa: Tree of the Ruins','Ruinous, Poison Dragon'], dungeons:[{name:'8-1 Rescue in the Ruins',normal:5,challenge:6},{name:'8-2 Ruin Rush',normal:6,challenge:7}]},
    { num:9, color:'bg-purple-700', bosses:['Aether Lord','Giant Minotaur','Redwood Mammoose'], dungeons:[{name:'9-1 Treetop Trouble',normal:6,challenge:7},{name:'9-2 Aether Fortress',normal:6,challenge:7}]},
    { num:10, color:'bg-fuchsia-800', bosses:['Crystal Assassin','Crystal Alpha','Crystal Tyrant'], dungeons:[{name:'10-1 Crystal Chaos',normal:7,challenge:8},{name:'10-2 Astral Academy',normal:7,challenge:8}]}
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

  useEffect(() => {
    const name = localStorage.getItem('hyyerr_player_name');
    if (name) setPlayerName(name);
    const s = localStorage.getItem('hyyerr_current_season');
    if (s) setCurrentSeason(parseInt(s,10));
    const seasonKey = `season${s || currentSeason}`;
    const hist = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
    const nts = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
    if (hist) { try { setHistory(JSON.parse(hist)); } catch(e){console.error(e);} }
    if (nts) { try { setNotes(JSON.parse(nts)); } catch(e){console.error(e);} }
  }, []); // eslint-disable-line

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

  const initializePlayer = () => {
    const name = playerName.trim();
    if (!name) return;
    localStorage.setItem('hyyerr_player_name', name);
    const stored = localStorage.getItem(`hyyerr_player_${currentDate}`);
    if (stored) {
      try { setCurrentPlayer(JSON.parse(stored)); return; } catch {}
    }
    const blank: PlayerShape = { name, dungeons:{}, worldEvents:{}, towers:{}, infiniteTower:{floor:0}, guildQuests:{easy:false,medium:false,hard:false} };
    setCurrentPlayer(blank);
  };

  const formatDate = (dStr: string) => {
    const d = new Date(dStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const updateCompletion = (category: keyof PlayerShape | 'infiniteTower', key: string | null, value: any) => {
    if (!currentPlayer) return;
    const updated = { ...currentPlayer } as any;
    if (category === 'guildQuests' || category === 'infiniteTower') {
      updated[category] = { ...updated[category], ...value };
    } else {
      updated[category] = { ...updated[category], [key as string]: value };
    }
    setCurrentPlayer(updated);
  };

  const startEdit = (date: string, points: number) => { setEditingDate(date); setEditValue(String(points || 0)); };
  const saveEdit = () => { if(!editingDate) return; const key=`season${currentSeason}`; const updated={...history,[editingDate]:parseInt(editValue||'0',10)||0}; setHistory(updated); localStorage.setItem(`hyyerr_points_history_${key}`, JSON.stringify(updated)); setEditingDate(null); setEditValue(''); };
  const cancelEdit = () => { setEditingDate(null); setEditValue(''); };

  const startNoteEdit = (date: string) => { setEditingNote(date); setNoteValue(notes[date]||''); };
  const saveNote = () => { if(!editingNote) return; const key=`season${currentSeason}`; const updated={...notes,[editingNote]:noteValue}; setNotes(updated); localStorage.setItem(`hyyerr_notes_${key}`, JSON.stringify(updated)); setEditingNote(null); setNoteValue(''); };
  const cancelNote = () => { setEditingNote(null); setNoteValue(''); };

  const exportData = () => {
    const payload:any = { version:'1.0', exportDate:new Date().toISOString(), playerName, currentSeason, allSeasons:{} };
    for(let s=1;s<=currentSeason;s++){ const sk=`season${s}`; const h=localStorage.getItem(`hyyerr_points_history_${sk}`); const n=localStorage.getItem(`hyyerr_notes_${sk}`); if(h||n) payload.allSeasons[s]= { history: h? JSON.parse(h): {}, notes: n? JSON.parse(n): {} }; }
    const td = localStorage.getItem(`hyyerr_player_${currentDate}`); if(td) payload.todayData = JSON.parse(td);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hyyerr-backup-${currentDate}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const importDataFromFile = () => {
    try {
      const data = JSON.parse(importData);
      if(!data.version||!data.allSeasons){ alert('Invalid backup file format'); return; }
      if(!confirm(`Import will overwrite data from backup created on ${new Date(data.exportDate).toLocaleString()}. Continue?`)) return;
      if(data.playerName){ localStorage.setItem('hyyerr_player_name', data.playerName); setPlayerName(data.playerName); }
      Object.keys(data.allSeasons).forEach(season=>{ const seasonKey=`season${season}`; const sd=data.allSeasons[season]; if(sd.history) localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(sd.history)); if(sd.notes) localStorage.setItem(`hyyerr_notes_${seasonKey}`, JSON.stringify(sd.notes)); });
      if(data.currentSeason){ localStorage.setItem('hyyerr_current_season', data.currentSeason.toString()); setCurrentSeason(data.currentSeason); const sk=`season${data.currentSeason}`; const sh=localStorage.getItem(`hyyerr_points_history_${sk}`); const sn=localStorage.getItem(`hyyerr_notes_${sk}`); setHistory(sh?JSON.parse(sh):{}); setNotes(sn?JSON.parse(sn):{}); }
      if(data.todayData){ localStorage.setItem(`hyyerr_player_${currentDate}`, JSON.stringify(data.todayData)); setCurrentPlayer(data.todayData); }
      alert('Data imported successfully!'); setShowImportModal(false); setImportData('');
    } catch(e:any){ alert('Error importing data: '+(e?.message||String(e))); }
  };

  const toggleWorldCollapse = (w:number) => setCollapsedWorlds(prev=>({...prev,[w]:!prev[w]}));

  const startNewSeason = () => { const ns=currentSeason+1; setCurrentSeason(ns); localStorage.setItem('hyyerr_current_season', ns.toString()); setHistory({}); setNotes({}); setShowSeasonModal(false); alert(`Started Season ${ns}! Previous season data is saved.`); };
  const viewPastSeason = () => { const s = prompt(`Enter season number to view (current: ${currentSeason}):`); if(!s) return; const sn=parseInt(s,10); if(sn>0 && sn<=currentSeason){ setCurrentSeason(sn); localStorage.setItem('hyyerr_current_season', sn.toString()); const sk=`season${sn}`; const sh=localStorage.getItem(`hyyerr_points_history_${sk}`); const snotes=localStorage.getItem(`hyyerr_notes_${sk}`); setHistory(sh?JSON.parse(sh):{}); setNotes(snotes?JSON.parse(snotes):{}); setShowSeasonModal(false); } };

  const getRecentHistory = () => Object.keys(history).sort().reverse().slice(0,7).map(d=>({date:d,points:history[d]||0}));
  const recentHistory = getRecentHistory();
  const totalPoints = Object.values(history).reduce((a,b)=>a+(b||0),0);
  const avgPoints = Object.keys(history).length ? Math.round(totalPoints / Object.keys(history).length) : 0;

  const getAnalyticsData = () => {
    const sorted = Object.keys(history).sort();
    const last30 = sorted.slice(-30);
    const chartData = last30.map(d=>({ date: formatDate(d), points: history[d]||0 }));
    const daysOver300 = Object.values(history).filter(p=>p>=300).length;
    const totalDays = Object.keys(history).length;
    const goalPercentage = totalDays>0?Math.round((daysOver300/totalDays)*100):0;
    const maxPoints = Math.max(...Object.values(history),0);
    const last7 = sorted.slice(-7).map(d=>history[d]||0);
    const weeklyAvg = last7.length?Math.round(last7.reduce((a,b)=>a+b,0)/last7.length):0;
    let currentStreak=0;
    for(let i=sorted.length-1;i>=0;i--){ if(history[sorted[i]]>=300) currentStreak++; else break; }
    return { chartData, totalDays, daysOver300, goalPercentage, maxPoints, weeklyAvg, currentStreak };
  };

  const analytics = getAnalyticsData();

  // Simple initial render when no player
  if(!currentPlayer){
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
                  <button onClick={()=>setShowSeasonModal(true)} className="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Season Management"><RefreshCw size={24}/></button>
                  <button onClick={()=>setShowExportModal(true)} className="text-gray-400 hover:text-green-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Export Data"><Download size={24}/></button>
                  <button onClick={()=>setShowImportModal(true)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Import Data"><Upload size={24}/></button>
                  {recentHistory.length>0 && (<button onClick={()=>setShowAnalytics(!showAnalytics)} className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="View Analytics"><BarChart3 size={24}/></button>)}
                  <button onClick={()=>setShowCalendar(true)} className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Calendar - Backdate Points"><CalendarDays size={24}/></button>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl text-yellow-400 font-semibold">World // Zero Point Tracker</h2>
              <p className="text-gray-300 mt-2 text-base md:text-lg">Season {currentSeason} • Daily Goal: 300+ Points</p>
            </div>
            {/* Analytics / history / form omitted for brevity in this sample file */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{playerName?`Welcome back, ${playerName}!`:'Enter Your Name to Start'}</h3>
              <div className="flex gap-3">
                <input type="text" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} onKeyPress={(e)=>e.key==='Enter' && initializePlayer()} placeholder="Your Roblox username" className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button onClick={initializePlayer} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors">Start Tracking</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const myPoints = calculatePoints(currentPlayer);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl border border-yellow-500/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2"><Trophy className="text-yellow-400"/> {currentPlayer.name}</h1>
              <p className="text-yellow-200">Season {currentSeason} • {formatDate(currentDate)}</p>
            </div>
            <button onClick={()=>setCurrentPlayer(null)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors">View History</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
              <div className="text-gray-300 text-sm mb-1">Today's Points</div>
              <div className={`text-4xl font-bold ${myPoints>=300?'text-green-400':'text-yellow-400'}`}>{myPoints}<span className="text-lg text-gray-400 ml-2">/ 300</span></div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30"><div className="text-gray-300 text-sm mb-1">Total (All Time)</div><div className="text-3xl font-bold text-blue-400">{totalPoints}</div></div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"><div className="text-gray-300 text-sm mb-1">Daily Average</div><div className="text-3xl font-bold text-green-400">{avgPoints}</div></div>
          </div>
        </div>
        {/* main content truncated for brevity */}
      </div>
    </div>
  );
};

export default WorldZeroTracker;
