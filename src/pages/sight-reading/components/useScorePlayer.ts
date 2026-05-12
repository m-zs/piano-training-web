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

const BPM_DEFAULT = 120;
const BPM_MIN = 40;
const BPM_MAX = 240;

export { BPM_DEFAULT, BPM_MIN, BPM_MAX };

export const useScorePlayer = ({
	state,
	osmdRef,
	containerRef,
}: UseScorePlayerArgs) => {
	const synthRef = useRef<Tone.PolySynth | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [bpm, setBpm] = useState(BPM_DEFAULT);

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
			/** Read BPM fresh each step so mid-playback changes take effect immediately. */
			nextTransportTime += 60 / transport.bpm.value;

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

	const setBpmState = useCallback(
		(value: number) => {
			// If bpm is cahnged while playing, we need to restart the playback otherwise it's going to be bugged
			const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, value));
			Tone.getTransport().bpm.value = clamped;
			setBpm(clamped);
			if (Tone.getTransport().state === "started") {
				void play();
			}
		},
		[play],
	);

	return { play, stop, isPlaying, bpm, setBpmState };
};
