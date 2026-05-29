'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Clock, AlertTriangle, Coins, Sparkles } from 'lucide-react';
import PacmanWinModal from './PacmanWinModal';
import PacmanLoseModal from './PacmanLoseModal';

type Difficulty = 'easy' | 'medium' | 'hard';
type Direction = 'up' | 'down' | 'left' | 'right';

interface PacmanGameProps {
  difficulty: Difficulty;
  ghostCount: number;
  ghostSpeed: number;
  pacmanSpeed: number;
  timeLimit: number;
  coins: number;
  xp: number;
  onBack: () => void;
  userId?: string;
  userName?: string;
  playsRemaining: number;
  canEarnRewards?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  id: number;
  position: Position;
  direction: Direction;
  color: string;
  isScared: boolean;
}

// Single maze (11x17) - Used for all difficulties
const MAZE = [
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,3,1,1,1,0,1,1,1,3,0],
  [0,1,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,0,0,0,1,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,0,4,0,1,0,0,0],
  [2,2,0,1,4,4,4,1,0,2,2],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,0,0,0,1,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,0,0,0,1,0,1,0],
  [0,3,1,1,1,0,1,1,1,3,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];

const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];
const CELL_SIZE = 24;
const POWER_MODE_DURATION: Record<Difficulty, number> = { easy: 8000, medium: 7000, hard: 6000 };

