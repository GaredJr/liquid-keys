import { useState, useCallback, useEffect, useRef } from 'react';

export interface SoundPad {
  id: string;
  key: string;
  name: string;
  color: number;
  audioData?: string; // Base64 encoded audio data
  audioFileName?: string;
  volume: number;
  trimStart?: number; // Start time in seconds
  trimEnd?: number;   // End time in seconds
}

const DEFAULT_PADS: SoundPad[] = [
  { id: '1', key: '1', name: 'Kick', color: 1, volume: 0.8 },
  { id: '2', key: '2', name: 'Snare', color: 2, volume: 0.8 },
  { id: '3', key: '3', name: 'Hi-Hat', color: 3, volume: 0.8 },
  { id: '4', key: 'Q', name: 'Clap', color: 4, volume: 0.8 },
  { id: '5', key: 'W', name: 'Tom', color: 5, volume: 0.8 },
  { id: '6', key: 'E', name: 'Crash', color: 6, volume: 0.8 },
  { id: '7', key: 'A', name: 'Bass', color: 7, volume: 0.8 },
  { id: '8', key: 'S', name: 'Synth', color: 8, volume: 0.8 },
  { id: '9', key: 'D', name: 'FX', color: 9, volume: 0.8 },
];

// Simple oscillator-based sounds
const createOscillatorSound = (type: OscillatorType, frequency: number, duration: number, audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const createKick = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const createSnare = (audioContext: AudioContext) => {
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(1, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  
  noise.start(audioContext.currentTime);
};

const createHiHat = (audioContext: AudioContext) => {
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  const highpass = audioContext.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 5000;
  
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  noise.connect(highpass);
  highpass.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  noise.start(audioContext.currentTime);
};

export function useSoundboard() {
  const [pads, setPads] = useState<SoundPad[]>(() => {
    const saved = localStorage.getItem('soundboard-pads');
    return saved ? JSON.parse(saved) : DEFAULT_PADS;
  });
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [editingPad, setEditingPad] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Decode and cache audio buffers
  const getAudioBuffer = useCallback(async (padId: string, audioData: string): Promise<AudioBuffer | null> => {
    if (audioBuffersRef.current.has(padId)) {
      return audioBuffersRef.current.get(padId)!;
    }
    
    try {
      const audioContext = getAudioContext();
      const base64Data = audioData.split(',')[1] || audioData;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = await audioContext.decodeAudioData(bytes.buffer);
      audioBuffersRef.current.set(padId, buffer);
      return buffer;
    } catch (error) {
      console.error('Failed to decode audio:', error);
      return null;
    }
  }, [getAudioContext]);

  const playCustomAudio = useCallback(async (pad: SoundPad) => {
    if (!pad.audioData) return;
    
    const audioContext = getAudioContext();
    const buffer = await getAudioBuffer(pad.id, pad.audioData);
    
    if (buffer) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = pad.volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Apply trim settings
      const startTime = pad.trimStart || 0;
      const duration = pad.trimEnd 
        ? pad.trimEnd - startTime 
        : buffer.duration - startTime;
      
      source.start(0, startTime, duration);
    }
  }, [getAudioContext, getAudioBuffer]);

  const playSound = useCallback((padId: string) => {
    const pad = pads.find(p => p.id === padId);
    if (!pad) return;

    // Play custom audio if available
    if (pad.audioData) {
      playCustomAudio(pad);
    } else {
      const audioContext = getAudioContext();
      
      // Play different sounds based on pad name
      switch (pad.name.toLowerCase()) {
        case 'kick':
          createKick(audioContext);
          break;
        case 'snare':
        case 'clap':
          createSnare(audioContext);
          break;
        case 'hi-hat':
        case 'crash':
          createHiHat(audioContext);
          break;
        case 'tom':
          createOscillatorSound('sine', 100, 0.3, audioContext);
          break;
        case 'bass':
          createOscillatorSound('sawtooth', 55, 0.4, audioContext);
          break;
        case 'synth':
          createOscillatorSound('square', 440, 0.3, audioContext);
          break;
        case 'fx':
          createOscillatorSound('triangle', 880, 0.5, audioContext);
          break;
        default:
          createOscillatorSound('sine', 440, 0.2, audioContext);
      }
    }

    setActivePads(prev => new Set([...prev, padId]));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 150);
  }, [pads, getAudioContext, playCustomAudio]);

  const updatePad = useCallback((padId: string, updates: Partial<SoundPad>) => {
    // Clear cached audio buffer if audio data changes
    if ('audioData' in updates) {
      audioBuffersRef.current.delete(padId);
    }
    
    setPads(prev => {
      const newPads = prev.map(p => p.id === padId ? { ...p, ...updates } : p);
      localStorage.setItem('soundboard-pads', JSON.stringify(newPads));
      return newPads;
    });
  }, []);

  const resetPads = useCallback(() => {
    setPads(DEFAULT_PADS);
    localStorage.setItem('soundboard-pads', JSON.stringify(DEFAULT_PADS));
  }, []);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingPad) return;
      
      const key = e.key.toUpperCase();
      const pad = pads.find(p => p.key.toUpperCase() === key);
      if (pad) {
        e.preventDefault();
        playSound(pad.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pads, playSound, editingPad]);

  return {
    pads,
    activePads,
    editingPad,
    setEditingPad,
    playSound,
    updatePad,
    resetPads,
  };
}
