import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "public");
const proxyTarget = "http://localhost:8080";

function shouldProxy(req) {
  const url = req.url ?? "";
  const pathname = url.split("?")[0] ?? "";

  if (
    pathname.startsWith("/@") ||
    pathname.startsWith("/src") ||
    pathname.startsWith("/node_modules") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/static")
  ) {
    return false;
  }

  if (req.method === "GET") {
    const publicPath = path.join(publicDir, pathname);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      return false;
    }

    const accept = req.headers.accept ?? "";
    if (accept.includes("text/html")) {
      return false;
    }
  }

  return true;
}

function proxyBypass(req) {
  if (shouldProxy(req)) {
    return;
  }

  const accept = req.headers.accept ?? "";
  if (req.method === "GET" && accept.includes("text/html")) {
    return "/index.html";
  }

  return false;
}

const apiProxy = {
  "^/(?!@|src|node_modules).*": {
    target: proxyTarget,
    changeOrigin: true,
    bypass: proxyBypass,
  },
};

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js,tsx,ts}",
    }),
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    globals: true,
  },
});
