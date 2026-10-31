/**
 * The site has one page. The sitemap lists it in English and German, and both URLs give hreflang pairs.
 */
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

test('the sitemap lists only the one page in both languages', () => {
    expect(locs).toEqual(['https://moritzbednorz.com/', 'https://moritzbednorz.com/?lang=de']);
    expect(sitemap.match(/hreflang="de"/g)?.length).toBe(2);
});
