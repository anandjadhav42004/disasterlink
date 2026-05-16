"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { RainViewerFrame } from "@/store/radar-store";

interface WeatherTimelineProps {
  frames: RainViewerFrame[];
  activeIndex: number;
  playing: boolean;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
}

export function WeatherTimeline({ frames, activeIndex, playing, onSelect, onTogglePlay }: WeatherTimelineProps) {
  const activeFrame = frames[activeIndex];

  return (
    <div className="border-t border-slate-700/80 bg-slate-950/90 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <button className="grid h-9 w-9 place-items-center border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={() => onSelect(Math.max(0, activeIndex - 1))} aria-label="Previous radar frame">
          <SkipBack className="h-4 w-4" />
        </button>
        <button className="grid h-9 w-9 place-items-center border border-cyan-400/50 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20" onClick={onTogglePlay} aria-label={playing ? "Pause radar playback" : "Play radar playback"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button className="grid h-9 w-9 place-items-center border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={() => onSelect(Math.min(frames.length - 1, activeIndex + 1))} aria-label="Next radar frame">
          <SkipForward className="h-4 w-4" />
        </button>
        <div className="min-w-36 font-mono text-xs text-slate-300">
          {activeFrame ? new Date(activeFrame.generatedAt).toLocaleTimeString() : "NO FRAME"}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {frames.map((frame, index) => (
            <button
              key={`${frame.time}-${index}`}
              className="h-2 flex-1 bg-slate-800 data-[active=true]:bg-cyan-300"
              data-active={index === activeIndex}
              onClick={() => onSelect(index)}
              aria-label={`Radar frame ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
