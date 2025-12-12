import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import type { SoundPad } from '@/hooks/useSoundboard';
import { cn } from '@/lib/utils';

interface PadEditorProps {
  pad: SoundPad;
  onUpdate: (updates: Partial<SoundPad>) => void;
  onClose: () => void;
  onKeyChange: (newKey: string) => void;
}

const colorOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const colorClasses: Record<number, string> = {
  1: 'bg-pad-1',
  2: 'bg-pad-2',
  3: 'bg-pad-3',
  4: 'bg-pad-4',
  5: 'bg-pad-5',
  6: 'bg-pad-6',
  7: 'bg-pad-7',
  8: 'bg-pad-8',
  9: 'bg-pad-9',
};

export function PadEditor({ pad, onUpdate, onClose, onKeyChange }: PadEditorProps) {
  const [name, setName] = useState(pad.name);
  const [key, setKey] = useState(pad.key);
  const [isListeningForKey, setIsListeningForKey] = useState(false);

  useEffect(() => {
    if (!isListeningForKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const newKey = e.key.toUpperCase();
      if (newKey.length === 1) {
        setKey(newKey);
        onKeyChange(newKey);
        setIsListeningForKey(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListeningForKey, onKeyChange]);

  const handleSave = () => {
    onUpdate({ name, key });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Edit Pad</h2>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass border-border/50"
              placeholder="Sound name"
            />
          </div>

          {/* Key binding */}
          <div className="space-y-2">
            <Label>Key Binding</Label>
            <button
              onClick={() => setIsListeningForKey(true)}
              className={cn(
                'w-full h-12 glass-strong rounded-xl font-mono text-lg font-semibold transition-all',
                isListeningForKey && 'ring-2 ring-primary animate-pulse-glow'
              )}
            >
              {isListeningForKey ? 'Press any key...' : key}
            </button>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdate({ color })}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    colorClasses[color],
                    pad.color === color && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <Label>Volume</Label>
            <Slider
              value={[pad.volume * 100]}
              onValueChange={([v]) => onUpdate({ volume: v / 100 })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
