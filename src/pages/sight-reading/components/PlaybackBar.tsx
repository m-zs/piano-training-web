import { Minus, Play, Plus, Square } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { BPM_MAX, BPM_MIN } from "./useScorePlayer";

type PlaybackBarProps = {
	isPlaying: boolean;
	ready: boolean;
	bpm: number;
	onPlay: () => void;
	onStop: () => void;
	onBpmChange: (bpm: number) => void;
};

export const PlaybackBar = ({
	isPlaying,
	ready,
	bpm,
	onPlay,
	onStop,
	onBpmChange,
}: PlaybackBarProps) => {
	const nudge = (delta: number) => onBpmChange(bpm + delta);

	return (
		<div className="playback-bar fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3">
			<div className="island-shell flex items-center gap-5 rounded-2xl px-5 py-2.5">
				{/* Transport */}
				<div className="flex items-center gap-1">
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-9 rounded-xl cursor-pointer"
						disabled={!ready || isPlaying}
						onClick={onPlay}
						aria-label="Play"
					>
						<Play className="size-4 fill-current" />
					</Button>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-9 rounded-xl cursor-pointer"
						disabled={!isPlaying}
						onClick={onStop}
						aria-label="Stop"
					>
						<Square className="size-4 fill-current" />
					</Button>
				</div>

				<div className="h-5 w-px bg-[var(--line)]" />

				{/* BPM */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-7 rounded-lg cursor-pointer"
						onClick={() => nudge(-5)}
						aria-label="Decrease BPM"
					>
						<Minus className="size-3" />
					</Button>

					<div className="flex flex-col items-center gap-1.5 mt-5">
						<input
							type="range"
							min={BPM_MIN}
							max={BPM_MAX}
							value={bpm}
							onChange={(e) => onBpmChange(Number(e.target.value))}
							className="bpm-slider w-28 cursor-pointer"
							style={
								{
									"--bpm-pct": (
										((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) *
										100
									).toFixed(1),
								} as React.CSSProperties
							}
							aria-label="BPM"
						/>
						<span className="text-[11px] font-semibold tabular-nums text-[var(--sea-ink-soft)]">
							{bpm} <span className="font-normal opacity-70">BPM</span>
						</span>
					</div>

					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-7 rounded-lg cursor-pointer"
						onClick={() => nudge(5)}
						aria-label="Increase BPM"
					>
						<Plus className="size-3" />
					</Button>
				</div>
			</div>
		</div>
	);
};
