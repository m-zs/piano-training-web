export const OSMD_CURSOR_WIDTH_PX = 30;

/**
 * Hides OSMD's cursor `<img>` (avoiding all Tailwind style conflicts) and
 * transfers its position to CSS custom properties on the container so a
 * `::after` pseudo-element can render the cursor overlay instead.
 */
export const syncCursorOverlay = (container: HTMLElement) => {
	for (const img of container.querySelectorAll<HTMLImageElement>(
		'img[id^="cursorImg-"]',
	)) {
		img.style.setProperty("display", "none", "important");

		const s = img.style;
		if (s.top) container.style.setProperty("--cursor-top", s.top);
		if (s.left) container.style.setProperty("--cursor-left", s.left);
		container.style.setProperty("--cursor-w", `${OSMD_CURSOR_WIDTH_PX}px`);
		const rawH = img.getAttribute("height") ?? s.height.replace("px", "");
		if (rawH) container.style.setProperty("--cursor-h", `${rawH}px`);
	}
};
