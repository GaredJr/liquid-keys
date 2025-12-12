import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioTrimmerProps {
  audioData: string;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export function AudioTrimmer({ audioData, trimStart, trimEnd, onTrimChange }: AudioTrimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [localStart, setLocalStart] = useState(trimStart);
  const [localEnd, setLocalEnd] = useState(trimEnd);

  // Decode audio and draw waveform
  useEffect(() => {
    const decodeAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        const base64Data = audioData.split(',')[1] || audioData;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const buffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0));
        audioBufferRef.current = buffer;
        setDuration(buffer.duration);
        
        // Set initial end to full duration if not set
        if (trimEnd === 0 || trimEnd > buffer.duration) {
          setLocalEnd(buffer.duration);
          onTrimChange(localStart, buffer.duration);
        }
        
        drawWaveform(buffer);
      } catch (error) {
        console.error('Failed to decode audio for waveform:', error);
      }
    };

    decodeAudio();
    
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, [audioData]);

  // Update local state when props change
  useEffect(() => {
    setLocalStart(trimStart);
    setLocalEnd(trimEnd || duration);
  }, [trimStart, trimEnd, duration]);

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = buffer.getChannelData(0);
    const width = canvas.width;
    const height = canvas.height;
    const step = Math.ceil(data.length / width);

    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const y1 = ((1 + min) / 2) * height;
      const y2 = ((1 + max) / 2) * height;
      
      ctx.lineTo(i, y1);
      ctx.lineTo(i, y2);
    }
    
    ctx.strokeStyle = 'hsl(var(--foreground) / 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const getPositionFromTime = (time: number) => {
    if (duration === 0) return 0;
    return (time / duration) * 100;
  };

  const getTimeFromPosition = (clientX: number) => {
    const container = containerRef.current;
    if (!container || duration === 0) return 0;
    
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * duration;
  };

  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const time = getTimeFromPosition(e.clientX);
    
    if (isDragging === 'start') {
      const newStart = Math.max(0, Math.min(time, localEnd - 0.1));
      setLocalStart(newStart);
    } else {
      const newEnd = Math.min(duration, Math.max(time, localStart + 0.1));
      setLocalEnd(newEnd);
    }
  }, [isDragging, localEnd, localStart, duration]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onTrimChange(localStart, localEnd);
      setIsDragging(null);
    }
  }, [isDragging, localStart, localEnd, onTrimChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const playPreview = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;

    if (isPlaying && sourceRef.current) {
      sourceRef.current.stop();
      setIsPlaying(false);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    const startOffset = localStart;
    const playDuration = localEnd - localStart;
    
    source.start(0, startOffset, playDuration);
    sourceRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="space-y-3">
      {/* Waveform with trim handles */}
      <div 
        ref={containerRef}
        className="relative h-20 glass rounded-xl overflow-hidden"
      >
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={80}
          className="w-full h-full"
        />
        
        {/* Dimmed regions outside trim */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-background/60"
          style={{ width: `${getPositionFromTime(localStart)}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 right-0 bg-background/60"
          style={{ width: `${100 - getPositionFromTime(localEnd)}%` }}
        />
        
        {/* Start handle */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize",
            "hover:w-1.5 transition-all",
            isDragging === 'start' && 'w-1.5 bg-primary/80'
          )}
          style={{ left: `${getPositionFromTime(localStart)}%` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="absolute -left-2 -right-2 top-0 bottom-0" />
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-8 glass-strong rounded-sm flex items-center justify-center">
            <div className="w-0.5 h-4 bg-primary rounded-full" />
          </div>
        </div>
        
        {/* End handle */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize",
            "hover:w-1.5 transition-all",
            isDragging === 'end' && 'w-1.5 bg-primary/80'
          )}
          style={{ left: `${getPositionFromTime(localEnd)}%` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="absolute -left-2 -right-2 top-0 bottom-0" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-8 glass-strong rounded-sm flex items-center justify-center">
            <div className="w-0.5 h-4 bg-primary rounded-full" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={playPreview}
          className="p-2 glass-strong rounded-full hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex gap-4 text-xs text-foreground/60">
          <span>Start: {formatTime(localStart)}</span>
          <span>End: {formatTime(localEnd)}</span>
          <span>Duration: {formatTime(localEnd - localStart)}</span>
        </div>
      </div>
    </div>
  );
}