import "./PlaybackBar.css";
import {
	ChevronLeft,
	ChevronRight,
	Minus,
	Play,
	Plus,
	Square,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
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
	const [collapsed, setCollapsed] = useState(false);
	const [bpmInput, setBpmInput] = useState(String(bpm));

	useEffect(() => {
		setBpmInput(String(bpm));
	}, [bpm]);

	const commitBpm = () => {
		const parsed = Number.parseInt(bpmInput, 10);
		if (Number.isNaN(parsed)) {
			setBpmInput(String(bpm));
		} else {
			onBpmChange(parsed);
		}
	};

	const nudge = (delta: number) => onBpmChange(bpm + delta);

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-3 pointer-events-none">
			<div
				className="island-shell pointer-events-auto flex items-center gap-1 rounded-2xl px-2 py-2"
				style={{
					transform: collapsed
						? "translateX(calc(1rem - 50vw + 50%))"
						: "translateX(0)",
					transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				{/* Transport — always visible */}
				<div className="flex items-center gap-0.5">
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-9 cursor-pointer rounded-xl"
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
						className="size-9 cursor-pointer rounded-xl"
						disabled={!isPlaying}
						onClick={onStop}
						aria-label="Stop"
					>
						<Square className="size-4 fill-current" />
					</Button>
				</div>

				{/* BPM section — slides in/out with width + opacity */}
				<div
					className="flex items-center gap-2 overflow-hidden"
					style={{
						maxWidth: collapsed ? 0 : 280,
						opacity: collapsed ? 0 : 1,
						transition:
							"max-width 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease",
						pointerEvents: collapsed ? "none" : undefined,
					}}
				>
					<div className="h-5 w-px shrink-0 bg-[var(--line)] mx-1" />

					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-7 shrink-0 cursor-pointer rounded-lg"
						onClick={() => nudge(-5)}
						aria-label="Decrease BPM"
						tabIndex={collapsed ? -1 : 0}
					>
						<Minus className="size-3" />
					</Button>

					<div className="flex shrink-0 flex-col items-center gap-1.5 mt-5">
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
							tabIndex={collapsed ? -1 : 0}
						/>
						<div className="flex items-center gap-0.5">
							<input
								type="number"
								min={BPM_MIN}
								max={BPM_MAX}
								value={bpmInput}
								onChange={(e) => setBpmInput(e.target.value)}
								onBlur={commitBpm}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										commitBpm();
										e.currentTarget.blur();
									}
								}}
								tabIndex={collapsed ? -1 : 0}
								aria-label="BPM value"
								className="bpm-input w-9 bg-transparent text-center text-[11px] font-semibold tabular-nums text-[var(--sea-ink-soft)] outline-none focus:underline cursor-text"
							/>
							<span className="text-[11px] font-normal opacity-70 text-[var(--sea-ink-soft)]">
								BPM
							</span>
						</div>
					</div>

					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-7 shrink-0 cursor-pointer rounded-lg"
						onClick={() => nudge(5)}
						aria-label="Increase BPM"
						tabIndex={collapsed ? -1 : 0}
					>
						<Plus className="size-3" />
					</Button>
				</div>

				{/* Collapse toggle — always visible, flips direction */}
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="size-7 shrink-0 cursor-pointer rounded-lg"
					onClick={() => setCollapsed((c) => !c)}
					aria-label={
						collapsed ? "Expand playback bar" : "Collapse playback bar"
					}
				>
					{collapsed ? (
						<ChevronRight className="size-3" />
					) : (
						<ChevronLeft className="size-3" />
					)}
				</Button>
			</div>
		</div>
	);
};
