import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SCORE_VIEWER_LOAD_STATE, useScoreViewer } from "./useScoreViewer";

export type ScoreViewerProps =
	| { xml: string; fileUrl?: never; buffer?: never }
	| { fileUrl: string; xml?: never; buffer?: never }
	| { buffer: ArrayBuffer; xml?: never; fileUrl?: never };

const ScoreViewer = ({ xml, fileUrl, buffer }: ScoreViewerProps) => {
	const { containerRef, state, retry } = useScoreViewer({
		xml,
		fileUrl,
		buffer,
	});

	return (
		<div className="relative w-full">
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
					state === "ready" ? "w-full" : "invisible h-0 overflow-hidden"
				}
			/>
		</div>
	);
};

export default ScoreViewer;
