import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useScoreViewer } from "./useScoreViewer";

type ScoreViewerProps =
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
			{state === "loading" && (
				<div className="flex items-center justify-center py-16">
					<Spinner className="size-6" />
				</div>
			)}
			{state === "error" && (
				<div className="flex flex-col items-center justify-center gap-3 py-16">
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
