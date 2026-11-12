import { expect, test } from 'bun:test';
import { escapeHtml, paragraphs } from '../src/lib/html';

test('portfolio copy escapes markup and separates authored paragraphs', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
    expect(paragraphs('One paragraph.')).toBe('<p>One paragraph.</p>');
    expect(paragraphs('First.\n\nSecond.')).toBe('<p>First.</p><p>Second.</p>');
    expect(paragraphs('First.\r\n \r\nSecond.')).toBe('<p>First.</p><p>Second.</p>');
    expect(paragraphs('<img src=x onerror=alert(1)>\n\nA & B')).toBe('<p>&lt;img src=x onerror=alert(1)&gt;</p><p>A &amp; B</p>');
});
