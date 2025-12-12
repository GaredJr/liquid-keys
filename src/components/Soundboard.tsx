import { useSoundboard } from '@/hooks/useSoundboard';
import { SoundPad } from './SoundPad';
import { PadEditor } from './PadEditor';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles } from 'lucide-react';

export function Soundboard() {
  const {
    pads,
    activePads,
    editingPad,
    setEditingPad,
    playSound,
    updatePad,
    resetPads,
  } = useSoundboard();

  const currentEditingPad = pads.find(p => p.id === editingPad);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="glass-strong rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sound Pads</h2>
            <p className="text-sm text-muted-foreground">Tap or press keys to play</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetPads} 
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Pad Grid */}
      <div className="glass-strong rounded-3xl p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {pads.map((pad, index) => (
            <div 
              key={pad.id} 
              className="animate-scale-in" 
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <SoundPad
                pad={pad}
                isActive={activePads.has(pad.id)}
                onPlay={() => playSound(pad.id)}
                onEdit={() => setEditingPad(pad.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-3">
          Click the settings icon on any pad to upload custom audio and set trim points
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {['1', '2', '3', 'Q', 'W', 'E', 'A', 'S', 'D'].map((key) => (
            <kbd 
              key={key}
              className="w-8 h-8 rounded-lg glass-strong flex items-center justify-center text-xs font-mono font-medium text-foreground/70"
            >
              {key}
            </kbd>
          ))}
        </div>
      </div>

      {/* Pad Editor Modal */}
      {currentEditingPad && (
        <PadEditor
          pad={currentEditingPad}
          onUpdate={(updates) => updatePad(currentEditingPad.id, updates)}
          onClose={() => setEditingPad(null)}
          onKeyChange={(key) => updatePad(currentEditingPad.id, { key })}
        />
      )}
    </div>
  );
}