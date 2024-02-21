import { defineConfig } from "tsup";

export default defineConfig({
	external: [],
	entry: {
		index: "src/index.js",
	},
	format: ["cjs", "esm"],
	splitting: false,
	sourcemap: false,
	treeshake: true,
	minify: false,
	clean: true,
	dts: true,
	outExtension: ({ format }) => ({
		js: `.${format === "esm" ? "mjs" : "cjs"}`,
	}),
});
