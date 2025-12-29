import { join } from "path";
import index from "./src/index.html";

Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Static files from /public served (images, robots.txt, sitemap.xml, etc.)
    const publicFile = Bun.file(join(process.cwd(), "public", pathname));
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    // Fallback to 404 if not found
    return new Response("Not Found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Dev server running at http://localhost:3000`);
