/**
 * Build script using Bun 1.3 HTML-First features
 * Builds the SPA with automatic HTML reference updates
 */

import { cp, rm } from 'fs/promises';

async function build() {
    try {
        console.log('🧹 Cleaning dist directory...');
        // 1. Clean dist
        await rm('dist', { recursive: true, force: true });

        console.log('📦 Building with Bun 1.3...');
        // 2. Build via Bun 1.3 native HTML-Features
        // Bun parst das HTML, findet JS/CSS, bundelt es, hasht Dateinamen
        // und schreibt die Pfade in dist/index.html automatisch um!
        const proc = Bun.spawn([
            'bun',
            'build',
            'src/index.html',
            '--outdir',
            'dist',
            '--minify'
        ]);

        await proc.exited;

        if (proc.exitCode !== 0) {
            console.error('❌ Build failed');
            process.exit(1);
        }

        console.log('📁 Copying public folder...');
        // 3. Public Folder kopieren (unreferenzierte Files wie robots.txt, sitemap.xml)
        // Bun kopiert nur referenzierte Assets automatisch
        await cp('public', 'dist', { recursive: true });

        console.log('✅ Build complete!');
    } catch (error) {
        console.error('❌ Build error:', error);
        process.exit(1);
    }
}

build();

