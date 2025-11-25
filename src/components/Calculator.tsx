"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AttendeeList, { Attendee } from "./AttendeeList";
import TimeControls from "./TimeControls";
import CostVisualizer from "./CostVisualizer";

const DEFAULT_ATTENDEES: Attendee[] = [
  { id: "1", name: "Manager", rate: 80 }, // ~$160k/yr
  { id: "2", name: "Senior Dev", rate: 90 }, // ~$180k/yr
  { id: "3", name: "Junior Dev", rate: 45 }, // ~$90k/yr
];

export default function Calculator() {
  const [attendees, setAttendees] = useState<Attendee[]>(DEFAULT_ATTENDEES);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState<number | "">(60); // minutes
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedAttendees = localStorage.getItem("meeting-cost-attendees");
    const savedDuration = localStorage.getItem("meeting-cost-duration");

    if (savedAttendees) {
      try {
        setAttendees(JSON.parse(savedAttendees));
      } catch (e) {
        console.error("Failed to parse saved attendees", e);
      }
    }

    if (savedDuration) {
      try {
        setEstimatedDuration(JSON.parse(savedDuration));
      } catch (e) {
        console.error("Failed to parse saved duration", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("meeting-cost-attendees", JSON.stringify(attendees));
    }
  }, [attendees, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("meeting-cost-duration", JSON.stringify(estimatedDuration));
    }
  }, [estimatedDuration, isLoaded]);

  // Calculate total cost per second
  const totalHourlyRate = attendees.reduce((sum, a) => {
    const rate = typeof a.rate === "number" ? a.rate : (a.rate === "" ? 0 : parseFloat(a.rate));
    return sum + (isNaN(rate) ? 0 : rate);
  }, 0);
  const costPerSecond = totalHourlyRate / 3600;
  const currentCost = elapsedSeconds * costPerSecond;
  
  // Calculate projected cost
  const durationValue = estimatedDuration === "" ? 0 : estimatedDuration;
  const projectedCost = durationValue * 60 * costPerSecond;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
  }, []);

  const addAttendee = useCallback((attendee: Attendee) => {
    setAttendees((prev) => [...prev, attendee]);
  }, []);

  const removeAttendee = useCallback((id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAttendee = useCallback((id: string, updates: Partial<Attendee>) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col gap-6"
      >
        <h2 className="text-xl font-semibold text-white/80 mb-2">Meeting Controls</h2>
        
        <TimeControls
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
          elapsedSeconds={elapsedSeconds}
          estimatedDuration={estimatedDuration}
          setEstimatedDuration={setEstimatedDuration}
          costPerSecond={costPerSecond}
        />

        <div className="h-px bg-white/10 my-2" />

        <AttendeeList
          attendees={attendees}
          onAdd={addAttendee}
          onRemove={removeAttendee}
          onUpdate={updateAttendee}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-6"
      >
        <CostVisualizer
          cost={currentCost}
          projectedCost={projectedCost}
          rate={totalHourlyRate}
          elapsedSeconds={elapsedSeconds}
          isRunning={isRunning}
        />
      </motion.div>
    </div>
  );
}
