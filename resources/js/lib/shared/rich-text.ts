const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'blockquote']);
const BLOCK_TAGS = new Set(['p', 'ul', 'ol', 'li', 'blockquote']);

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeUrl(href: string | null | undefined): string {
    if (!href) {
        return '';
    }

    const trimmed = href.trim();

    if (!trimmed) {
        return '';
    }

    if (/^javascript:/i.test(trimmed)) {
        return '';
    }

    if (/^(https?:|mailto:|#)/i.test(trimmed)) {
        return trimmed;
    }

    return `https://${trimmed}`;
}

function hasBlockChild(element: Element): boolean {
    return Array.from(element.childNodes).some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return false;
        }

        let tag = (node as Element).tagName.toLowerCase();

        if (tag === 'b') tag = 'strong';
        if (tag === 'i') tag = 'em';

        if (tag === 'div') {
            return true;
        }

        return BLOCK_TAGS.has(tag);
    });
}

function sanitizeChildren(element: Element | DocumentFragment): string {
    let result = '';

    element.childNodes.forEach((node) => {
        result += sanitizeNode(node);
    });

    return result;
}

function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        return escapeHtml(text);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }

    const element = node as Element;
    let tag = element.tagName.toLowerCase();

    if (tag === 'b') tag = 'strong';
    if (tag === 'i') tag = 'em';

    if (tag === 'span' || tag === 'font') {
        return sanitizeChildren(element);
    }

    if (tag === 'div') {
        const children = sanitizeChildren(element);
        if (!children.trim()) {
            return '';
        }

        if (hasBlockChild(element)) {
            return children;
        }

        return `<p>${children}</p>`;
    }

    if (tag === 'br') {
        return '<br />';
    }

    if (!ALLOWED_TAGS.has(tag)) {
        return sanitizeChildren(element);
    }

    let attributes = '';

    if (tag === 'a') {
        const href = sanitizeUrl(element.getAttribute('href'));
        if (!href) {
            return sanitizeChildren(element);
        }

        attributes = ` href="${href}"`;

        if (!href.startsWith('#') && !href.startsWith('mailto:')) {
            attributes += ' target="_blank" rel="noopener noreferrer"';
        }
    }

    const children = sanitizeChildren(element);

    if (tag === 'p') {
        const text = children.replace(/<br\s*\/>/gi, '').trim();
        if (!text) {
            return '';
        }
    }

    if ((tag === 'ul' || tag === 'ol') && !children.trim()) {
        return '';
    }

    if (tag === 'li') {
        const content = children.trim();
        if (!content) {
            return '';
        }
        return `<li>${content}</li>`;
    }

    return `<${tag}${attributes}>${children}</${tag}>`;
}

export function sanitizeRichText(value: string): string {
    if (typeof document === 'undefined') {
        return value;
    }

    const container = document.createElement('div');
    container.innerHTML = value ?? '';

    const sanitized = sanitizeChildren(container).trim();

    if (!sanitized) {
        return '';
    }

    if (!/^(<p|<ul|<ol|<blockquote|<strong|<em|<u|<a|<br)/i.test(sanitized)) {
        return `<p>${sanitized}</p>`;
    }

    return sanitized;
}

export function isRichTextEmpty(value?: string | null): boolean {
    if (!value) {
        return true;
    }

    const normalized = value
        .replace(/<br\s*\/>/gi, '')
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .trim();

    return normalized === '';
}

export function richTextToPlainText(value?: string | null): string {
    if (!value) {
        return '';
    }

    const withBreaks = value
        .replace(/<\/?p>/gi, '\n')
        .replace(/<\/?li>/gi, '\n')
        .replace(/<br\s*\/?\s*>/gi, '\n');

    if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(withBreaks, 'text/html');
        return (doc.body.textContent ?? '').replace(/\s+\n/g, '\n').trim();
    }

    return withBreaks.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}
