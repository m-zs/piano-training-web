import type { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";
import { useEffect, useRef, useState } from "react";

type ScoreViewerProps =
	| { xml: string; fileUrl?: never }
	| { fileUrl: string; xml?: never };

type LoadState = "idle" | "loading" | "ready" | "error";

const ScoreViewer = ({ xml, fileUrl }: ScoreViewerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const osmdRef = useRef<OSMD | null>(null);
	const [state, setState] = useState<LoadState>("idle");

	useEffect(() => {
		if (!containerRef.current) return;

		let cancelled = false;
		setState("loading");

		const run = async () => {
			const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
			if (cancelled || !containerRef.current) return;

			if (!osmdRef.current) {
				osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
					autoResize: true,
					backend: "svg",
				});
			}

			try {
				await osmdRef.current.load(xml ?? fileUrl ?? "");
				if (cancelled) return;
				osmdRef.current.render();
				setState("ready");
			} catch (err) {
				if (!cancelled) setState("error");
				console.error("OSMD render error:", err);
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [xml, fileUrl]);

	return (
		<div className="relative w-full">
			{state === "loading" && (
				<div className="absolute inset-0 flex items-center justify-center gap-2 py-12 text-sm text-[var(--sea-ink-soft)]">
					<span
						className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--lagoon)] border-t-transparent"
						aria-hidden
					/>
					Loading score…
				</div>
			)}
			{state === "error" && (
				<p className="py-6 text-center text-sm text-red-500">
					Failed to load score.
				</p>
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
