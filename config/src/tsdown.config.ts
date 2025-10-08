import { defineConfig } from "tsdown";

export default defineConfig([
    {
        entry: "src/presetWrikka/index.ts",
        dts: true,
        sourcemap: true,
        minify: true,
        exports: true,
        format: "esm",
        target: "esnext",
        shims: true,
        platform: "node"
    },
    {
        entry: "src/presetWrikka/types.ts",
        dts: true,
        sourcemap: true,
        minify: true,
        exports: true,
        format: "esm",
        target: "esnext",
        shims: true,
        platform: "node"
    }
]);
