import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SoundPad as SoundPadType } from '@/hooks/useSoundboard';
import { Settings2 } from 'lucide-react';

interface SoundPadProps {
  pad: SoundPadType;
  isActive: boolean;
  onPlay: () => void;
  onEdit: () => void;
}

const padColorClasses: Record<number, string> = {
  1: 'from-pad-1/30 to-pad-1/10',
  2: 'from-pad-2/30 to-pad-2/10',
  3: 'from-pad-3/30 to-pad-3/10',
  4: 'from-pad-4/30 to-pad-4/10',
  5: 'from-pad-5/30 to-pad-5/10',
  6: 'from-pad-6/30 to-pad-6/10',
  7: 'from-pad-7/30 to-pad-7/10',
  8: 'from-pad-8/30 to-pad-8/10',
  9: 'from-pad-9/30 to-pad-9/10',
};

const padGlowClasses: Record<number, string> = {
  1: 'shadow-[0_0_30px_-5px_hsl(var(--pad-1)/0.5)]',
  2: 'shadow-[0_0_30px_-5px_hsl(var(--pad-2)/0.5)]',
  3: 'shadow-[0_0_30px_-5px_hsl(var(--pad-3)/0.5)]',
  4: 'shadow-[0_0_30px_-5px_hsl(var(--pad-4)/0.5)]',
  5: 'shadow-[0_0_30px_-5px_hsl(var(--pad-5)/0.5)]',
  6: 'shadow-[0_0_30px_-5px_hsl(var(--pad-6)/0.5)]',
  7: 'shadow-[0_0_30px_-5px_hsl(var(--pad-7)/0.5)]',
  8: 'shadow-[0_0_30px_-5px_hsl(var(--pad-8)/0.5)]',
  9: 'shadow-[0_0_30px_-5px_hsl(var(--pad-9)/0.5)]',
};

export function SoundPad({ pad, isActive, onPlay, onEdit }: SoundPadProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const padRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (rect) {
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setTimeout(() => setRipple(null), 600);
    }
    onPlay();
  };

  return (
    <button
      ref={padRef}
      onClick={handleClick}
      className={cn(
        'sound-pad group relative aspect-square w-full rounded-2xl cursor-pointer',
        'flex flex-col items-center justify-center gap-2',
        'bg-gradient-to-br',
        padColorClasses[pad.color] || padColorClasses[1],
        isActive && [
          'scale-95',
          padGlowClasses[pad.color] || padGlowClasses[1],
        ],
        'animate-scale-in'
      )}
    >
      {/* Glow effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200',
          'bg-gradient-radial from-current/20 to-transparent',
          isActive && 'opacity-100'
        )}
      />
      
      {/* Ripple effect */}
      {ripple && (
        <span
          className="absolute rounded-full bg-foreground/20 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
        />
      )}

      {/* Key indicator */}
      <span className="glass-strong text-xs font-semibold px-3 py-1 rounded-full text-foreground/80">
        {pad.key}
      </span>

      {/* Pad name */}
      <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
        {pad.name}
      </span>

      {/* Settings button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity glass-strong hover:scale-110"
      >
        <Settings2 className="w-3.5 h-3.5 text-foreground/60" />
      </button>
    </button>
  );
}
