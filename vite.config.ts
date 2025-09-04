import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  root: "src/client",
  publicDir: "../../public",
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/client/index.html"),
        "project/index": resolve(__dirname, "src/client/project/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    jsx: "preserve",
    jsxImportSource: "solid-js",
  },
});
