import { defineConfig } from "tsdown";

export default defineConfig({
    dts: { build: true },
    sourcemap: true,
    minify: true,
    exports: true,
    format: "esm",
    target: "esnext",
    shims: true,
    platform: "node"
});
