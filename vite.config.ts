import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import Unocss from '@unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Replace from 'unplugin-replace/vite';
import Unused from 'unplugin-unused/vite';
import TurboConsole from 'unplugin-turbo-console/vite';
import Terminal from 'vite-plugin-terminal';
import { analyzer } from 'vite-bundle-analyzer';
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
	plugins: [
		Unocss(),
		AutoImport({
			imports: ['vue'],
			dts: true
		}),
		Replace(),
		TurboConsole({}),
		Terminal(),
		analyzer(),
		Inspect(),
		Unused({
			include: [/\.([cm]?[jt]sx?|vue)$/],
			exclude: [/node_modules/],
			level: 'warning',
			ignore: {
				peerDependencies: ['vue'],
			},
			depKinds: ['dependencies', 'peerDependencies'],
		}),
		tsconfigPaths(),
		checker({ 
			overlay: {
                initialIsOpen : false,
              },
              typescript: true,
              vueTsc: true,
              biome: {
                command: "lint",
              },
              // oxlint: true,
		})
	]
})
