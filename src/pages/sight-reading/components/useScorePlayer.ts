import type { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";
import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import * as Tone from "tone";
import type { LoadState } from "./useScoreViewer";
import { SCORE_VIEWER_LOAD_STATE } from "./useScoreViewer";
import { syncCursorOverlay } from "./utils";

type UseScorePlayerArgs = {
	state: LoadState;
	osmdRef: RefObject<OSMD | null>;
	containerRef: RefObject<HTMLDivElement | null>;
};

export const useScorePlayer = ({
	state,
	osmdRef,
	containerRef,
}: UseScorePlayerArgs) => {
	const synthRef = useRef<Tone.PolySynth | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const stop = useCallback(() => {
		const transport = Tone.getTransport();
		transport.cancel();
		transport.stop();

		synthRef.current?.dispose();
		synthRef.current = null;
		setIsPlaying(false);
	}, []);

	const play = useCallback(async () => {
		if (state !== SCORE_VIEWER_LOAD_STATE.READY) return;

		const cursor = osmdRef.current?.cursor;
		if (!cursor?.iterator) return;

		stop();
		await Tone.start();

		const transport = Tone.getTransport();
		const synth = new Tone.PolySynth(Tone.Synth).toDestination();
		synthRef.current = synth;

		cursor.show();
		if (containerRef.current) syncCursorOverlay(containerRef.current);

		/** Default transport is 120 BPM; keep step length and note value aligned (one quarter per step). */
		const stepSeconds = 60 / transport.bpm.value;
		const noteLength: Tone.Unit.Time = "4n";

		let nextTransportTime = 0;

		const scheduleNext = () => {
			if (cursor.iterator.EndReached) {
				transport.schedule(() => {
					synthRef.current?.dispose();
					synthRef.current = null;
					setIsPlaying(false);
				}, nextTransportTime + 0.25);
				return;
			}

			const notesUnderCursor = cursor.NotesUnderCursor();
			const toneNotes: string[] = [];
			for (const note of notesUnderCursor) {
				if (!note.isRest()) {
					toneNotes.push(Tone.Frequency(note.halfTone, "midi").toNote());
				}
			}

			const chord = [...toneNotes];
			const scheduleAt = nextTransportTime;
			nextTransportTime += stepSeconds;

			transport.schedule((time) => {
				if (chord.length > 0) {
					synth.triggerAttackRelease(chord, noteLength, time);
				}
				cursor.next();
				if (containerRef.current) syncCursorOverlay(containerRef.current);
				scheduleNext();
			}, scheduleAt);
		};

		scheduleNext();
		transport.start();
		setIsPlaying(true);
	}, [state, stop, osmdRef.current?.cursor, containerRef.current]);

	return { play, stop, isPlaying };
};
