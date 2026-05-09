import type { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ScoreViewerProps =
	| { xml: string; fileUrl?: never }
	| { fileUrl: string; xml?: never };

type LoadState = "idle" | "loading" | "ready" | "error";

const ScoreViewer = ({ xml, fileUrl }: ScoreViewerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const osmdRef = useRef<OSMD | null>(null);
	const [state, setState] = useState<LoadState>("loading");
	const [attempt, setAttempt] = useState(0);

	const retry = useCallback(() => {
		osmdRef.current = null;
		setAttempt((n) => n + 1);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is a retrigger counter, not a value consumed inside the effect
	useEffect(() => {
		if (!containerRef.current) return;

		let cancelled = false;
		setState("loading");

		const run = async () => {
			const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
			if (cancelled || !containerRef.current) return;

			osmdRef.current ??= new OpenSheetMusicDisplay(containerRef.current, {
				autoResize: true,
				backend: "svg",
			});

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
	}, [xml, fileUrl, attempt]);

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
