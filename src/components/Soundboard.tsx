import { useSoundboard } from '@/hooks/useSoundboard';
import { SoundPad } from './SoundPad';
import { PadEditor } from './PadEditor';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2 } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl glass-strong">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Soundboard</h1>
            <p className="text-sm text-muted-foreground">Press keys or tap pads to play</p>
          </div>
        </div>
        <Button variant="glass" size="icon" onClick={resetPads} title="Reset to defaults">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Pad Grid */}
      <div className="grid grid-cols-3 gap-4">
        {pads.map((pad) => (
          <SoundPad
            key={pad.id}
            pad={pad}
            isActive={activePads.has(pad.id)}
            onPlay={() => playSound(pad.id)}
            onEdit={() => setEditingPad(pad.id)}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Click the ⚙️ icon on each pad to customize its name, key binding, and color
        </p>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="glass px-3 py-1 rounded-full">1 2 3</span>
          <span className="glass px-3 py-1 rounded-full">Q W E</span>
          <span className="glass px-3 py-1 rounded-full">A S D</span>
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
