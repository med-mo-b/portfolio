export const escapeHtml = (value: unknown): string =>
    String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Keep authored paragraphs without treating portfolio copy as HTML. */
export const paragraphs = (value: string): string =>
    value.split(/\r?\n\s*\n/).map(part => `<p>${escapeHtml(part)}</p>`).join('');
