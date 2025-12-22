/**
 * Custom Dev Server (Optional)
 * Bun 1.3's native `bun --hot src/index.html` already has SPA-Fallback,
 * but this script provides more control if needed (e.g., custom MIME types, logging)
 */

const PORT: number = Number(process.env.PORT) || 3000;

Bun.serve({
    port: PORT,
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);
        const pathname = url.pathname;

        // Statische Dateien aus src/ oder public/ servieren
        const srcFile = Bun.file(`src${pathname}`);
        const publicFile = Bun.file(`public${pathname}`);

        if (await srcFile.exists()) {
            return new Response(srcFile);
        }
        if (await publicFile.exists()) {
            return new Response(publicFile);
        }

        // SPA-Fallback: IMMER index.html zurückgeben
        // (damit Reload auf /about funktioniert)
        const indexHtml = Bun.file('src/index.html');
        return new Response(indexHtml, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
});

console.log(`🚀 Dev server running at http://localhost:${PORT}`);
console.log(`💡 Note: Bun 1.3's native "bun --hot src/index.html" also works!`);


