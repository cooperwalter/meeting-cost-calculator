"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertCircle, Coffee, Smartphone, Plane } from "lucide-react";

interface CostVisualizerProps {
  cost: number;
  projectedCost: number;
  rate: number;
  elapsedSeconds: number;
  isRunning: boolean;
}

const REALITY_CHECKS = [
  { threshold: 10, text: "A nice lunch", icon: Coffee },
  { threshold: 50, text: "Team dinner", icon: Coffee },
  { threshold: 100, text: "New mechanical keyboard", icon: Smartphone },
  { threshold: 500, text: "Round trip flight to Europe", icon: Plane },
  { threshold: 1000, text: "High-end laptop", icon: Smartphone },
  { threshold: 5000, text: "Used car", icon: AlertCircle },
];

export default function CostVisualizer({ cost, projectedCost, rate, elapsedSeconds, isRunning }: CostVisualizerProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

  const formattedCost = formatCurrency(cost);
  const formattedProjected = formatCurrency(projectedCost);

  const getCostColor = (c: number) => {
    if (c < 100) return "text-green-400";
    if (c < 500) return "text-yellow-400";
    if (c < 1000) return "text-orange-400";
    return "text-red-500 animate-pulse-glow";
  };

  const realityCheck = useMemo(() => {
    return [...REALITY_CHECKS].reverse().find((check) => cost >= check.threshold);
  }, [cost]);

  const Icon = realityCheck?.icon || TrendingUp;

  return (
    <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
      
      <motion.div
        key={Math.floor(cost / 10)} // Animate slightly on significant changes
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="z-10 flex flex-col items-center"
      >
        <span className="text-white/40 text-sm uppercase tracking-widest mb-4">
          Total Meeting Cost
        </span>
        
        <div className="flex flex-wrap md:flex-nowrap items-baseline justify-center gap-2 md:gap-4 mb-2 tabular-nums transition-colors duration-500 w-full">
          <span className={`text-4xl md:text-6xl font-bold tracking-tighter ${getCostColor(cost)}`}>
            {formattedCost}
          </span>
          <span className="text-4xl md:text-6xl font-bold text-white/20 tracking-tighter">
            /
          </span>
          <span className="text-4xl md:text-6xl font-bold text-white/20 tracking-tighter">
            {formattedProjected}
          </span>
        </div>
        
        <div className="text-white/40 text-sm mb-12">
          Burning <span className="text-white font-mono">${(rate / 60).toFixed(2)}</span> per minute
        </div>

        <AnimatePresence mode="wait">
          {realityCheck && (
            <motion.div
              key={realityCheck.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs w-full backdrop-blur-md"
            >
              <div className="flex items-center justify-center gap-2 text-white/80 mb-1">
                <Icon size={16} className="text-purple-400" />
                <span className="font-medium">Equivalent to</span>
              </div>
              <div className="text-white font-semibold text-lg">
                {realityCheck.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background visualizer effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          // Use a deterministic random value based on index for consistent server/client rendering
          // or useMemo if we want it random but stable per session. 
          // Since this is a visual effect, stable random is fine.
          // However, to avoid hydration mismatch, we should use a seed or just useMemo on the client.
          // But useMemo won't help with hydration mismatch if the initial render differs.
          // Let's use a pseudo-random based on index to be safe and simple.
          const height = 20 + ((i * 1337) % 100); 
          
          return (
            <motion.div
              key={i}
              className="w-2 bg-white rounded-t-full"
              animate={
                isRunning
                  ? {
                      height: [20, height, 20],
                      opacity: [0.2, 0.5, 0.2],
                    }
                  : {
                      height: 20,
                      opacity: 0.2,
                    }
              }
              transition={{
                duration: 2,
                repeat: isRunning ? Infinity : 0,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
