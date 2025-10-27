import { definePreset } from "unocss";
import {
	presetIcons,
	presetTagify,
	presetWind4,
	transformerVariantGroup,
	transformerDirectives,
	transformerCompileClass,
} from "unocss";
import presetWebFonts from '@unocss/preset-web-fonts'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

export interface RikkaPresetOptions {
	theme?: {
		colors?: Record<string, any>;
		spacing?: Record<string, any>;
		borderRadius?: Record<string, any>;
		breakpoints?: Record<string, any>;
	};
	fonts?: {
		sans?: string | string[];
		mono?: string | string[];
	};
	iconCollections?: string[];
	includeReset?: boolean;
}

const createWrikkaPreset = (options: RikkaPresetOptions = {}) => {
	const {
		theme = {},
		fonts = {},
		iconCollections = ['mdi'],
		styleReset = true,
	} = options;

	// Default theme values
	const defaultTheme = {
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
	};

	// Merge theme options with defaults
	const mergedTheme = {
		colors: { ...defaultTheme.colors, ...theme.colors },
		borderRadius: { ...defaultTheme.borderRadius, ...theme.borderRadius },
		spacing: { ...defaultTheme.spacing, ...theme.spacing },
		breakpoints: { ...defaultTheme.breakpoints, ...theme.breakpoints },
	};

	// Default fonts
	const defaultFonts = {
		sans: 'Roboto',
		mono: 'Fira Code',
	};

	// Merge font options
	const mergedFonts = {
		sans: fonts.sans || defaultFonts.sans,
		mono: fonts.mono || defaultFonts.mono,
	};

	return {
		name: "presetWrikka",
		presets: [
			presetWind4(),
			presetIcons({
				extraProperties: {
					display: "inline-block",
					"vertical-align": "middle",
				},
				collections: iconCollections.reduce((acc, collection) => {
					acc[collection] = () =>
						import(`@iconify-json/${collection}/icons.json`).then((i) => i.default);
					return acc;
				}, {} as Record<string, any>),
			}),
			presetTagify(),
			presetWebFonts({
				provider: 'none',
				fonts: mergedFonts,
				processors: createLocalFontProcessor({
					cacheDir: 'node_modules/.cache/unocss/fonts',
					fontAssetsDir: 'public/assets/fonts',
					fontServeBaseUrl: '/assets/fonts'
				})
			}),
		],
		transformers: [
			transformerVariantGroup(),
			transformerDirectives(),
			transformerCompileClass()
		],
		theme: mergedTheme,
		shortcuts: [],
		preflights: styleReset ? [
			{
				getCSS: () => `
					@import '@unocss/reset/tailwind-compat.css';
				`,
			},
		] : [],
	};
};

// Export as default for direct import
export default definePreset(createWrikkaPreset);

// Export as named export for specific usage
export const presetWrikka = definePreset(createWrikkaPreset);
