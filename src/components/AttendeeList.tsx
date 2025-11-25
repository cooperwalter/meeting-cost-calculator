"use client";

import { useState } from "react";
import { Plus, Trash2, User, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Attendee {
  id: string;
  name: string;
  rate: number | string;
}

interface AttendeeListProps {
  attendees: Attendee[];
  onAdd: (attendee: Attendee) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Attendee>) => void;
}

export default function AttendeeList({
  attendees,
  onAdd,
  onRemove,
  onUpdate,
}: AttendeeListProps) {
  const [newRate, setNewRate] = useState(50);

  const handleAdd = () => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: `Attendee ${attendees.length + 1}`,
      rate: newRate,
    });
  };

  const formatNumber = (value: number | string): string => {
    if (value === "") return "";
    // If it's a string (user typing), return as is
    if (typeof value === "string") return value;
    
    // If it's a number, format it
    // Check if it has decimals
    const hasDecimals = value % 1 !== 0;
    return new Intl.NumberFormat("en-US", { 
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2 
    }).format(value);
  };

  const parseNumber = (value: string): number | string => {
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");
    
    // Allow empty string
    if (cleanValue === "") return "";

    // Allow "12." or "12.5" to be returned as string to preserve typing
    if (cleanValue.endsWith(".") || (cleanValue.includes(".") && cleanValue.split(".")[1].length < 2)) {
      return cleanValue;
    }

    // If it has more than 2 decimal places, truncate/round
    if (cleanValue.includes(".")) {
      const parts = cleanValue.split(".");
      if (parts[1].length > 2) {
        return parseFloat(parseFloat(cleanValue).toFixed(2));
      }
    }

    // Otherwise try to parse as number, but if it fails (shouldn't given regex), return string
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? cleanValue : parsed;
  };

  // Helper to safely get numeric value for calculations
  const getNumericRate = (rate: number | string): number => {
    if (typeof rate === "number") return rate;
    if (rate === "") return 0;
    const parsed = parseFloat(rate);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Attendees ({attendees.length})
        </h3>
        <button
          onClick={handleAdd}
          className="glass-button p-2 rounded-full hover:bg-white/10 text-white/80"
          aria-label="Add attendee"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {attendees.map((attendee) => (
            <motion.div
              key={attendee.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-3 rounded-xl flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <User size={14} />
              </div>
              
              <div className="flex-1 flex flex-col">
                <input
                  type="text"
                  value={attendee.name}
                  onChange={(e) => onUpdate(attendee.id, { name: e.target.value })}
                  className="bg-transparent border-none text-sm font-medium text-white focus:outline-none p-0 placeholder-white/30"
                  placeholder="Name"
                />
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <DollarSign size={10} />
                    <input
                      type="text"
                      value={formatNumber(attendee.rate)}
                      onChange={(e) => {
                        // Allow typing decimals by keeping as string if needed
                        let val = e.target.value;
                        // Remove non-numeric/decimal chars
                        val = val.replace(/[^0-9.]/g, "");
                        
                        // Prevent multiple decimals
                        const parts = val.split(".");
                        if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
                        
                        // Limit to 2 decimal places
                        if (parts.length === 2 && parts[1].length > 2) {
                            val = parts[0] + "." + parts[1].substring(0, 2);
                        }

                        // If it ends with dot or is empty, keep as string
                        if (val === "" || val.endsWith(".")) {
                            onUpdate(attendee.id, { rate: val });
                        } else {
                            // Try to parse, but if it's like "10.5", keep as string or number?
                            // If we parse "10.5" to 10.5, formatNumber(10.5) -> "10.50".
                            // This might be annoying while typing "10.5".
                            // So let's keep as string until blur? 
                            // Or just keep as string if it has a decimal point?
                            // Let's try keeping as string if it matches our criteria for "in progress" typing
                            onUpdate(attendee.id, { rate: val });
                        }
                      }}
                      onBlur={() => {
                        // On blur, convert to number to format nicely (e.g. 10.5 -> 10.50)
                        const num = getNumericRate(attendee.rate);
                        onUpdate(attendee.id, { rate: num });
                      }}
                      className="bg-transparent border-none w-16 focus:outline-none p-0 text-white/60"
                      placeholder="0"
                    />
                    /hr
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1">
                    <DollarSign size={10} />
                    <input
                      type="text"
                      value={attendee.rate === "" ? "" : formatNumber(typeof attendee.rate === "number" ? Math.round(attendee.rate * 2000) : Math.round(getNumericRate(attendee.rate) * 2000))}
                      onChange={(e) => {
                        const val = parseNumber(e.target.value);
                        if (val === "") {
                          onUpdate(attendee.id, { rate: "" });
                        } else {
                           // For yearly, we probably don't need decimal precision in the input?
                           // Usually yearly salary is integer.
                           // Let's keep it simple for now.
                           if (typeof val === "number") {
                               onUpdate(attendee.id, { rate: val / 2000 });
                           }
                        }
                      }}
                      className="bg-transparent border-none w-20 focus:outline-none p-0 text-white/60"
                      placeholder="0"
                    />
                    /yr
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemove(attendee.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/20 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
