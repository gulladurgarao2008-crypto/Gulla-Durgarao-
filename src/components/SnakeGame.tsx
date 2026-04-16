import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  onHighScoreChange: (highScore: number) => void;
}

export default function SnakeGame({ onScoreChange, onHighScoreChange }: SnakeGameProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setIsGameOver(false);
    setScore(0);
    onScoreChange(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood, score, onScoreChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (isGameOver) resetGame();
          else setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, isGameOver, moveSnake]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      onHighScoreChange(score);
    }
  }, [score, highScore, onHighScoreChange]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div 
        className="relative bg-black overflow-hidden"
        style={{ 
          width: GRID_SIZE * 22, 
          height: GRID_SIZE * 22,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
          gap: '2px',
          padding: '2px'
        }}
      >
        {/* Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <div key={i} className="w-5 h-5 bg-white/[0.02]" />
        ))}

        {/* Snake */}
        {snake.map((segment, i) => (
          <motion.div
            key={`${i}-${segment.x}-${segment.y}`}
            initial={false}
            animate={{ x: segment.x * 22, y: segment.y * 22 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute w-5 h-5 p-[1px]"
          >
            <div className={`w-full h-full rounded-[4px] ${i === 0 ? 'bg-accent-cyan shadow-[0_0_15px_#00f3ff]' : 'bg-accent-cyan/80 shadow-[0_0_10px_#00f3ff]'}`} />
          </motion.div>
        ))}

        {/* Food */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute w-5 h-5 p-[2px]"
          style={{ left: food.x * 22, top: food.y * 22 }}
        >
          <div className="w-full h-full rounded-full bg-accent-pink shadow-[0_0_20px_#ff00ff]" />
        </motion.div>

        {/* Overlays */}
        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              {isGameOver ? (
                <>
                  <h2 className="text-accent-pink font-display text-4xl font-black mb-4 tracking-tighter uppercase italic">Game Over</h2>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-pink text-white rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_#ff00ff]"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-accent-cyan font-display text-4xl font-black mb-4 tracking-tighter uppercase italic">Paused</h2>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-cyan text-black rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_#00f3ff]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Resume
                  </button>
                  <p className="mt-4 text-accent-cyan/50 text-xs font-mono uppercase tracking-widest">Press Space to Start</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-4 text-[10px] font-mono text-accent-cyan/40 uppercase tracking-[0.2em]">
        <span>Arrows to Move</span>
        <span>•</span>
        <span>Space to Pause</span>
      </div>
    </div>
  );
}
