'use client';

import { useEffect, useState } from 'react';
import { XCircle, Clock, Target, RotateCcw, Home } from 'lucide-react';
import { savePuzzleAward, updatePuzzleImageStats } from '@/lib/supabase';

interface PuzzleLoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  moves: number;
  placedCount: number;
  totalPieces: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  userName?: string;
  userId?: string;
  puzzleImageId?: number;
}

export default function PuzzleLoseModal({
  isOpen,
  onClose,
  onPlayAgain,
  onBack,
  moves,
  placedCount,
  totalPieces,
  difficulty,
  gridSize,
  userName,
  userId,
  puzzleImageId,
}: PuzzleLoseModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && !saved && userId) {
      savePuzzleAward({
        userId,
        userName,
        difficulty,
        gridSize,
        moves,
        timeSeconds: 0,
        puzzleImageId,
        isWin: false,
        coinsAwarded: 0,
        xpAwarded: 0,
      });
      
      if (puzzleImageId) {
        updatePuzzleImageStats(puzzleImageId, false);
      }
      
      setSaved(true);
    }
  }, [isOpen, saved, userId, userName, difficulty, gridSize, moves, puzzleImageId]);

  useEffect(() => {
    if (!isOpen) setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-b from-[#1a1030] to-[#0d0620] rounded-3xl p-6 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Time's Up!</h2>
            <p className="text-white/60">You ran out of time</p>
          </div>

          {/* Stats */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex justify-around">
              <div className="text-center">
                <Clock className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-white/60 text-xs">Progress</p>
                <p className="text-white font-bold">{placedCount}/{totalPieces}</p>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-white/60 text-xs">Moves</p>
                <p className="text-white font-bold">{moves}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onPlayAgain}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-4 bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            >
              <Home size={18} />
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
