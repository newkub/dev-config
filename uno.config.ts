import { defineConfig } from "unocss";
import { presetWrikka } from "./uno.wrikka.ts";

export default defineConfig({
	presets: [
		presetWrikka({
			theme: {
				colors: {
					primary: '#007bff',
					secondary: '#6c757d'
				}
			},
			fonts: {
				sans: 'Inter',
				mono: 'Fira Code'
			},
			iconCollections: ['mdi', 'heroicons']
		}),
	],
});