/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import ScoreFileLoader from "./ScoreFileLoader";

const getFileInput = (): HTMLElement => {
	const input = document.querySelector('input[type="file"]');
	if (!input) throw new Error("missing file input");
	return input as HTMLElement;
};

describe("ScoreFileLoader", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("forwards .musicxml contents as xml", async () => {
		const user = userEvent.setup();
		const onLoad = vi.fn();
		render(<ScoreFileLoader onLoad={onLoad} />);

		const xml = '<?xml version="1.0"?><score-partwise />';
		await user.upload(
			getFileInput(),
			new File([xml], "study.musicxml", { type: "application/xml" }),
		);

		await waitFor(() => {
			expect(onLoad).toHaveBeenCalledTimes(1);
		});
		expect(onLoad).toHaveBeenCalledWith({ xml }, "study.musicxml");
	});

	it("loads .mxl via ArrayBuffer", async () => {
		const user = userEvent.setup();
		const onLoad = vi.fn();
		render(<ScoreFileLoader onLoad={onLoad} />);

		const bytes = new Uint8Array([80, 75, 3, 4, 9, 9]);
		await user.upload(
			getFileInput(),
			new File([bytes], "piece.mxl", {
				type: "application/vnd.recordare.musicxml+xml",
			}),
		);

		await waitFor(() => {
			expect(onLoad).toHaveBeenCalledTimes(1);
		});
		const [, name] = onLoad.mock.calls[0];
		expect(name).toBe("piece.mxl");
		const [{ buffer }] = onLoad.mock.calls[0];
		expect(buffer).toBeInstanceOf(ArrayBuffer);
		expect([...new Uint8Array(buffer as ArrayBuffer)]).toEqual([...bytes]);
	});

	it("does not call onLoad when upload provides no files", async () => {
		const user = userEvent.setup();
		const onLoad = vi.fn();
		render(<ScoreFileLoader onLoad={onLoad} />);

		await user.upload(getFileInput(), []);

		expect(onLoad).not.toHaveBeenCalled();
	});

	it("shows fileName when provided", () => {
		render(<ScoreFileLoader fileName="beethoven.xml" onLoad={vi.fn()} />);

		expect(screen.getByText("beethoven.xml")).toBeInTheDocument();
	});

	it("shows an alert when reading the file fails", async () => {
		const user = userEvent.setup();
		const textSpy = vi
			.spyOn(File.prototype, "text")
			.mockRejectedValueOnce(new Error("disk read failed"));

		render(<ScoreFileLoader onLoad={vi.fn()} />);

		await user.upload(
			getFileInput(),
			new File(["<music/>"], "bad.xml", { type: "text/xml" }),
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(/disk read failed/i);
		});

		textSpy.mockRestore();
	});

	it('opens file picker when "Load score from file" is pressed', async () => {
		const user = userEvent.setup();
		const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

		render(<ScoreFileLoader onLoad={vi.fn()} />);

		await user.click(
			screen.getByRole("button", { name: /load score from file/i }),
		);

		expect(clickSpy).toHaveBeenCalled();
		clickSpy.mockRestore();
	});
});
