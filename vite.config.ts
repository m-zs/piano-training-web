import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
	const isVitest =
		mode === "test" ||
		process.env.VITEST === "true" ||
		process.env.VITEST === "1";

	return {
		resolve: {
			tsconfigPaths: true,
			dedupe: ["react", "react-dom"],
			alias: {
				"@": path.resolve(rootDir, "src"),
				"#": path.resolve(rootDir, "src"),
			},
		},
		plugins: isVitest
			? [viteReact()]
			: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
		optimizeDeps: {
			include: isVitest
				? ["react", "react-dom", "@testing-library/react"]
				: ["opensheetmusicdisplay"],
		},
		ssr: {
			noExternal: ["react", "react-dom", "@testing-library/react"],
		},
		test: {
			environment: "jsdom",
			setupFiles: ["./vitest.setup.ts"],
		},
	};
});
