import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";

export default defineConfig({
  plugins: [
    solid(),
  ],
  appType: "mpa",
  root: "src/client",
  publicDir: "../../public",
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/client/index.html"),
        project: resolve(__dirname, "src/client/project/index.html"),
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
    host: '0.0.0.0',  // Allow external connections
    port: 8787,
    // Allow Fly.io domains and localhost
    hmr: {
      clientPort: 8787,
      host: 'localhost'  // Use localhost for HMR to avoid issues
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:9999",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  esbuild: {
    jsx: "preserve",
    jsxImportSource: "solid-js",
  },
});
