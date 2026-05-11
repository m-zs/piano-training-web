import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
	const { play, stop, isPlaying } = useScorePlayer({
		state,
		osmdRef,
		containerRef,
	});
	const ready = state === SCORE_VIEWER_LOAD_STATE.READY;

	return (
		<div className="relative w-full">
			<div className="absolute right-0 top-0 z-10 flex gap-1">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					disabled={!ready || isPlaying}
					onClick={() => void play()}
				>
					Play
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={!isPlaying}
					onClick={stop}
				>
					Stop
				</Button>
			</div>
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
					state === SCORE_VIEWER_LOAD_STATE.READY
						? "osmd-score relative w-full"
						: "osmd-score invisible h-0 overflow-hidden"
				}
			/>
		</div>
	);
};

export default ScoreViewer;
