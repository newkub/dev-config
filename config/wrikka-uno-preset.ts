import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";
import { definePreset } from "unocss";
import {
	presetIcons,
	presetTagify,
	presetWebFonts,
	presetWind4,
	transformerVariantGroup,
} from "unocss";

export default definePreset(() => {
	return {
		name: "presetWrikka",
		presets: [
			presetWind4(),
			presetIcons({
				extraProperties: {
					display: "inline-block",
					"vertical-align": "middle",
				},
				collections: {
					mdi: () =>
						import("@iconify-json/mdi/icons.json").then((i) => i.default),
				},
			}),
			presetWebFonts({
				provider: "none",
				fonts: {
					sans: ["Noto Sans Thai", "Roboto"],
					mono: "Fira Code",
				},
				processors: createLocalFontProcessor({
					cacheDir: "node_modules/.cache/unocss/fonts",
					fontAssetsDir: "public/assets/fonts",
					fontServeBaseUrl: "/assets/fonts",
				}),
			}),
			presetTagify(),
		],
		rules: [
			// ...
		],
		variants: [
			// ...
		],
		transformers: [transformerVariantGroup()],
	};
});
