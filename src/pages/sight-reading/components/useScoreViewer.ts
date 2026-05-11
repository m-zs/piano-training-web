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
	followCursor: true,
	disableCursor: false,
	cursorsOptions: [
		{
			type: 1,
			color: "#0284c7",
			alpha: 0.92,
			follow: true,
		},
	],
};

export const SCORE_VIEWER_LOAD_STATE = {
	IDLE: "idle",
	LOADING: "loading",
	READY: "ready",
	ERROR: "error",
} as const;

export const useScoreViewer = ({
	xml,
	fileUrl,
	buffer,
}: UseScoreViewerArgs) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const osmdRef = useRef<OSMD | null>(null);
	const [state, setState] = useState<LoadState>(
		SCORE_VIEWER_LOAD_STATE.LOADING,
	);
	const [attempt, setAttempt] = useState(0);

	const retry = useCallback(() => {
		osmdRef.current = null;
		setAttempt((n) => n + 1);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is a retrigger counter, not a value consumed inside the effect
	useEffect(() => {
		if (!containerRef.current) return;

		let cancelled = false;
		setState(SCORE_VIEWER_LOAD_STATE.LOADING);

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
				setState(SCORE_VIEWER_LOAD_STATE.READY);
			} catch (err) {
				if (!cancelled) setState(SCORE_VIEWER_LOAD_STATE.ERROR);
				console.error("OSMD render error:", err);
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [xml, fileUrl, buffer, attempt]);

	return { containerRef, state, retry, osmdRef };
};
