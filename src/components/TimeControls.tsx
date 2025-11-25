"use client";

import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TimeControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  elapsedSeconds: number;
  estimatedDuration: number | "";
  setEstimatedDuration: (duration: number | "") => void;
  costPerSecond: number;
}

export default function TimeControls({
  isRunning,
  onToggle,
  onReset,
  elapsedSeconds,
  estimatedDuration,
  setEstimatedDuration,
  costPerSecond,
}: TimeControlsProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const durationValue = estimatedDuration === "" ? 0 : estimatedDuration;
  const progress = durationValue > 0 ? Math.min((elapsedSeconds / (durationValue * 60)) * 100, 100) : 0;
  

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-white/40 uppercase tracking-wider mb-1">
            Elapsed Time
          </span>
          <div className="text-4xl font-mono font-bold text-white tabular-nums">
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isRunning
                ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                : "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
            }`}
          >
            {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button
            onClick={onReset}
            className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white/60 hover:text-white"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Clock size={12} /> Target: 
            <div className="flex items-center">
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setEstimatedDuration("");
                  } else {
                    setEstimatedDuration(parseInt(val));
                  }
                }}
                className="bg-transparent border-none w-8 focus:outline-none p-0 text-white/40 text-xs font-mono text-right"
              />
              m 
            </div>
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <input
          type="range"
          min="5"
          max="240"
          step="5"
          value={durationValue}
          onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer mt-2 accent-purple-500"
        />
      </div>
    </div>
  );
}