export default function PacmanGame({
  difficulty,
  ghostCount,
  ghostSpeed,
  pacmanSpeed,
  timeLimit,
  coins,
  xp,
  onBack,
  userId,
  userName,
  playsRemaining,
  canEarnRewards = true,
}: PacmanGameProps) {
  const getStartPosition = (): Position => {
    return { x: 5, y: 13 }; // Same for all difficulties
  };

  const getGhostPositions = (): Position[] => {
    return [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 6 }];
  };

  const [maze, setMaze] = useState<number[][]>([]);
  const [pacman, setPacman] = useState<Position>(getStartPosition());
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [score, setScore] = useState(0);
  const [dotsRemaining, setDotsRemaining] = useState(0);
  const [totalDots, setTotalDots] = useState(0);
  const [ghostsEaten, setGhostsEaten] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const [isMoving, setIsMoving] = useState(false);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>('right');
  const nextDirectionRef = useRef<Direction | null>(null);
  const pacmanRef = useRef<Position>(getStartPosition());
  const ghostsRef = useRef<Ghost[]>([]);
  const mazeRef = useRef<number[][]>([]);
  const gameStateRef = useRef({ isWon: false, isLost: false });

  // Initialize game
  useEffect(() => {
    const newMaze = MAZE.map(row => [...row]);
    setMaze(newMaze);
    mazeRef.current = newMaze;
    
    let dots = 0;
    newMaze.forEach(row => {
      row.forEach(cell => {
        if (cell === 1 || cell === 3) dots++;
      });
    });
    setDotsRemaining(dots);
    setTotalDots(dots);
    
    // Initialize ghosts
    const initialGhosts: Ghost[] = [];
    const ghostPositions = getGhostPositions();
    for (let i = 0; i < ghostCount; i++) {
      initialGhosts.push({
        id: i,
        position: { ...ghostPositions[i % ghostPositions.length] },
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Direction,
        color: GHOST_COLORS[i % GHOST_COLORS.length],
        isScared: false,
      });
    }
    setGhosts(initialGhosts);
    ghostsRef.current = initialGhosts;
  }, [ghostCount]);

  // Keep refs in sync with state
  useEffect(() => {
    pacmanRef.current = pacman;
  }, [pacman]);

  useEffect(() => {
    ghostsRef.current = ghosts;
  }, [ghosts]);

  useEffect(() => {
    mazeRef.current = maze;
  }, [maze]);

  useEffect(() => {
    gameStateRef.current = { isWon, isLost };
  }, [isWon, isLost]);

  // Calculate responsive cell size based on screen width
  useEffect(() => {
    const calculateCellSize = () => {
      if (!boardContainerRef.current || maze.length === 0) return;
      
      const containerWidth = boardContainerRef.current.clientWidth;
      const containerHeight = boardContainerRef.current.clientHeight;
      const mazeWidth = maze[0]?.length || 15;
      const mazeHeight = maze.length || 15;
      
      // Calculate max cell size that fits in container with some padding
      const maxCellWidth = Math.floor((containerWidth - 16) / mazeWidth);
      const maxCellHeight = Math.floor((containerHeight - 16) / mazeHeight);
      const newCellSize = Math.min(maxCellWidth, maxCellHeight, 28); // Cap at 28px max
      
      setCellSize(Math.max(newCellSize, 16)); // Min 16px
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [maze]);

  // Timer
  useEffect(() => {
    if (isWon || isLost) return;
    if (timeRemaining <= 0) {
      setIsLost(true);
      setTimeout(() => setShowLoseModal(true), 500);
      return;
    }
    const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining, isWon, isLost]);

  // Pacman mouth animation
  useEffect(() => {
    const interval = setInterval(() => setMouthOpen(prev => !prev), 150);
    return () => clearInterval(interval);
  }, []);

  // Check win condition
  useEffect(() => {
    if (dotsRemaining === 0 && maze.length > 0 && !isWon && !isLost) {
      setIsWon(true);
      setTimeout(() => setShowWinModal(true), 500);
    }
  }, [dotsRemaining, maze, isWon, isLost]);

  // Check collision with ghosts
  useEffect(() => {
    if (isWon || isLost) return;
    
    const ghostHousePos = getGhostPositions()[0]; // Use first ghost position as reset point
    
    ghosts.forEach(ghost => {
      if (ghost.position.x === pacman.x && ghost.position.y === pacman.y) {
        if (isPowerMode && ghost.isScared) {
          // Eat ghost - reset to ghost house
          setGhosts(prev => prev.map(g => 
            g.id === ghost.id 
              ? { ...g, position: { ...ghostHousePos }, isScared: false }
              : g
          ));
          setScore(prev => prev + 200);
          setGhostsEaten(prev => prev + 1);
        } else if (!ghost.isScared) {
          setIsLost(true);
          setTimeout(() => setShowLoseModal(true), 500);
        }
      }
    });
  }, [pacman, ghosts, isPowerMode, isWon, isLost]);

  const canMove = useCallback((pos: Position, dir: Direction): boolean => {
    let newX = pos.x;
    let newY = pos.y;
    
    switch (dir) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // Tunnel wrap
    if (newX < 0) newX = maze[0].length - 1;
    if (newX >= maze[0].length) newX = 0;
    
    if (newY < 0 || newY >= maze.length) return false;
    return maze[newY]?.[newX] !== 0;
  }, [maze]);

  // Single step movement function for mobile buttons
  const moveOneStep = useCallback((direction: Direction) => {
    if (isWon || isLost || maze.length === 0) return;
    if (!canMove(pacman, direction)) return;
    
    setPacmanDirection(direction);
    
    let newX = pacman.x;
    let newY = pacman.y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // Tunnel wrap
    if (newX < 0) newX = maze[0].length - 1;
    if (newX >= maze[0].length) newX = 0;
    
    setPacman({ x: newX, y: newY });
    
    // Eat dot
    const cell = maze[newY][newX];
    if (cell === 1) {
      setMaze(prev => {
        const newMaze = prev.map(row => [...row]);
        newMaze[newY][newX] = 2;
        return newMaze;
      });
      setScore(prev => prev + 10);
      setDotsRemaining(prev => prev - 1);
    } else if (cell === 3) {
      // Power pellet
      setMaze(prev => {
        const newMaze = prev.map(row => [...row]);
        newMaze[newY][newX] = 2;
        return newMaze;
      });
      setScore(prev => prev + 50);
      setDotsRemaining(prev => prev - 1);
      setIsPowerMode(true);
      setGhosts(prev => prev.map(g => ({ ...g, isScared: true })));
      // Clear any existing power mode timeout before setting a new one
      if (powerModeTimeoutRef.current) {
        clearTimeout(powerModeTimeoutRef.current);
      }
      powerModeTimeoutRef.current = setTimeout(() => {
        setIsPowerMode(false);
        setGhosts(prev => prev.map(g => ({ ...g, isScared: false })));
        powerModeTimeoutRef.current = null;
      }, POWER_MODE_DURATION[difficulty]);
    }
  }, [pacman, maze, canMove, isWon, isLost, difficulty]);

  // Continuous Pacman movement loop (classic arcade style)
  useEffect(() => {
    if (!isMoving || isWon || isLost || maze.length === 0) {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
      return;
    }

    const movePacmanStep = () => {
      if (gameStateRef.current.isWon || gameStateRef.current.isLost) return;
      
      const currentMaze = mazeRef.current;
      const currentPos = pacmanRef.current;
      const currentDir = directionRef.current;
      const nextDir = nextDirectionRef.current;
      
      // Check if we can turn to the queued direction
      let moveDir = currentDir;
      if (nextDir) {
        let testX = currentPos.x;
        let testY = currentPos.y;
        switch (nextDir) {
          case 'up': testY--; break;
          case 'down': testY++; break;
          case 'left': testX--; break;
          case 'right': testX++; break;
        }
        if (testX < 0) testX = currentMaze[0].length - 1;
        if (testX >= currentMaze[0].length) testX = 0;
        if (testY >= 0 && testY < currentMaze.length && currentMaze[testY]?.[testX] !== 0) {
          moveDir = nextDir;
          directionRef.current = nextDir;
          nextDirectionRef.current = null;
          setPacmanDirection(nextDir);
        }
      }
      
      // Calculate new position
      let newX = currentPos.x;
      let newY = currentPos.y;
      switch (moveDir) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
      }
      
      // Tunnel wrap
      if (newX < 0) newX = currentMaze[0].length - 1;
      if (newX >= currentMaze[0].length) newX = 0;
      
      // Check if can move
      if (newY < 0 || newY >= currentMaze.length || currentMaze[newY]?.[newX] === 0) {
        return; // Hit a wall, stop but keep trying
      }
      
      // Move Pacman
      setPacman({ x: newX, y: newY });
      
      // Eat dot or power pellet
      const cell = currentMaze[newY][newX];
      if (cell === 1) {
        setMaze(prev => {
          const newMaze = prev.map(row => [...row]);
          newMaze[newY][newX] = 2;
          return newMaze;
        });
        setScore(prev => prev + 10);
        setDotsRemaining(prev => prev - 1);
      } else if (cell === 3) {
        setMaze(prev => {
          const newMaze = prev.map(row => [...row]);
          newMaze[newY][newX] = 2;
          return newMaze;
        });
        setScore(prev => prev + 50);
        setDotsRemaining(prev => prev - 1);
        setIsPowerMode(true);
        setGhosts(prev => prev.map(g => ({ ...g, isScared: true })));
        if (powerModeTimeoutRef.current) {
          clearTimeout(powerModeTimeoutRef.current);
        }
        powerModeTimeoutRef.current = setTimeout(() => {
          setIsPowerMode(false);
          setGhosts(prev => prev.map(g => ({ ...g, isScared: false })));
          powerModeTimeoutRef.current = null;
        }, POWER_MODE_DURATION[difficulty]);
      }
    };
    
    movementIntervalRef.current = setInterval(movePacmanStep, pacmanSpeed);
    
    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, [isMoving, isWon, isLost, maze.length, pacmanSpeed, difficulty]);

  // Button press handlers for mobile - classic Pacman style
  const handleDirectionPress = (direction: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isWon || isLost) return;
    
    // Start moving if not already
    if (!isMoving) {
      directionRef.current = direction;
      setPacmanDirection(direction);
      setIsMoving(true);
    } else {
      // Queue the direction change
      nextDirectionRef.current = direction;
    }
  };

  const movePacman = useCallback(() => {
    if (isWon || isLost || maze.length === 0) return;
    
    let direction = pacmanDirection;
    if (nextDirection && canMove(pacman, nextDirection)) {
      direction = nextDirection;
      setPacmanDirection(nextDirection);
      setNextDirection(null);
    }
    
    if (!canMove(pacman, direction)) return;
    
    let newX = pacman.x;
    let newY = pacman.y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // Tunnel wrap
    if (newX < 0) newX = maze[0].length - 1;
    if (newX >= maze[0].length) newX = 0;
    
    setPacman({ x: newX, y: newY });
    
    // Eat dot
    const cell = maze[newY][newX];
    if (cell === 1) {
      setMaze(prev => {
        const newMaze = prev.map(row => [...row]);
        newMaze[newY][newX] = 2;
        return newMaze;
      });
      setScore(prev => prev + 10);
      setDotsRemaining(prev => prev - 1);
    } else if (cell === 3) {
      // Power pellet
      setMaze(prev => {
        const newMaze = prev.map(row => [...row]);
        newMaze[newY][newX] = 2;
        return newMaze;
      });
      setScore(prev => prev + 50);
      setDotsRemaining(prev => prev - 1);
      setIsPowerMode(true);
      setGhosts(prev => prev.map(g => ({ ...g, isScared: true })));
      // Clear any existing power mode timeout before setting a new one
      if (powerModeTimeoutRef.current) {
        clearTimeout(powerModeTimeoutRef.current);
      }
      powerModeTimeoutRef.current = setTimeout(() => {
        setIsPowerMode(false);
        setGhosts(prev => prev.map(g => ({ ...g, isScared: false })));
        powerModeTimeoutRef.current = null;
      }, POWER_MODE_DURATION[difficulty]);
    }
  }, [pacman, pacmanDirection, nextDirection, maze, canMove, isWon, isLost, difficulty]);

  // Ghost movement loop - completely isolated from React state updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    const moveGhosts = () => {
      // Check game state from ref
      if (gameStateRef.current.isWon || gameStateRef.current.isLost) return;
      
      const currentMaze = mazeRef.current;
      if (currentMaze.length === 0) return;
      
      const currentPacman = pacmanRef.current;
      
      setGhosts(prev => {
        const newGhosts = prev.map(ghost => {
          const directions: Direction[] = ['up', 'down', 'left', 'right'];
          const validDirs = directions.filter(dir => {
            let newX = ghost.position.x;
            let newY = ghost.position.y;
            switch (dir) {
              case 'up': newY--; break;
              case 'down': newY++; break;
              case 'left': newX--; break;
              case 'right': newX++; break;
            }
            if (newX < 0) newX = currentMaze[0].length - 1;
            if (newX >= currentMaze[0].length) newX = 0;
            if (newY < 0 || newY >= currentMaze.length) return false;
            return currentMaze[newY]?.[newX] !== 0;
          });
          
          if (validDirs.length === 0) return ghost;
          
          // Simple AI: prefer direction towards/away from pacman
          let chosenDir = ghost.direction;
          if (validDirs.includes(ghost.direction) && Math.random() > 0.3) {
            chosenDir = ghost.direction;
          } else {
            // Chase or flee based on scared state
            const dx = currentPacman.x - ghost.position.x;
            const dy = currentPacman.y - ghost.position.y;
            
            let preferredDirs: Direction[] = [];
            if (ghost.isScared) {
              // Run away
              if (dx > 0) preferredDirs.push('left');
              if (dx < 0) preferredDirs.push('right');
              if (dy > 0) preferredDirs.push('up');
              if (dy < 0) preferredDirs.push('down');
            } else {
              // Chase
              if (dx > 0) preferredDirs.push('right');
              if (dx < 0) preferredDirs.push('left');
              if (dy > 0) preferredDirs.push('down');
              if (dy < 0) preferredDirs.push('up');
            }
            
            const validPreferred = preferredDirs.filter(d => validDirs.includes(d));
            if (validPreferred.length > 0 && Math.random() > 0.4) {
              chosenDir = validPreferred[Math.floor(Math.random() * validPreferred.length)];
            } else {
              chosenDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
          }
          
          let newX = ghost.position.x;
          let newY = ghost.position.y;
          switch (chosenDir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
          }
          if (newX < 0) newX = currentMaze[0].length - 1;
          if (newX >= currentMaze[0].length) newX = 0;
          
          return { ...ghost, position: { x: newX, y: newY }, direction: chosenDir };
        });
        return newGhosts;
      });
    };
    
    // Start the interval immediately
    intervalId = setInterval(moveGhosts, ghostSpeed);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ghostSpeed]); // Only depends on ghostSpeed which doesn't change during gameplay

  // Keyboard controls (desktop) - classic Pacman style
  useEffect(() => {
    const getDirectionFromKey = (key: string): Direction | null => {
      switch (key) {
        case 'ArrowUp': case 'w': case 'W': return 'up';
        case 'ArrowDown': case 's': case 'S': return 'down';
        case 'ArrowLeft': case 'a': case 'A': return 'left';
        case 'ArrowRight': case 'd': case 'D': return 'right';
        default: return null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isLost) return;
      const direction = getDirectionFromKey(e.key);
      if (direction) {
        e.preventDefault();
        
        // Start moving if not already
        if (!isMoving) {
          directionRef.current = direction;
          setPacmanDirection(direction);
          setIsMoving(true);
        } else {
          // Queue the direction change
          nextDirectionRef.current = direction;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWon, isLost, isMoving]);

  const handleRestart = () => {
    // Clear any existing power mode timeout
    if (powerModeTimeoutRef.current) {
      clearTimeout(powerModeTimeoutRef.current);
      powerModeTimeoutRef.current = null;
    }
    
    const newMaze = MAZE.map(row => [...row]);
    setMaze(newMaze);
    mazeRef.current = newMaze;
    
    const startPos = getStartPosition();
    setPacman(startPos);
    pacmanRef.current = startPos;
    
    setPacmanDirection('right');
    setNextDirection(null);
    setScore(0);
    setTimeRemaining(timeLimit);
    setIsWon(false);
    setIsLost(false);
    gameStateRef.current = { isWon: false, isLost: false };
    setShowWinModal(false);
    setShowLoseModal(false);
    setIsPowerMode(false);
    setGhostsEaten(0);
    setIsMoving(false);
    directionRef.current = 'right';
    nextDirectionRef.current = null;
    
    let dots = 0;
    newMaze.forEach(row => row.forEach(cell => { if (cell === 1 || cell === 3) dots++; }));
    setDotsRemaining(dots);
    setTotalDots(dots);
    
    const ghostPositions = getGhostPositions();
    const newGhosts = Array.from({ length: ghostCount }, (_, i) => ({
      id: i,
      position: { ...ghostPositions[i % ghostPositions.length] },
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Direction,
      color: GHOST_COLORS[i % GHOST_COLORS.length],
      isScared: false,
    }));
    setGhosts(newGhosts);
    ghostsRef.current = newGhosts;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[difficulty];
  const difficultyBg = { easy: 'from-green-500 to-emerald-600', medium: 'from-yellow-500 to-orange-600', hard: 'from-red-500 to-pink-600' }[difficulty];
  const isLowTime = timeRemaining <= 15;

  const getPacmanRotation = () => {
    switch (pacmanDirection) {
      case 'up': return 'rotate-[-90deg]';
      case 'down': return 'rotate-90';
      case 'left': return 'scale-x-[-1]';
      default: return '';
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <main 
        ref={gameRef}
        className="lg:hidden h-[100dvh] flex flex-col items-center px-2 py-2 overflow-hidden"
      >
        <div className="w-full flex flex-col h-full">
          {/* Compact Header */}
          <header className="flex items-center justify-between w-full mb-1 flex-shrink-0 px-1">
            <button onClick={onBack} className="text-white/70 p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={18} />
            </button>
            <div className="text-center">
              <h1 className="text-sm font-bold text-white">Pac-Man</h1>
              <span className={`text-[10px] font-medium ${difficultyColor}`}>{difficultyLabel}</span>
            </div>
            <button onClick={handleRestart} className="text-white/70 p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={18} />
            </button>
          </header>

          {/* Compact Stats Row */}
          <div className="flex items-center justify-center gap-1.5 mb-1 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-yellow-400 font-bold text-xs">{score}</span>
              <span className="text-white/50 text-[10px]">pts</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/60 text-[10px]">Dots:</span>
              <span className="text-white font-medium text-xs">{dotsRemaining}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isLowTime ? 'bg-red-500/20 border-red-500/30 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              {isLowTime ? <AlertTriangle size={12} className="text-red-400" /> : <Clock size={12} className="text-yellow-400" />}
              <span className={`font-bold text-xs ${isLowTime ? 'text-red-400' : 'text-white'}`}>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Game Board Container */}
          <div 
            ref={boardContainerRef}
            className="flex-1 flex items-center justify-center min-h-0 w-full p-1"
          >
            <div 
              className="relative bg-[#000033] rounded-lg border-2 border-blue-500/50 overflow-hidden"
              style={{ 
                width: maze[0]?.length * cellSize || 300,
                height: maze.length * cellSize || 300,
              }}
            >
              {/* Maze */}
              {maze.map((row, y) => (
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="absolute"
                    style={{
                      left: x * cellSize,
                      top: y * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  >
                    {cell === 0 && (
                      <div className="w-full h-full bg-blue-900 border-[0.5px] border-blue-700/50" />
                    )}
                    {cell === 1 && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div 
                          className="rounded-full bg-yellow-200" 
                          style={{ width: Math.max(cellSize * 0.15, 3), height: Math.max(cellSize * 0.15, 3) }}
                        />
                      </div>
                    )}
                    {cell === 3 && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div 
                          className="rounded-full bg-yellow-200 animate-pulse" 
                          style={{ width: Math.max(cellSize * 0.35, 6), height: Math.max(cellSize * 0.35, 6) }}
                        />
                      </div>
                    )}
                  </div>
                ))
              ))}

              {/* Pacman */}
              <div
                className={`absolute transition-all duration-75 ${getPacmanRotation()}`}
                style={{
                  left: pacman.x * cellSize + cellSize * 0.1,
                  top: pacman.y * cellSize + cellSize * 0.1,
                  width: cellSize * 0.8,
                  height: cellSize * 0.8,
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#FFFF00" />
                  {mouthOpen && (
                    <path d="M50 50 L95 20 L95 80 Z" fill="#000033" />
                  )}
                  <circle cx="50" cy="25" r="6" fill="#000" />
                </svg>
              </div>

              {/* Ghosts */}
              {ghosts.map(ghost => (
                <div
                  key={ghost.id}
                  className="absolute transition-all duration-75"
                  style={{
                    left: ghost.position.x * cellSize + cellSize * 0.1,
                    top: ghost.position.y * cellSize + cellSize * 0.1,
                    width: cellSize * 0.8,
                    height: cellSize * 0.8,
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M10 95 L10 45 Q10 5 50 5 Q90 5 90 45 L90 95 L75 80 L60 95 L50 80 L40 95 L25 80 Z"
                      fill={ghost.isScared ? '#0000FF' : ghost.color}
                      className={ghost.isScared ? 'animate-pulse' : ''}
                    />
                    <circle cx="35" cy="40" r="10" fill="white" />
                    <circle cx="65" cy="40" r="10" fill="white" />
                    <circle cx="38" cy="42" r="5" fill={ghost.isScared ? 'white' : 'blue'} />
                    <circle cx="68" cy="42" r="5" fill={ghost.isScared ? 'white' : 'blue'} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Controls for Mobile */}
          <div className="flex-shrink-0 py-2">
            <div className="flex flex-col items-center gap-1">
              {/* Up Arrow */}
              <button
                onTouchStart={(e) => handleDirectionPress('up', e)}
                onClick={(e) => handleDirectionPress('up', e)}
                disabled={isWon || isLost}
                className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center active:bg-white/20 active:scale-95 transition-all disabled:opacity-50 select-none touch-none"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white pointer-events-none">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
              
              {/* Left, Down, Right Row */}
              <div className="flex items-center gap-1">
                <button
                  onTouchStart={(e) => handleDirectionPress('left', e)}
                  onClick={(e) => handleDirectionPress('left', e)}
                  disabled={isWon || isLost}
                  className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center active:bg-white/20 active:scale-95 transition-all disabled:opacity-50 select-none touch-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white pointer-events-none">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  onTouchStart={(e) => handleDirectionPress('down', e)}
                  onClick={(e) => handleDirectionPress('down', e)}
                  disabled={isWon || isLost}
                  className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center active:bg-white/20 active:scale-95 transition-all disabled:opacity-50 select-none touch-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white pointer-events-none">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </button>
                <button
                  onTouchStart={(e) => handleDirectionPress('right', e)}
                  onClick={(e) => handleDirectionPress('right', e)}
                  disabled={isWon || isLost}
                  className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center active:bg-white/20 active:scale-95 transition-all disabled:opacity-50 select-none touch-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white pointer-events-none">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="flex items-center justify-center gap-3 flex-shrink-0 pb-1">
            <div className="flex items-center gap-1 text-white/50 text-[10px]">
              <Coins size={10} className="text-yellow-400" />
              <span>+{coins}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50 text-[10px]">
              <Sparkles size={10} className="text-cyan-400" />
              <span>+{xp} XP</span>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Layout */}
      <main className="hidden lg:flex min-h-screen flex-col items-center px-8 py-6">
        <div className="w-full max-w-6xl flex flex-col">
          <header className="flex items-center justify-between w-full mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${difficultyBg} flex items-center justify-center`}>
                <span className="text-xl">🟡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pac-Man</h1>
                <span className={`text-sm font-medium ${difficultyColor}`}>{difficultyLabel} Mode</span>
              </div>
            </div>
            <button onClick={handleRestart} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={20} />
              <span>Restart</span>
            </button>
          </header>

          <div className="flex gap-8">
            {/* Left Side - Stats Panel */}
            <div className="w-[280px] flex-shrink-0 space-y-4">
              <div className={`p-6 rounded-2xl border ${isLowTime ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {isLowTime ? <AlertTriangle size={24} className="text-red-400" /> : <Clock size={24} className="text-yellow-400" />}
                  <span className="text-white/60">Time Remaining</span>
                </div>
                <p className={`text-5xl font-bold ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>

              {isPowerMode && (
                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-center">
                  <p className="text-blue-400 font-bold text-lg animate-pulse">⚡ POWER MODE ⚡</p>
                  <p className="text-blue-300 text-sm">Eat the ghosts!</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{score}</p>
                  <p className="text-white/50 text-sm">Score</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-white">{dotsRemaining}</p>
                  <p className="text-white/50 text-sm">Dots Left</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <p className="text-white/60 text-sm mb-3">Win Rewards</p>
                <div className="flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <Coins size={20} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">+{coins}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-cyan-400" />
                    <span className="text-cyan-400 font-bold text-lg">+{xp} XP</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Controls</p>
                <p className="text-white text-sm">Arrow keys or WASD to move</p>
              </div>
            </div>

            {/* Right Side - Game Board */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="relative bg-[#000033] rounded-xl border-4 border-blue-500/50 overflow-hidden shadow-2xl shadow-blue-500/20"
                style={{ 
                  width: maze[0]?.length * (CELL_SIZE + 4) || 400,
                  height: maze.length * (CELL_SIZE + 4) || 400,
                }}
              >
                {/* Maze */}
                {maze.map((row, y) => (
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="absolute"
                      style={{
                        left: x * (CELL_SIZE + 4),
                        top: y * (CELL_SIZE + 4),
                        width: CELL_SIZE + 4,
                        height: CELL_SIZE + 4,
                      }}
                    >
                      {cell === 0 && (
                        <div className="w-full h-full bg-blue-900 border border-blue-700/50 rounded-sm" />
                      )}
                      {cell === 1 && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-200" />
                        </div>
                      )}
                      {cell === 3 && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))
                ))}

                {/* Pacman */}
                <div
                  className={`absolute transition-all duration-75 ${getPacmanRotation()}`}
                  style={{
                    left: pacman.x * (CELL_SIZE + 4) + 3,
                    top: pacman.y * (CELL_SIZE + 4) + 3,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="#FFFF00" />
                    {mouthOpen && (
                      <path d="M50 50 L95 20 L95 80 Z" fill="#000033" />
                    )}
                    <circle cx="50" cy="25" r="6" fill="#000" />
                  </svg>
                </div>

                {/* Ghosts */}
                {ghosts.map(ghost => (
                  <div
                    key={ghost.id}
                    className="absolute transition-all duration-75"
                    style={{
                      left: ghost.position.x * (CELL_SIZE + 4) + 3,
                      top: ghost.position.y * (CELL_SIZE + 4) + 3,
                      width: CELL_SIZE - 2,
                      height: CELL_SIZE - 2,
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d="M10 95 L10 45 Q10 5 50 5 Q90 5 90 45 L90 95 L75 80 L60 95 L50 80 L40 95 L25 80 Z"
                        fill={ghost.isScared ? '#0000FF' : ghost.color}
                        className={ghost.isScared ? 'animate-pulse' : ''}
                      />
                      <circle cx="35" cy="40" r="10" fill="white" />
                      <circle cx="65" cy="40" r="10" fill="white" />
                      <circle cx="38" cy="42" r="5" fill={ghost.isScared ? 'white' : 'blue'} />
                      <circle cx="68" cy="42" r="5" fill={ghost.isScared ? 'white' : 'blue'} />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PacmanWinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        onPlayAgain={handleRestart}
        onBack={onBack}
        score={score}
        time={timeLimit - timeRemaining}
        dotsEaten={totalDots - dotsRemaining}
        totalDots={totalDots}
        ghostsEaten={ghostsEaten}
        difficulty={difficulty}
        coins={coins}
        xp={xp}
        userId={userId}
        userName={userName}
        canPlayAgain={playsRemaining > 1}
        canEarnRewards={canEarnRewards}
      />

      <PacmanLoseModal
        isOpen={showLoseModal}
        onClose={() => setShowLoseModal(false)}
        onTryAgain={handleRestart}
        onBack={onBack}
        score={score}
        dotsEaten={totalDots - dotsRemaining}
        totalDots={totalDots}
        ghostsEaten={ghostsEaten}
        timeSeconds={timeLimit - timeRemaining}
        difficulty={difficulty}
        userId={userId}
        userName={userName}
        canPlayAgain={playsRemaining > 1}
      />
    </>
  );
}
