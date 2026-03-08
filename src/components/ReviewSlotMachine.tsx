import { useState, useCallback, useRef } from "react";
import { Copy, Check, RotateCcw, History, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlotReel from "./SlotReel";
import JackpotEffect from "./JackpotEffect";
import { tones, contents, actions, commentMatrix } from "@/data/reviewComments";
import { cn } from "@/lib/utils";
import { playSpinSound, playStopSound, playJackpotSound, playCopySound, playTickSound } from "@/lib/sounds";

// Jackpot: all three reel indices match
const isJackpot = (results: [number, number, number]) =>
  results[0] === results[1] && results[1] === results[2];

interface HistoryEntry {
  tone: string;
  content: string;
  action: string;
  comment: string;
  id: number;
}

const ReviewSlotMachine = () => {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<[number, number, number]>([0, 0, 0]);
  const [hasResult, setHasResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [jackpotActive, setJackpotActive] = useState(false);
  const idCounter = useRef(0);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    const newResults: [number, number, number] = [
      Math.floor(Math.random() * tones.length),
      Math.floor(Math.random() * contents.length),
      Math.floor(Math.random() * actions.length),
    ];
    setResults(newResults);
    setSpinning(true);
    setCopied(false);
    setJackpotActive(false);

    if (soundEnabled) {
      playSpinSound();
      // Tick sounds while spinning
      tickIntervalRef.current = setInterval(() => playTickSound(), 100);
    }

    // Stop sounds at each reel stop
    const reelStops = [800, 1400, 2000];
    reelStops.forEach((delay) => {
      setTimeout(() => {
        if (soundEnabled) playStopSound();
      }, delay);
    });

    setTimeout(() => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      setSpinning(false);
      setHasResult(true);

      const jackpot = isJackpot(newResults);
      if (jackpot) {
        setJackpotActive(true);
        setTimeout(() => setJackpotActive(false), 2000);
      }

      if (soundEnabled) {
        setTimeout(() => playJackpotSound(), 200);
      }

      // Add to history
      const comment = commentMatrix[newResults[0]][newResults[1]][newResults[2]];
      idCounter.current += 1;
      setHistory((prev) => [
        {
          tone: tones[newResults[0]],
          content: contents[newResults[1]],
          action: actions[newResults[2]],
          comment,
          id: idCounter.current,
        },
        ...prev,
      ].slice(0, 3));
    }, 2200);
  }, [spinning, soundEnabled]);

  const comment = commentMatrix[results[0]][results[1]][results[2]];

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (soundEnabled) playCopySound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <JackpotEffect active={jackpotActive} />
      {/* Machine body */}
      <div className="relative w-full rounded-2xl border-2 border-border bg-card p-4 sm:p-6 md:p-8 scanlines">
        {/* Top decoration */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-3 right-3 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Combo counter */}
        <div className="text-center mb-3 sm:mb-4">
          <span className="text-[8px] sm:text-xs text-muted-foreground font-pixel">
            {tones.length} × {contents.length} × {actions.length} = {tones.length * contents.length * actions.length} 조합
          </span>
        </div>

        {/* Reels */}
        <div className="flex justify-center gap-2 sm:gap-4 md:gap-6">
          <SlotReel
            items={tones}
            spinning={spinning}
            result={results[0]}
            label="톤"
            colorClass="text-neon-green"
            delay={800}
          />
          <SlotReel
            items={contents}
            spinning={spinning}
            result={results[1]}
            label="내용"
            colorClass="text-neon-purple"
            delay={1400}
          />
          <SlotReel
            items={actions}
            spinning={spinning}
            result={results[2]}
            label="액션"
            colorClass="text-neon-orange"
            delay={2000}
          />
        </div>

        {/* Spin button */}
        <div className="flex justify-center mt-5 sm:mt-8">
          <Button
            onClick={spin}
            disabled={spinning}
            size="lg"
            className={cn(
              "font-pixel text-xs sm:text-sm px-8 py-6 rounded-xl transition-all duration-300",
              "bg-primary text-primary-foreground",
              "hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.5)]",
              spinning && "animate-pulse-glow"
            )}
          >
            <RotateCcw className={cn("w-5 h-5 mr-2", spinning && "animate-spin")} />
            {spinning ? "돌리는 중..." : "🎰 SPIN!"}
          </Button>
        </div>
      </div>

      {/* Result comment */}
      {hasResult && !spinning && (
        <div className="w-full animate-fade-in">
          <div className="relative rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-2 font-pixel">
                  💬 생성된 리뷰 코멘트
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-foreground">
                  {comment}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(comment)}
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0 border-border hover:border-primary transition-all",
                  copied && "border-primary text-primary"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-primary mt-2 font-pixel animate-fade-in">
                ✅ 복사 완료! 리뷰에 붙여넣기 하세요
              </p>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="w-full animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-pixel text-muted-foreground">이전 결과</span>
          </div>
          <div className="space-y-2">
            {history.slice(1).map((entry) => (
              <div
                key={entry.id}
                className="group rounded-lg border border-border/50 bg-muted/10 p-3 flex items-start justify-between gap-3 hover:border-border transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{entry.tone}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{entry.content}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{entry.action}</span>
                  </div>
                  <p className="text-sm text-foreground/70 truncate">{entry.comment}</p>
                </div>
                <Button
                  onClick={() => copyToClipboard(entry.comment)}
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSlotMachine;
