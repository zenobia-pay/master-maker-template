import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";
// Import the iframe communication plugin
import iframeCommunicationPlugin from "vite-plugin-iframe-communication";

export default defineConfig({
  plugins: [
    solid(),
    // Add iframe communication for development
    iframeCommunicationPlugin({
      debug: false, // Set to true for debugging
      includeInProduction: false, // Only inject in development
    }),
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
        dashboard: resolve(__dirname, "src/client/dashboard/index.html"),
        login: resolve(__dirname, "src/client/login/index.html"),
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
    host: true,
    port: 3000,
    strictPort: true,
    // Allow Fly.io domains and localhost
    hmr: {
      port: 3000,
      host: process.env.HMR_HOST || "localhost",
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
