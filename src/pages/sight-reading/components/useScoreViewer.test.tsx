/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	IOSMD_OPTIONS,
	SCORE_VIEWER_LOAD_STATE,
	useScoreViewer,
} from "./useScoreViewer";

const { mockLoad, mockRender, OpenSheetMusicDisplay } = vi.hoisted(() => {
	const mockLoad = vi.fn();
	const mockRender = vi.fn();
	const OpenSheetMusicDisplay = vi.fn(() => ({
		load: mockLoad,
		render: mockRender,
	}));
	return { mockLoad, mockRender, OpenSheetMusicDisplay };
});

vi.mock("opensheetmusicdisplay", () => ({
	OpenSheetMusicDisplay,
}));

const Harness = (props: Readonly<Parameters<typeof useScoreViewer>[0]>) => {
	const { containerRef, state, retry } = useScoreViewer(props);
	return (
		<div>
			<div data-testid="score-root" ref={containerRef} />
			<span data-testid="load-state">{state}</span>
			<button type="button" data-testid="retry" onClick={retry}>
				Retry
			</button>
		</div>
	);
};

const minimalXml = '<?xml version="1.0"?><score-partwise></score-partwise>';

describe("useScoreViewer", () => {
	beforeEach(() => {
		mockLoad.mockImplementation(() => Promise.resolve());
		mockRender.mockImplementation(() => undefined);
	});

	afterEach(() => {
		mockLoad.mockClear();
		mockRender.mockClear();
		OpenSheetMusicDisplay.mockClear();
	});

	it("sets ready after OpenSheetMusicDisplay load and render succeed", async () => {
		render(<Harness xml={minimalXml} />);

		await waitFor(() => {
			expect(screen.getByTestId("load-state")).toHaveTextContent(
				SCORE_VIEWER_LOAD_STATE.READY,
			);
		});

		expect(OpenSheetMusicDisplay).toHaveBeenCalledWith(
			expect.any(HTMLElement),
			IOSMD_OPTIONS,
		);
		expect(mockLoad).toHaveBeenCalledWith(minimalXml);
		expect(mockRender).toHaveBeenCalled();
	});

	it("passes a Blob when loading from buffer", async () => {
		const buffer = new Uint8Array([1, 2, 3]).buffer;
		render(<Harness buffer={buffer} />);

		await waitFor(() => {
			expect(screen.getByTestId("load-state")).toHaveTextContent(
				SCORE_VIEWER_LOAD_STATE.READY,
			);
		});

		expect(mockLoad).toHaveBeenCalledWith(expect.any(Blob));
	});

	it("sets error when load rejects", async () => {
		mockLoad.mockImplementationOnce(() =>
			Promise.reject(new Error("parse failed")),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(<Harness xml={minimalXml} />);

		await waitFor(() => {
			expect(screen.getByTestId("load-state")).toHaveTextContent(
				SCORE_VIEWER_LOAD_STATE.ERROR,
			);
		});
	});

	it("retry clears OSMD instance and loads again", async () => {
		render(<Harness xml={minimalXml} />);

		await waitFor(() => {
			expect(screen.getByTestId("load-state")).toHaveTextContent(
				SCORE_VIEWER_LOAD_STATE.READY,
			);
		});

		const callsAfterFirst = mockLoad.mock.calls.length;
		screen.getByTestId("retry").click();

		await waitFor(() => {
			expect(mockLoad.mock.calls.length).toBeGreaterThan(callsAfterFirst);
		});
		expect(OpenSheetMusicDisplay.mock.calls.length).toBe(2);
	});
});
