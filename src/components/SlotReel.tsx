import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SlotReelProps {
  items: string[];
  spinning: boolean;
  result: number;
  label: string;
  colorClass: string;
  delay: number;
}

const SlotReel = ({ items, spinning, result, label, colorClass, delay }: SlotReelProps) => {
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      setStopped(false);
      setInternalSpinning(true);
      
      // Rapidly cycle through items
      intervalRef.current = setInterval(() => {
        setDisplayIndex(prev => (prev + 1) % items.length);
      }, 80);

      // Stop after delay
      const timer = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayIndex(result);
        setInternalSpinning(false);
        setStopped(true);
        setTimeout(() => setStopped(false), 500);
      }, delay);

      return () => {
        clearTimeout(timer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [spinning, result, delay, items.length]);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <span className={cn("font-pixel text-[8px] sm:text-[10px] md:text-xs tracking-wider uppercase", colorClass)}>
        {label}
      </span>
      <div className={cn(
        "relative w-[6.5rem] sm:w-36 md:w-44 h-14 sm:h-16 md:h-20 rounded-lg border-2 overflow-hidden",
        "bg-muted/50 backdrop-blur",
        internalSpinning ? "border-neon-green" : stopped ? "border-neon-orange" : "border-border"
      )}>
        <div className="scanlines absolute inset-0" />
        <div className={cn(
          "flex items-center justify-center h-full px-3 transition-all duration-100",
          internalSpinning && "slot-spinning",
          stopped && "slot-stopped"
        )}>
          <span className={cn(
            "text-xs sm:text-sm md:text-base font-bold text-center select-none leading-tight",
            stopped ? colorClass : "text-foreground"
          )}>
            {items[displayIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SlotReel;
