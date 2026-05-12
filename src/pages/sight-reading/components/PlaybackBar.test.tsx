/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlaybackBar } from "./PlaybackBar";
import { BPM_MAX, BPM_MIN } from "./useScorePlayer";

const defaults = {
	isPlaying: false,
	ready: true,
	bpm: 120,
	onPlay: vi.fn(),
	onStop: vi.fn(),
	onBpmChange: vi.fn(),
};

const renderBar = (overrides: Partial<typeof defaults> = {}) =>
	render(<PlaybackBar {...defaults} {...overrides} />);

describe("PlaybackBar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("transport buttons", () => {
		it("enables Play and disables Stop when not playing and ready", () => {
			renderBar({ isPlaying: false, ready: true });

			expect(screen.getByRole("button", { name: /^play$/i })).toBeEnabled();
			expect(screen.getByRole("button", { name: /^stop$/i })).toBeDisabled();
		});

		it("disables Play and enables Stop when playing", () => {
			renderBar({ isPlaying: true, ready: true });

			expect(screen.getByRole("button", { name: /^play$/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /^stop$/i })).toBeEnabled();
		});

		it("disables both Play and Stop when not ready and not playing", () => {
			renderBar({ isPlaying: false, ready: false });

			expect(screen.getByRole("button", { name: /^play$/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /^stop$/i })).toBeDisabled();
		});

		it("calls onPlay when Play is clicked", async () => {
			const onPlay = vi.fn();
			const user = userEvent.setup();
			renderBar({ onPlay });

			await user.click(screen.getByRole("button", { name: /^play$/i }));

			expect(onPlay).toHaveBeenCalledOnce();
		});

		it("calls onStop when Stop is clicked while playing", async () => {
			const onStop = vi.fn();
			const user = userEvent.setup();
			renderBar({ isPlaying: true, onStop });

			await user.click(screen.getByRole("button", { name: /^stop$/i }));

			expect(onStop).toHaveBeenCalledOnce();
		});
	});

	describe("BPM controls", () => {
		it("displays the current BPM value", () => {
			renderBar({ bpm: 95 });

			expect(screen.getByRole("slider", { name: /bpm/i })).toHaveValue("95");
		});

		it("calls onBpmChange with bpm − 5 when decrease is clicked", async () => {
			const onBpmChange = vi.fn();
			const user = userEvent.setup();
			renderBar({ bpm: 120, onBpmChange });

			await user.click(screen.getByRole("button", { name: /decrease bpm/i }));

			expect(onBpmChange).toHaveBeenCalledWith(115);
		});

		it("calls onBpmChange with bpm + 5 when increase is clicked", async () => {
			const onBpmChange = vi.fn();
			const user = userEvent.setup();
			renderBar({ bpm: 120, onBpmChange });

			await user.click(screen.getByRole("button", { name: /increase bpm/i }));

			expect(onBpmChange).toHaveBeenCalledWith(125);
		});

		it("slider has correct min, max, and value attributes", () => {
			renderBar({ bpm: 120 });

			const slider = screen.getByRole("slider", { name: /bpm/i });
			expect(slider).toHaveAttribute("min", String(BPM_MIN));
			expect(slider).toHaveAttribute("max", String(BPM_MAX));
			expect(slider).toHaveValue("120");
		});

		it("calls onBpmChange when slider value changes", () => {
			const onBpmChange = vi.fn();
			renderBar({ bpm: 120, onBpmChange });

			const slider = screen.getByRole("slider", { name: /bpm/i });
			// userEvent has no range-input support
			fireEvent.change(slider, { target: { value: "130" } });

			expect(onBpmChange).toHaveBeenCalledWith(130);
		});

		it("passes out-of-range bpm to onBpmChange — clamping is the caller's responsibility", async () => {
			const onBpmChange = vi.fn();
			const user = userEvent.setup();
			renderBar({ bpm: BPM_MIN, onBpmChange });

			await user.click(screen.getByRole("button", { name: /decrease bpm/i }));

			expect(onBpmChange).toHaveBeenCalledWith(BPM_MIN - 5);
		});
	});

	describe("collapse / expand", () => {
		it("shows 'Collapse playback bar' toggle by default (expanded)", () => {
			renderBar();

			expect(
				screen.getByRole("button", { name: /collapse playback bar/i }),
			).toBeInTheDocument();
		});

		it("sets tabIndex −1 on slider and nudge buttons after collapsing", async () => {
			const user = userEvent.setup();
			renderBar();

			await user.click(
				screen.getByRole("button", { name: /collapse playback bar/i }),
			);

			expect(screen.getByRole("slider", { name: /bpm/i })).toHaveAttribute(
				"tabindex",
				"-1",
			);
			expect(
				screen.getByRole("button", { name: /decrease bpm/i }),
			).toHaveAttribute("tabindex", "-1");
			expect(
				screen.getByRole("button", { name: /increase bpm/i }),
			).toHaveAttribute("tabindex", "-1");
		});

		it("shows 'Expand playback bar' toggle after collapsing", async () => {
			const user = userEvent.setup();
			renderBar();

			await user.click(
				screen.getByRole("button", { name: /collapse playback bar/i }),
			);

			expect(
				screen.getByRole("button", { name: /expand playback bar/i }),
			).toBeInTheDocument();
		});

		it("restores tabIndex on slider and nudge buttons after expanding again", async () => {
			const user = userEvent.setup();
			renderBar();

			await user.click(
				screen.getByRole("button", { name: /collapse playback bar/i }),
			);
			await user.click(
				screen.getByRole("button", { name: /expand playback bar/i }),
			);

			expect(screen.getByRole("slider", { name: /bpm/i })).not.toHaveAttribute(
				"tabindex",
				"-1",
			);
			expect(
				screen.getByRole("button", { name: /decrease bpm/i }),
			).not.toHaveAttribute("tabindex", "-1");
			expect(
				screen.getByRole("button", { name: /increase bpm/i }),
			).not.toHaveAttribute("tabindex", "-1");
		});
	});
});
