import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";

const myPlugin = () => ({
  name: "rewrite-project-query",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const u = new URL(req.url || "/", "http://localhost");
      if (u.pathname === "/project") req.url = "/project/index.html" + u.search;
      next();
    });
  },
});

export default defineConfig({
  plugins: [solid(), myPlugin()],
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
    port: 8787,
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
