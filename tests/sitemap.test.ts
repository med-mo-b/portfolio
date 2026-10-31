/**
 * The site has one page. The German version is hidden for now, so the sitemap lists only the English page.
 */
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

test('the sitemap lists only the one English page', () => {
    expect(locs).toEqual(['https://moritzbednorz.com/']);
    expect(sitemap).not.toContain('hreflang');
});
