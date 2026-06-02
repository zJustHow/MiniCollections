const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
const path = require("path");

const proxyTarget = "http://localhost:8080";
const appPublicFolder = path.join(__dirname, "../public");
const servedPathname = "/";
const sockPath = process.env.WDS_SOCKET_PATH || "/ws";
const isDefaultSockHost = !process.env.WDS_SOCKET_HOST;

function mayProxy(pathname) {
  const maybePublicPath = path.resolve(
    appPublicFolder,
    pathname.replace(new RegExp("^" + servedPathname), "")
  );
  const isPublicFileRequest = fs.existsSync(maybePublicPath);
  const isWdsEndpointRequest =
    isDefaultSockHost && pathname.startsWith(sockPath);
  return !(isPublicFileRequest || isWdsEndpointRequest);
}

function shouldProxy(pathname, req) {
  // Webpack dev server assets — must not be forwarded to the backend
  if (
    pathname.startsWith("/static") ||
    pathname.startsWith("/sockjs-node") ||
    pathname.includes(".hot-update.")
  ) {
    return false;
  }

  return (
    req.method !== "GET" ||
    (mayProxy(pathname) &&
      req.headers.accept &&
      req.headers.accept.indexOf("text/html") === -1)
  );
}

module.exports = function (app) {
  app.use(
    createProxyMiddleware(shouldProxy, {
      target: proxyTarget,
      changeOrigin: true,
      logLevel: "silent",
    })
  );
};
