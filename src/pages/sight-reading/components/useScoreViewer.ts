import type {
	IOSMDOptions,
	OpenSheetMusicDisplay as OSMD,
} from "opensheetmusicdisplay";
import { useCallback, useEffect, useRef, useState } from "react";

export type LoadState = "idle" | "loading" | "ready" | "error";

type UseScoreViewerArgs = {
	xml?: string;
	fileUrl?: string;
	buffer?: ArrayBuffer;
};

export const IOSMD_OPTIONS: IOSMDOptions = {
	autoResize: true,
	backend: "svg",
};

export const useScoreViewer = ({
	xml,
	fileUrl,
	buffer,
}: UseScoreViewerArgs) => {
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

			osmdRef.current ??= new OpenSheetMusicDisplay(
				containerRef.current,
				IOSMD_OPTIONS,
			);

			try {
				const content = xml ?? fileUrl ?? (buffer ? new Blob([buffer]) : "");
				await osmdRef.current.load(content);
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
	}, [xml, fileUrl, buffer, attempt]);

	return { containerRef, state, retry };
};
