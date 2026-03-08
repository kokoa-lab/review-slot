import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  rotation: number;
}

const COLORS = [
  "hsl(145, 80%, 50%)",  // green
  "hsl(280, 70%, 60%)",  // purple
  "hsl(35, 95%, 55%)",   // orange
  "hsl(185, 80%, 55%)",  // cyan
  "hsl(330, 80%, 60%)",  // pink
  "hsl(50, 95%, 60%)",   // gold
];

const JackpotEffect = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Flash
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    setTimeout(() => { setFlash(true); setTimeout(() => setFlash(false), 100); }, 300);

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      angle: (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5,
      speed: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 1500);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active && particles.length === 0 && !flash) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Screen flash */}
      {flash && (
        <div className="absolute inset-0 bg-primary/20 animate-pulse" />
      )}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            boxShadow: `0 0 6px ${p.color}`,
            transform: `rotate(${p.rotation}deg)`,
            animation: `jackpot-particle 1.2s ease-out forwards`,
            "--particle-tx": `${Math.cos(p.angle) * p.speed * 30}vw`,
            "--particle-ty": `${Math.sin(p.angle) * p.speed * 30}vh`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default JackpotEffect;
