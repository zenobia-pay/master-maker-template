import { defineConfig, PluginOption } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";
import fs from "node:fs";

// Import the iframe communication plugin
import iframeCommunicationPlugin from "vite-plugin-iframe-communication";

const pretty404 = (file = "src/client/404.html") =>
  ({
    name: "pretty-404",
    apply: "serve",
    configureServer(server) {
      const filePath = path.resolve(__dirname, file);
      let html = fs.readFileSync(filePath);
      server.watcher.add(filePath);
      server.watcher.on("change", (p) => {
        if (p === filePath) html = fs.readFileSync(filePath);
      });

      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" || req.url?.startsWith("/api")) return next();
        const end = res.end;
        res.end = function (...args: any[]) {
          if (res.statusCode === 404) {
            res.statusCode = 404;
            res.setHeader("content-type", "text/html; charset=utf-8");
            return end.call(this, html);
          }
          return end.call(this, ...args);
        };
        next();
      });
    },
  }) satisfies PluginOption;

export default defineConfig({
  plugins: [
    // Add iframe communication for development
    iframeCommunicationPlugin({
      debug: false, // Set to true for debugging
      includeInProduction: false, // Only inject in development
    }),
    solid(),
    pretty404(),
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
        login: resolve(__dirname, "src/client/login/index.html"),
        "404": resolve(__dirname, "src/client/404.html"),
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
    // DO NOT modify the formatting of the next 3 lines - used by automated sed replacement in runloop-devboxes.ts
    hmr: {
      port: 3000,
      host: "localhost",
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
