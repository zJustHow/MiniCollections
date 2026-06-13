import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "public");
const proxyTarget = "http://localhost:8080";

function resolvePublicFilePathname(pathname) {
  const relativePath = pathname.replace(/^\//, "");
  if (!relativePath) return null;
  const publicPath = path.join(publicDir, relativePath);
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return pathname;
  }
  return null;
}

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
    if (resolvePublicFilePathname(pathname)) {
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
  const url = req.url ?? "";
  const pathname = url.split("?")[0] ?? "";

  if (req.method === "GET") {
    const publicFile = resolvePublicFilePathname(pathname);
    if (publicFile) return publicFile;

    const accept = req.headers.accept ?? "";
    if (accept.includes("text/html")) {
      return "/index.html";
    }
  }

  if (!shouldProxy(req)) {
    return false;
  }

  return undefined;
}

const apiProxy = {
  "^/(?!@|src|node_modules|assets|manifest\\.json|robots\\.txt).*": {
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
  resolve: {
    preserveSymlinks: true,
  },
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@dnd-kit")) {
            return "vendor-dnd-kit";
          }
          if (id.includes("@ant-design/plots")) {
            return "vendor-plots";
          }
          if (
            id.includes("/antd/") ||
            id.includes("@ant-design/cssinjs") ||
            id.includes("@ant-design/icons")
          ) {
            return "vendor-antd";
          }
          if (id.includes("react-router")) {
            return "vendor-router";
          }
          if (id.includes("react-dom") || id.includes("/react/")) {
            return "vendor-react";
          }
          if (id.includes("dayjs")) {
            return "vendor-dayjs";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.js", "src/setupTests.js"],
    },
  },
});
