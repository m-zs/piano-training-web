import type { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";
import { useEffect, useRef } from "react";

type ScoreViewerProps =
	| { xml: string; fileUrl?: never }
	| { fileUrl: string; xml?: never };

const ScoreViewer = ({ xml, fileUrl }: ScoreViewerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const osmdRef = useRef<OSMD | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		let cancelled = false;

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
				osmdRef.current.render();
			} catch (err) {
				console.error("OSMD render error:", err);
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [xml, fileUrl]);

	return <div ref={containerRef} />;
};

export default ScoreViewer;
