import { defineConfig, Plugin } from "vite";
import solid from "vite-plugin-solid";
import path, { resolve } from "path";

// Iframe communication plugin for development only
function iframeCommunicationPlugin(): Plugin {
  return {
    name: 'iframe-communication',
    enforce: 'pre',
    transformIndexHtml(html: string) {
        // Only inject in development mode
        if (process.env.NODE_ENV === 'production') {
          return html;
        }
        
        const communicationScript = `
    <script data-iframe-communication>
      (function() {
        // Only run if we're in an iframe
        if (window === window.parent) return;
        
        let port;
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        // Listen for handshake from parent
        window.addEventListener('message', function handshake(e) {
          if (e.data?.type === 'HANDSHAKE' && e.ports?.[0]) {
            port = e.ports[0];
            window.removeEventListener('message', handshake);
            
            // Send initial URL and navigation state
            const notifyUrlChange = () => {
              if (!port) return;
              port.postMessage({
                type: 'URL_CHANGED',
                url: window.location.href
              });
              // Note: We can't reliably detect forward history in browsers
              port.postMessage({
                type: 'NAVIGATION_STATE',
                canGoBack: window.history.length > 1,
                canGoForward: false
              });
            };
            
            // Send initial state
            notifyUrlChange();
            
            // Listen for navigation commands from parent
            port.onmessage = (event) => {
              const { type, cmd, payload } = event.data || {};
              if (type === 'CMD') {
                switch(cmd) {
                  case 'back':
                    if (window.history.length > 1) {
                      window.history.back();
                    }
                    break;
                  case 'forward':
                    window.history.forward();
                    break;
                  case 'refresh':
                    window.location.reload();
                    break;
                  case 'goto':
                    if (payload?.url) {
                      // Handle both absolute and relative URLs
                      if (payload.url.startsWith('http')) {
                        window.location.href = payload.url;
                      } else {
                        // Relative URL - navigate within the app
                        window.location.href = window.location.origin + payload.url;
                      }
                    }
                    break;
                }
              }
            };
            
            // Override history methods to track navigation
            history.pushState = function(...args) {
              originalPushState.apply(history, args);
              setTimeout(notifyUrlChange, 0);
            };
            
            history.replaceState = function(...args) {
              originalReplaceState.apply(history, args);
              setTimeout(notifyUrlChange, 0);
            };
            
            // Listen for browser navigation (back/forward buttons)
            window.addEventListener('popstate', notifyUrlChange);
            
            // Track navigation for single-page apps
            // Monitor clicks on links
            document.addEventListener('click', (e) => {
              const link = e.target.closest('a');
              if (link && link.href && link.href.startsWith(window.location.origin)) {
                setTimeout(notifyUrlChange, 100);
              }
            }, true);
            
            // Also monitor for programmatic navigation
            const observer = new MutationObserver(() => {
              const currentUrl = window.location.href;
              if (port) {
                port.postMessage({
                  type: 'URL_CHANGED', 
                  url: currentUrl
                });
              }
            });
            
            observer.observe(document.querySelector('body'), {
              childList: true,
              subtree: true
            });
          }
        });
      })();
    </script>`;
        
        // Inject right after opening <head> tag
        return html.replace('<head>', `<head>${communicationScript}`);
    }
  };
}

export default defineConfig({
  plugins: [solid(), iframeCommunicationPlugin()],
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
