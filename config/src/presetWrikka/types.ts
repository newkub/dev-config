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
