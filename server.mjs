import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const port = Number(process.env.PORT || 3000);
const root = process.cwd();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const send404 = (response) => {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
};

const send500 = (response) => {
  response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Internal server error");
};

const server = http.createServer((request, response) => {
  const requestedPath = request.url === "/" ? "/index.html" : request.url || "/";
  const filePath = normalize(join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    send404(response);
    return;
  }

  if (!existsSync(filePath)) {
    send404(response);
    return;
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    send404(response);
    return;
  }

  const extension = extname(filePath);
  const contentType =
    contentTypes[extension] || "application/octet-stream";

  response.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": contentType,
  });

  const stream = createReadStream(filePath);

  stream.on("error", () => {
    send500(response);
  });

  stream.pipe(response);
});

server.listen(port, () => {
  console.log(`Personal site running at http://localhost:${port}`);
});
