import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2, Disc } from 'lucide-react';
import SnakeGame from './components/SnakeGame';

const TRACKS = [
  {
    id: 1,
    title: "Neon Horizon",
    artist: "AI Synthesis",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.5)"
  },
  {
    id: 2,
    title: "Cyber Pulse",
    artist: "Neural Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "from-pink-500 to-purple-600",
    glow: "rgba(236,72,153,0.5)"
  },
  {
    id: 3,
    title: "Digital Rain",
    artist: "Synth Mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.5)"
  }
];

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex flex-col bg-bg text-text overflow-hidden">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      {/* Header */}
      <header className="h-[60px] px-10 flex items-center justify-between border-b border-accent-cyan/20 backdrop-blur-md z-50">
        <div className="text-xl font-extrabold tracking-[2px] text-accent-cyan neon-text-cyan">
          NEON_SNAKE.OS
        </div>
        <div className="font-mono text-accent-cyan/60 text-sm">
          SYSTEM_TIME: {new Date().toLocaleTimeString([], { hour12: false })}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-[280px_1fr_280px] gap-5 p-5 overflow-hidden">
        
        {/* Sidebar Left: Stats */}
        <aside className="glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-mono uppercase tracking-[2px] text-white/40 mb-8">Player Stats</h3>
          
          <div className="mt-auto space-y-8">
            <div className="stat-item">
              <div className="text-[10px] uppercase text-white/30 tracking-widest mb-1">Current Score</div>
              <div className="font-mono text-3xl text-accent-cyan">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="stat-item">
              <div className="text-[10px] uppercase text-white/30 tracking-widest mb-1">High Score</div>
              <div className="font-mono text-3xl text-accent-cyan/60">{highScore.toString().padStart(6, '0')}</div>
            </div>
            <div className="stat-item">
              <div className="text-[10px] uppercase text-white/30 tracking-widest mb-1">Difficulty</div>
              <div className="font-mono text-xl text-accent-pink">LEVEL {Math.floor(score / 100) + 1}</div>
            </div>
          </div>
        </aside>

        {/* Center: Game Container */}
        <section className="relative bg-black border-2 border-accent-cyan/50 rounded-xl neon-glow-cyan flex items-center justify-center overflow-hidden">
          <SnakeGame onScoreChange={setScore} onHighScoreChange={setHighScore} />
        </section>

        {/* Sidebar Right: Playlist */}
        <aside className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden">
          <h3 className="text-xs font-mono uppercase tracking-[2px] text-white/40 mb-6">Playlist</h3>
          <ul className="space-y-2 overflow-y-auto">
            {TRACKS.map((track, index) => (
              <li 
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border-l-4 ${
                  currentTrackIndex === index 
                    ? 'bg-accent-cyan/10 border-accent-cyan' 
                    : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                  <Music2 className="w-4 h-4 text-white" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-medium truncate">{track.title}</h4>
                  <p className="text-xs opacity-40 truncate">{track.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </main>

      {/* Footer: Controls */}
      <footer className="h-[120px] bg-[#0a0f19]/90 border-t border-white/5 px-10 flex items-center gap-10 z-50">
        {/* Now Playing */}
        <div className="w-[240px] flex gap-4 items-center">
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className={`w-14 h-14 rounded-lg bg-gradient-to-br ${currentTrack.color} shadow-lg flex items-center justify-center`}
          >
            <Disc className="w-8 h-8 text-white/40" />
          </motion.div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold truncate">{currentTrack.title}</h4>
            <p className="text-xs opacity-50 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="flex items-center gap-8">
            <button onClick={prevTrack} className="opacity-60 hover:opacity-100 transition-opacity">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-text text-bg rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="opacity-60 hover:opacity-100 transition-opacity">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono opacity-40">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-accent-cyan shadow-[0_0_10px_#00f3ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono opacity-40">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-[150px] flex items-center gap-3 opacity-60">
          <Volume2 className="w-4 h-4" />
          <div className="flex-1 h-1 bg-white/10 rounded-full">
            <div className="w-[70%] h-full bg-accent-cyan rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
