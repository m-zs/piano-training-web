/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScoreViewer from "./ScoreViewer";

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

const minimalXml = '<?xml version="1.0"?><score-partwise></score-partwise>';

describe("ScoreViewer", () => {
	beforeEach(() => {
		mockLoad.mockImplementation(() => Promise.resolve());
		mockRender.mockImplementation(() => undefined);
	});

	afterEach(() => {
		mockLoad.mockClear();
		mockRender.mockClear();
		OpenSheetMusicDisplay.mockClear();
	});

	it("shows loading status then hides it when the score is ready", async () => {
		render(<ScoreViewer xml={minimalXml} />);

		expect(
			screen.getByRole("status", { name: /loading/i }),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(
				screen.queryByRole("status", { name: /loading/i }),
			).not.toBeInTheDocument();
		});

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(mockLoad).toHaveBeenCalledWith(minimalXml);
		expect(mockRender).toHaveBeenCalled();
	});

	it("shows error UI when load fails and retry loads successfully", async () => {
		const user = userEvent.setup();
		mockLoad
			.mockImplementationOnce(() =>
				Promise.reject(new Error("simulated failure")),
			)
			.mockImplementation(() => Promise.resolve());

		const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(<ScoreViewer xml={minimalXml} />);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});

		expect(
			screen.queryByRole("status", { name: /loading/i }),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /try again/i }));

		await waitFor(() => {
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});

		expect(mockLoad.mock.calls.length).toBeGreaterThanOrEqual(2);
		logSpy.mockRestore();
	});

	it("loads from an ArrayBuffer via Blob", async () => {
		const buffer = new Uint8Array([9, 9, 9]).buffer;
		render(<ScoreViewer buffer={buffer} />);

		await waitFor(() => {
			expect(
				screen.queryByRole("status", { name: /loading/i }),
			).not.toBeInTheDocument();
		});

		expect(mockLoad).toHaveBeenCalledWith(expect.any(Blob));
	});
});
