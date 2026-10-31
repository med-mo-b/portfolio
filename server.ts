import { join } from "path";
import index from "./index.html";

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    // One page. index.html bundles the app.
    "/": index,
  },
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/$/, "");

    // Old pages: redirect to their section on the one page, keep query parameters
    const section = { "/about": "journey", "/work": "work", "/project-detail": "work" }[pathname];
    if (section) {
      return new Response(null, { status: 301, headers: { Location: `/${url.search}#${section}` } });
    }

    // Static files from /public served (images, robots.txt, sitemap.xml, etc.)
    const publicFile = Bun.file(join(process.cwd(), "public", url.pathname));
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    // Fallback to 404 for unknown routes
    return new Response("Not Found", { status: 404 });

  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Dev server running at http://localhost:${server.port}`);
