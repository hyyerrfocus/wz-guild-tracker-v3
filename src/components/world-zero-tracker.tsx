import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Edit2, Check, X, StickyNote, RefreshCw, Trash2, BarChart3, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';

export default function WorldZeroTracker() {
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [history, setHistory] = useState({});
  const [notes, setNotes] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [currentSeason, setCurrentSeason] = useState(18);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [collapsedWorlds, setCollapsedWorlds] = useState({});
  const [seasonStartDate, setSeasonStartDate] = useState('');

  // Get today's date string in EST (format: YYYY-MM-DD)
  const getTodayEST = () => {
    const now = new Date();
    // Convert to EST (UTC-5)
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // If before 5 PM EST (17:00), use previous day
    if (estTime.getHours() < 17) {
      estTime.setDate(estTime.getDate() - 1);
    }
    
    // Format as YYYY-MM-DD
    const year = estTime.getFullYear();
    const month = String(estTime.getMonth() + 1).padStart(2, '0');
    const day = String(estTime.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Helper to get dates in a season
  const getSeasonDates = () => {
    if (!seasonStartDate) return [];
    const dates = [];
    const start = new Date(seasonStartDate + 'T12:00:00');
    const today = new Date(getTodayEST() + 'T12:00:00');
    
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  // Initialize selectedDate
  useEffect(() => {
    setSelectedDate(getTodayEST());
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('hyyerr_player_name');
    if (storedName) {
      setPlayerName(storedName);
    }

    const storedSeason = localStorage.getItem('hyyerr_current_season');
    if (storedSeason) {
      setCurrentSeason(parseInt(storedSeason));
    }

    const seasonKey = `season${storedSeason || 18}`;
    
    const storedStartDate = localStorage.getItem(`hyyerr_season_start_${seasonKey}`);
    if (storedStartDate) {
      setSeasonStartDate(storedStartDate);
    }
    
    const storedHistory = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    const storedNotes = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentPlayer && selectedDate) {
      const stored = localStorage.getItem(`hyyerr_player_${selectedDate}`);
      if (stored) {
        try {
          const loadedPlayer = JSON.parse(stored);
          if (JSON.stringify(loadedPlayer) !== JSON.stringify(currentPlayer)) {
            setCurrentPlayer(loadedPlayer);
          }
        } catch (e) {
          console.error('Error loading data:', e);
        }
      } else if (selectedDate !== getTodayEST()) {
        // Initialize empty player for past dates without data
        setCurrentPlayer({
          name: currentPlayer.name,
          dungeons: {},
          worldEvents: {},
          towers: {},
          infiniteTower: { floor: 0 },
          guildQuests: { easy: false, medium: false, hard: false }
        });
      }
    }
  }, [selectedDate]);

  // Save current player data
  useEffect(() => {
    if (currentPlayer && selectedDate) {
      localStorage.setItem(`hyyerr_player_${selectedDate}`, JSON.stringify(currentPlayer));
      
      // Auto-save selected date's points to history
      const points = calculatePoints(currentPlayer);
      const seasonKey = `season${currentSeason}`;
      const updatedHistory = { ...history, [selectedDate]: points };
      setHistory(updatedHistory);
      localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(updatedHistory));
    }
  }, [currentPlayer, selectedDate, currentSeason]);

  const initializePlayer = () => {
    if (!playerName.trim()) return;
    
    const name = playerName.trim();
    localStorage.setItem('hyyerr_player_name', name);
    
    // Try to load today's data first
    const today = getTodayEST();
    const stored = localStorage.getItem(`hyyerr_player_${today}`);
    if (stored) {
      try {
        setCurrentPlayer(JSON.parse(stored));
        return;
      } catch (e) {
        console.error('Error loading stored data:', e);
      }
    }
    
    // If no data for today, create new player
    const newPlayer = {
      name,
      dungeons: {},
      worldEvents: {},
      towers: {},
      infiniteTower: { floor: 0 },
      guildQuests: { easy: false, medium: false, hard: false }
    };
    setCurrentPlayer(newPlayer);
  };

  const updateCompletion = (category, key, value) => {
    const updated = { ...currentPlayer };
    if (category === 'guildQuests' || category === 'infiniteTower') {
      updated[category] = { ...updated[category], ...value };
    } else {
      updated[category] = { ...updated[category], [key]: value };
    }
    setCurrentPlayer(updated);
  };

  const startEdit = (date, points) => {
    setEditingDate(date);
    setEditValue(points.toString());
  };

  const saveEdit = () => {
    if (editingDate && editValue !== '') {
      const seasonKey = `season${currentSeason}`;
      const updatedHistory = { ...history, [editingDate]: parseInt(editValue) || 0 };
      setHistory(updatedHistory);
      localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(updatedHistory));
      setEditingDate(null);
    }
  };

  const startNoteEdit = (date) => {
    setEditingNote(date);
    setNoteValue(notes[date] || '');
  };

  const saveNote = () => {
    if (editingNote) {
      const seasonKey = `season${currentSeason}`;
      const updatedNotes = { ...notes, [editingNote]: noteValue };
      setNotes(updatedNotes);
      localStorage.setItem(`hyyerr_notes_${seasonKey}`, JSON.stringify(updatedNotes));
      setEditingNote(null);
      setNoteValue('');
    }
  };

  const cancelNote = () => {
    setEditingNote(null);
    setNoteValue('');
  };

  const startNewSeason = () => {
    const newSeason = currentSeason + 1;
    const startDate = getTodayEST();
    setCurrentSeason(newSeason);
    setSeasonStartDate(startDate);
    localStorage.setItem('hyyerr_current_season', newSeason.toString());
    localStorage.setItem(`hyyerr_season_start_season${newSeason}`, startDate);
    setHistory({});
    setNotes({});
    setShowSeasonModal(false);
    alert(`Started Season ${newSeason} on ${formatDate(startDate)}! Previous season data is saved.`);
  };

  const viewPastSeason = () => {
    const season = prompt(`Enter season number to view (current: ${currentSeason}):`);
    if (season) {
      const seasonNum = parseInt(season);
      if (seasonNum > 0 && seasonNum <= currentSeason) {
        setCurrentSeason(seasonNum);
        localStorage.setItem('hyyerr_current_season', seasonNum.toString());
        
        const seasonKey = `season${seasonNum}`;
        const storedHistory = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
        const storedNotes = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
        const storedStartDate = localStorage.getItem(`hyyerr_season_start_${seasonKey}`);
        
        setHistory(storedHistory ? JSON.parse(storedHistory) : {});
        setNotes(storedNotes ? JSON.parse(storedNotes) : {});
        setSeasonStartDate(storedStartDate || '');
        setShowSeasonModal(false);
      }
    }
  };

  const exportData = () => {
    const exportObj = {
      playerName,
      currentSeason,
      seasons: {}
    };
    
    for (let s = 1; s <= currentSeason; s++) {
      const seasonKey = `season${s}`;
      const hist = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
      const note = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
      const start = localStorage.getItem(`hyyerr_season_start_${seasonKey}`);
      
      if (hist || note || start) {
        exportObj.seasons[s] = {
          history: hist ? JSON.parse(hist) : {},
          notes: note ? JSON.parse(note) : {},
          startDate: start || ''
        };
      }
    }
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-zero-backup-${getTodayEST()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.playerName) {
          setPlayerName(data.playerName);
          localStorage.setItem('hyyerr_player_name', data.playerName);
        }
        
        if (data.seasons) {
          Object.keys(data.seasons).forEach(seasonNum => {
            const seasonKey = `season${seasonNum}`;
            const seasonData = data.seasons[seasonNum];
            
            if (seasonData.history) {
              localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(seasonData.history));
            }
            if (seasonData.notes) {
              localStorage.setItem(`hyyerr_notes_${seasonKey}`, JSON.stringify(seasonData.notes));
            }
            if (seasonData.startDate) {
              localStorage.setItem(`hyyerr_season_start_${seasonKey}`, seasonData.startDate);
            }
          });
        }
        
        alert('Data imported successfully! Refresh to see changes.');
        window.location.reload();
      } catch (err) {
        alert('Error importing data: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const toggleWorld = (worldNum) => {
    setCollapsedWorlds(prev => ({ ...prev, [worldNum]: !prev[worldNum] }));
  };

  const cancelEdit = () => {
    setEditingDate(null);
    setEditValue('');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const worlds = [
    { 
      num: 1, 
      color: 'bg-slate-600',
      bosses: ['Big Tree Guardian', 'Crab Prince', 'Dire Boarwolf'],
      dungeons: [
        { name: '1-1 Crabby Crusade', normal: 1, challenge: 2 },
        { name: '1-2 Scarecrow Defense', normal: 1, challenge: 2 },
        { name: '1-3 Dire Problem', normal: 1, challenge: 2 },
        { name: '1-4 Kingslayer', normal: 1, challenge: 2 },
        { name: '1-5 Gravetower Dungeon', normal: 1, challenge: 2 }
      ]
    },
    { 
      num: 2, 
      color: 'bg-green-600',
      bosses: ['Big Poison Flower', 'Dark Goblin Knight', 'Red Goblins'],
      dungeons: [
        { name: '2-1 Temple of Ruin', normal: 1, challenge: 2 },
        { name: '2-2 Mama Trauma', normal: 1, challenge: 2 },
        { name: '2-3 Volcano\'s Shadow', normal: 2, challenge: 3 },
        { name: '2-4 Volcano Dungeon', normal: 2, challenge: 3 }
      ]
    },
    { 
      num: 3, 
      color: 'bg-blue-600',
      bosses: ['Icy Blob', 'Castle Commander', 'Dragon Protector'],
      dungeons: [
        { name: '3-1 Mountain Pass', normal: 2, challenge: 3 },
        { name: '3-2 Winter Cavern', normal: 2, challenge: 3 },
        { name: '3-3 Winter Dungeon', normal: 2, challenge: 3 }
      ]
    },
    { 
      num: 4, 
      color: 'bg-orange-600',
      bosses: ['Elder Golem', 'Buff Twins (Cac & Tus)', 'Fire Scorpion'],
      dungeons: [
        { name: '4-1 Scrap Canyon', normal: 3, challenge: 4 },
        { name: '4-2 Deserted Burrowmine', normal: 3, challenge: 4 },
        { name: '4-3 Pyramid Dungeon', normal: 3, challenge: 4 }
      ]
    },
    { 
      num: 5, 
      color: 'bg-pink-600',
      bosses: ['Great Blossom Tree', 'Blue Goblin Gatekeeper', 'Hand of Ignis'],
      dungeons: [
        { name: '5-1 Konoh Heartlands', normal: 3, challenge: 4 },
        { name: '5-2 Konoh Inferno', normal: 4, challenge: 5 }
      ]
    },
    { 
      num: 6, 
      color: 'bg-teal-600',
      bosses: ['Whirlpool Scorpion', 'Lava Shark'],
      dungeons: [
        { name: '6-1 Rough Waters', normal: 4, challenge: 5 },
        { name: '6-2 Treasure Hunt', normal: 4, challenge: 5 }
      ]
    },
    { 
      num: 7, 
      color: 'bg-red-600',
      bosses: ['Son of Ignis', 'Hades', 'Minotaur'],
      dungeons: [
        { name: '7-1 The Underworld', normal: 5, challenge: 6 },
        { name: '7-2 The Labyrinth', normal: 5, challenge: 6 }
      ]
    },
    { 
      num: 8, 
      color: 'bg-yellow-700',
      bosses: ['Gargantigator', 'Ancient Emerald Guardian', 'Toa: Tree of the Ruins', 'Ruinous, Poison Dragon'],
      dungeons: [
        { name: '8-1 Rescue in the Ruins', normal: 5, challenge: 6 },
        { name: '8-2 Ruin Rush', normal: 6, challenge: 7 }
      ]
    },
    { 
      num: 9, 
      color: 'bg-purple-700',
      bosses: ['Aether Lord', 'Giant Minotaur', 'Redwood Mammoose'],
      dungeons: [
        { name: '9-1 Treetop Trouble', normal: 6, challenge: 7 },
        { name: '9-2 Aether Fortress', normal: 6, challenge: 7 }
      ]
    },
    { 
      num: 10, 
      color: 'bg-fuchsia-800',
      bosses: ['Crystal Assassin', 'Crystal Alpha', 'Crystal Tyrant'],
      dungeons: [
        { name: '10-1 Crystal Chaos', normal: 7, challenge: 8 },
        { name: '10-2 Astral Academy', normal: 7, challenge: 8 }
      ]
    }
  ];

  const towers = [
    { name: 'Prison Tower', points: 15, color: 'bg-pink-300' },
    { name: 'Atlantis Tower', points: 15, color: 'bg-cyan-400' },
    { name: 'Mezuvian Tower', points: 15, color: 'bg-red-400' },
    { name: 'Oasis Tower', points: 15, color: 'bg-orange-300' },
    { name: 'Aether Tower', points: 15, color: 'bg-purple-400' },
    { name: 'Arcane Tower', points: 15, color: 'bg-pink-500' },
    { name: 'Celestial Tower', points: 15, color: 'bg-yellow-400' }
  ];

  const calculatePoints = (player) => {
    if (!player) return 0;
    let points = 0;

    worlds.forEach(world => {
      world.dungeons.forEach(dungeon => {
        if (player.dungeons[`${dungeon.name}_normal`]) points += dungeon.normal;
        if (player.dungeons[`${dungeon.name}_challenge`]) points += dungeon.challenge;
      });
    });

    worlds.forEach(world => {
      world.bosses.forEach((boss, idx) => {
        if (player.worldEvents[`world${world.num}_${boss}`]) points += 1;
      });
    });

    towers.forEach(tower => {
      if (player.towers[tower.name]) points += 15;
    });

    if (player.infiniteTower.floor >= 150) {
      const floorsAbove150 = player.infiniteTower.floor - 150;
      const bossesDefeated = Math.floor(floorsAbove150 / 5);
      points += bossesDefeated * 5;
    }

    if (player.guildQuests.easy) points += 25;
    if (player.guildQuests.medium) points += 50;
    if (player.guildQuests.hard) points += 100;

    return points;
  };

  // Get last 7 days for display
  const getRecentHistory = () => {
    const sortedDates = Object.keys(history).sort().reverse();
    return sortedDates.slice(0, 7).map(date => ({
      date,
      points: history[date]
    }));
  };

  // Analytics calculations
  const calculateAnalytics = () => {
    const allDates = Object.keys(history).sort();
    const seasonDates = seasonStartDate ? getSeasonDates() : allDates;
    
    // Goal percentage
    const daysWithGoal = allDates.filter(d => history[d] >= 300).length;
    const goalPercentage = allDates.length > 0 ? Math.round((daysWithGoal / allDates.length) * 100) : 0;
    
    // Current streak
    let currentStreak = 0;
    const today = getTodayEST();
    let checkDate = new Date(today + 'T12:00:00');
    
    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (history[dateStr] && history[dateStr] >= 300) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Weekly average (last 7 days)
    const last7Days = allDates.slice(-7);
    const weeklyTotal = last7Days.reduce((sum, date) => sum + (history[date] || 0), 0);
    const weeklyAvg = last7Days.length > 0 ? Math.round(weeklyTotal / last7Days.length) : 0;
    
    // Best day
    const bestDay = allDates.reduce((best, date) => {
      return (!best || history[date] > history[best]) ? date : best;
    }, null);
    
    return {
      goalPercentage,
      currentStreak,
      weeklyAvg,
      bestDay,
      bestDayPoints: bestDay ? history[bestDay] : 0,
      totalDays: allDates.length,
      daysWithGoal
    };
  };

  const analytics = calculateAnalytics();

  const recentHistory = getRecentHistory();
  const totalPoints = Object.values(history).reduce((sum, pts) => sum + pts, 0);
  const avgPoints = recentHistory.length > 0 ? Math.round(totalPoints / Object.keys(history).length) : 0;

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-500/30">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={48} />
                  THE HYYERR GUILD
                </h1>
                <button
                  onClick={() => setShowSeasonModal(true)}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                  title="Season Management"
                >
                  <RefreshCw size={24} />
                </button>
              </div>
              <h2 className="text-2xl text-yellow-400 font-semibold">World // Zero Point Tracker</h2>
              <p className="text-gray-300 mt-2 text-lg">Season {currentSeason} • Daily Goal: 300+ Points</p>
            </div>

            {recentHistory.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={24} className="text-yellow-400" />
                  Your Point History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {recentHistory.map(({ date, points }) => (
                    <div key={date} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-gray-400 text-xs">{formatDate(date)}</div>
                          <div className={`text-lg font-bold ${points >= 300 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {points} pts
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {date === getTodayEST() ? (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Today</span>
                          ) : (
                            <>
                              <button
                                onClick={() => startNoteEdit(date)}
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                title="Add/Edit Note"
                              >
                                <StickyNote size={16} />
                              </button>
                              <button
                                onClick={() => startEdit(date, points)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Edit Points"
                              >
                                <Edit2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {notes[date] && (
                        <div className="text-xs text-gray-400 bg-black/20 rounded p-2 mt-2">
                          <div className="flex items-start gap-1">
                            <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                            <span className="break-words">{notes[date]}</span>
                          </div>
                        </div>
                      )}
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
              <h3 className="text-lg font-semibold text-white mb-4">
                {playerName ? `Welcome back, ${playerName}!` : 'Enter Your Name to Start'}
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && initializePlayer()}
                  placeholder="Your Roblox username"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={initializePlayer}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors"
                >
                  Start Tracking
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingDate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Edit Points</h3>
              <p className="text-gray-400 text-sm mb-4">{formatDate(editingDate)}</p>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter points"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <StickyNote size={20} />
                Add Note
              </h3>
              <p className="text-gray-400 text-sm mb-4">{formatDate(editingNote)}</p>
              <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px] resize-y"
                placeholder="Add notes about this day... (e.g., 'completed all quests', 'missed world 5 bosses')"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveNote}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Save Note
                </button>
                <button
                  onClick={cancelNote}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Season Management Modal */}
        {showSeasonModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw size={20} />
                Season Management
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Currently viewing Season {currentSeason}
                {seasonStartDate && ` (Started: ${formatDate(seasonStartDate)})`}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={startNewSeason}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Start Season {currentSeason + 1}
                </button>
                
                <button
                  onClick={viewPastSeason}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  View Past Season
                </button>
                
                <button
                  onClick={() => setShowSeasonModal(false)}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-xs">
                  <strong>Note:</strong> Starting a new season saves your current season data and begins fresh tracking. All previous season data is preserved and can be viewed anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-purple-500/30 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 size={24} className="text-purple-400" />
                  Analytics Dashboard
                </h3>
                <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="text-gray-300 text-xs mb-1">Goal Achievement</div>
                  <div className="text-3xl font-bold text-green-400">{analytics.goalPercentage}%</div>
                  <div className="text-xs text-gray-400 mt-1">{analytics.daysWithGoal}/{analytics.totalDays} days</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="text-gray-300 text-xs mb-1">Current Streak</div>
                  <div className="text-3xl font-bold text-orange-400">{analytics.currentStreak}</div>
                  <div className="text-xs text-gray-400 mt-1">days</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="text-gray-300 text-xs mb-1">Weekly Average</div>
                  <div className="text-3xl font-bold text-blue-400">{analytics.weeklyAvg}</div>
                  <div className="text-xs text-gray-400 mt-1">pts/day</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="text-gray-300 text-xs mb-1">Total Points</div>
                  <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
                  <div className="text-xs text-gray-400 mt-1">all time</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="text-gray-300 text-xs mb-1">Best Day</div>
                  <div className="text-3xl font-bold text-purple-400">{analytics.bestDayPoints}</div>
                  <div className="text-xs text-gray-400 mt-1">{analytics.bestDay ? formatDate(analytics.bestDay) : 'N/A'}</div>
                </div>

                <div className="bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-xl p-4 border border-teal-500/30">
                  <div className="text-gray-300 text-xs mb-1">Daily Average</div>
                  <div className="text-3xl font-bold text-teal-400">{avgPoints}</div>
                  <div className="text-xs text-gray-400 mt-1">overall</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Recent Progress</h4>
                <div className="space-y-2">
                  {Object.keys(history).sort().reverse().slice(0, 10).map(date => (
                    <div key={date} className="flex items-center justify-between bg-black/20 rounded p-2">
                      <span className="text-gray-300 text-sm">{formatDate(date)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${history[date] >= 300 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min((history[date] / 300) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-16 text-right ${history[date] >= 300 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {history[date]} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar/Date Selector Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full border border-blue-500/30 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar size={24} className="text-blue-400" />
                  Select Date to Edit
                </h3>
                <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {seasonStartDate && getSeasonDates().reverse().map(date => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setShowCalendar(false);
                      const stored = localStorage.getItem(`hyyerr_player_${date}`);
                      if (stored) {
                        setCurrentPlayer(JSON.parse(stored));
                      } else {
                        setCurrentPlayer({
                          name: currentPlayer?.name || playerName,
                          dungeons: {},
                          worldEvents: {},
                          towers: {},
                          infiniteTower: { floor: 0 },
                          guildQuests: { easy: false, medium: false, hard: false }
                        });
                      }
                    }}
                    className={`p-3 rounded-lg border transition-all ${
                      date === selectedDate
                        ? 'bg-blue-500/30 border-blue-400'
                        : history[date]
                        ? history[date] >= 300
                          ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                          : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">{formatDate(date)}</div>
                    <div className={`text-xs mt-1 ${
                      history[date]
                        ? history[date] >= 300
                          ? 'text-green-400'
                          : 'text-yellow-400'
                        : 'text-gray-500'
                    }`}>
                      {history[date] ? `${history[date]} pts` : 'No data'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Modal */}
        {showImportExport && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-green-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Backup & Restore</h3>
                <button onClick={() => setShowImportExport(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={exportData}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Export Data (Download Backup)
                </button>

                <div>
                  <label className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={18} />
                    Import Data (Restore Backup)
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-xs">
                    <strong>Tip:</strong> Export regularly to backup your data. Import will restore all your seasons and history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const myPoints = calculatePoints(currentPlayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with History */}
        <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl border border-yellow-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={32} />
                {currentPlayer.name}
              </h1>
              <p className="text-yellow-200 text-sm md:text-base">
                Season {currentSeason} • {formatDate(selectedDate)}
                {selectedDate !== getTodayEST() && <span className="ml-2 text-orange-400">(Editing Past Date)</span>}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAnalytics(true)}
                className="px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg"
                title="View Analytics"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => setShowCalendar(true)}
                className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg"
                title="Select Date"
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => setShowSeasonModal(true)}
                className="px-3 py-2 bg-orange-600/80 hover:bg-orange-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg"
                title="Season Management"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Season</span>
              </button>
              <button
                onClick={() => setShowImportExport(true)}
                className="px-3 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg"
                title="Backup & Restore"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Backup</span>
              </button>
              <button
                onClick={() => setCurrentPlayer(null)}
                className="px-3 py-2 bg-yellow-600/80 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-all text-sm shadow-lg"
              >
                View History
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/5 rounded-xl p-4 sm:col-span-2">
              <div className="text-gray-300 text-sm mb-1">Today's Points</div>
              <div className={`text-3xl md:text-4xl font-bold ${myPoints >= 300 ? 'text-green-400' : 'text-yellow-400'}`}>
                {myPoints}
                <span className="text-base md:text-lg text-gray-400 ml-2">/ 300</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${myPoints >= 300 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((myPoints / 300) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
              <div className="text-gray-300 text-sm mb-1">Total (All Time)</div>
              <div className="text-2xl md:text-3xl font-bold text-blue-400">{totalPoints}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
              <div className="text-gray-300 text-sm mb-1">Daily Average</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">{avgPoints}</div>
            </div>
          </div>
        </div>

        {/* Guild Quests */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl border border-white/20">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-green-400" size={24} />
            Guild Quests (175 pts total)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <label className="flex items-center gap-3 bg-green-500/20 rounded-lg p-4 cursor-pointer hover:bg-green-500/30 transition-colors border border-green-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.easy}
                onChange={(e) => updateCompletion('guildQuests', null, { easy: e.target.checked })}
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <div className="text-white font-medium">Easy Quest</div>
                <div className="text-green-400 text-sm">25 points</div>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-orange-500/20 rounded-lg p-4 cursor-pointer hover:bg-orange-500/30 transition-colors border border-orange-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.medium}
                onChange={(e) => updateCompletion('guildQuests', null, { medium: e.target.checked })}
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <div className="text-white font-medium">Medium Quest</div>
                <div className="text-orange-400 text-sm">50 points</div>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-red-500/20 rounded-lg p-4 cursor-pointer hover:bg-red-500/30 transition-colors border border-red-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.hard}
                onChange={(e) => updateCompletion('guildQuests', null, { hard: e.target.checked })}
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <div className="text-white font-medium">Hard Quest</div>
                <div className="text-red-400 text-sm">100 points</div>
              </div>
            </label>
          </div>
        </div>

        {/* Towers */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl border border-white/20">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Towers (15 pts each)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {towers.map(tower => (
              <label key={tower.name} className={`flex items-center gap-3 ${tower.color} bg-opacity-20 rounded-lg p-3 md:p-4 cursor-pointer hover:bg-opacity-30 transition-colors border border-white/20`}>
                <input
                  type="checkbox"
                  checked={currentPlayer.towers[tower.name] || false}
                  onChange={(e) => updateCompletion('towers', tower.name, e.target.checked)}
                  className="w-5 h-5 rounded flex-shrink-0"
                />
                <div>
                  <div className="text-white font-medium text-sm">{tower.name}</div>
                  <div className="text-purple-300 text-xs">15 points</div>
                </div>
              </label>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 md:p-6 border border-purple-500/30">
            <div className="text-white font-semibold mb-4 text-lg flex items-center gap-2">
              <Target className="text-purple-400" size={20} />
              Infinite Tower
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <label className="text-gray-300 text-sm mb-2 block">Highest Floor Reached</label>
                <input
                  type="number"
                  value={currentPlayer.infiniteTower.floor}
                  onChange={(e) => updateCompletion('infiniteTower', null, { floor: parseInt(e.target.value) || 0 })}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/50 min-w-[140px]">
                <div className="text-gray-300 text-xs mb-1">Points Earned</div>
                <div className="text-3xl font-bold text-purple-400">
                  {currentPlayer.infiniteTower.floor >= 150 
                    ? Math.floor((currentPlayer.infiniteTower.floor - 150) / 5) * 5
                    : 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">5 pts per boss (every 5 floors)</div>
                <div className="text-xs text-gray-500 mt-1">Starts at floor 150</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dungeons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {worlds.map(world => (
            <div key={world.num} className={`${world.color} bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden`}>
              <div 
                onClick={() => toggleWorld(world.num)}
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg md:text-xl font-bold text-white">World {world.num}</h3>
                  <span className="text-gray-300 text-xs md:text-sm bg-black/20 px-2 py-1 rounded">
                    {world.bosses.length} Bosses
                  </span>
                </div>
                {collapsedWorlds[world.num] ? <ChevronDown size={24} className="text-white" /> : <ChevronUp size={24} className="text-white" />}
              </div>

              {!collapsedWorlds[world.num] && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  {/* World Events */}
                  <div className="bg-black/20 rounded-lg p-3 mb-4">
                    <div className="text-white text-sm font-medium mb-2">World Bosses (1 pt each)</div>
                    <div className="flex flex-col gap-2">
                      {world.bosses.map((boss) => (
                        <label key={boss} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded px-2 py-1 transition-colors">
                          <input
                            type="checkbox"
                            checked={currentPlayer.worldEvents[`world${world.num}_${boss}`] || false}
                            onChange={(e) => updateCompletion('worldEvents', `world${world.num}_${boss}`, e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-gray-300 text-sm">{boss}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dungeons */}
                  <div className="space-y-3">
                    {world.dungeons.map(dungeon => (
                      <div key={dungeon.name} className="bg-black/20 rounded-lg p-3">
                        <div className="text-white text-sm font-medium mb-2">{dungeon.name}</div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPlayer.dungeons[`${dungeon.name}_normal`] || false}
                              onChange={(e) => updateCompletion('dungeons', `${dungeon.name}_normal`, e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                            Normal ({dungeon.normal}pt)
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPlayer.dungeons[`${dungeon.name}_challenge`] || false}
                              onChange={(e) => updateCompletion('dungeons', `${dungeon.name}_challenge`, e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                            Challenge ({dungeon.challenge}pts)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-yellow-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Edit Points</h3>
            <p className="text-gray-400 text-sm mb-4">{formatDate(editingDate)}</p>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter points"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
