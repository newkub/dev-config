import { defineConfig, presetIcons, presetMini, transformerDirectives, transformerVariantGroup, presetWebFonts, transformerCompileClass } from "unocss";
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';

export default defineConfig({
	presets: [
		presetMini(),
		presetIcons({
			collections: {
				mdi: () =>
					import("@iconify-json/mdi/icons.json").then((i) => i.default),
			},
		}),
		presetWebFonts({
			provider: 'none',
			fonts: {
				sans: 'Noto Sans Thai',
				mono: 'Fira Code',
			},
			processors: createLocalFontProcessor({
				cacheDir: 'node_modules/.cache/unocss/fonts',
				fontAssetsDir: 'public/assets/fonts',
				fontServeBaseUrl: '/assets/fonts'
			})
		}),
	],
	transformers: [
		transformerVariantGroup(),
		transformerCompileClass(),
		transformerDirectives()
	],
	theme: {
		colors: {
			background: 'var(--background)',
			"background-block": 'var(--background-block)',
			text: 'var(--text)',
			brand: {
				brand: 'var(--brand)',
				error: 'var(--brand-error)',
				warning: 'var(--brand-warning)',
				success: 'var(--brand-success)',
			},
		},
		borderRadius: {
			sm: "var(--rounded-sm)",
			DEFAULT: "var(--rounded)",
			lg: "var(--rounded-lg)",
		},
		spacing: {
			sm: "var(--spacing-sm)",
			DEFAULT: "var(--spacing)",
			lg: "var(--spacing-lg)",
		},
		breakpoints: {
			sm: '320px',
			md: '640px',
			lg: '768px',
			xl: '1024px',
			'2xl': '1280px',
		},
	},
	shortcuts: [],
});