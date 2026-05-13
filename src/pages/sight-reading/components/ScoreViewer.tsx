import "./ScoreViewer.css";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlaybackBar } from "./PlaybackBar";
import { useScorePlayer } from "./useScorePlayer";
import { SCORE_VIEWER_LOAD_STATE, useScoreViewer } from "./useScoreViewer";

export type ScoreViewerProps =
	| { xml: string; fileUrl?: never; buffer?: never }
	| { fileUrl: string; xml?: never; buffer?: never }
	| { buffer: ArrayBuffer; xml?: never; fileUrl?: never };

const ScoreViewer = ({ xml, fileUrl, buffer }: ScoreViewerProps) => {
	const { containerRef, state, retry, osmdRef } = useScoreViewer({
		xml,
		fileUrl,
		buffer,
	});
	const { play, stop, isPlaying, bpm, setBpmState } = useScorePlayer({
		state,
		osmdRef,
		containerRef,
	});
	const ready = state === SCORE_VIEWER_LOAD_STATE.READY;

	return (
		<div className="w-full pb-20">
			{state === SCORE_VIEWER_LOAD_STATE.LOADING && (
				<div className="flex items-center justify-center py-16">
					<Spinner className="size-6" />
				</div>
			)}
			{state === SCORE_VIEWER_LOAD_STATE.ERROR && (
				<div
					aria-live="assertive"
					className="flex flex-col items-center justify-center gap-3 py-16"
					role="alert"
				>
					<p className="text-sm text-destructive">Failed to load score.</p>
					<Button variant="outline" size="sm" onClick={retry}>
						Try again
					</Button>
				</div>
			)}
			<div
				ref={containerRef}
				className={
					ready
						? "osmd-score relative w-full cursor-pointer"
						: "osmd-score invisible h-0 overflow-hidden"
				}
			/>
			{createPortal(
				<PlaybackBar
					isPlaying={isPlaying}
					ready={ready}
					bpm={bpm}
					onPlay={() => void play()}
					onStop={stop}
					onBpmChange={setBpmState}
				/>,
				document.body,
			)}
		</div>
	);
};

export default ScoreViewer;
