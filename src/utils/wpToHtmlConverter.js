/**
 * WordPress to Semantic HTML Converter & Content Parser
 * Cleans, sanitizes, and transforms WordPress Gutenberg blocks,
 * classic WordPress HTML, and raw rich text into high-performance,
 * SEO-optimized semantic HTML for web pages.
 */

export const convertWordPressToHtml = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return '';

  let html = rawInput;

  // 1. Remove WordPress Gutenberg block comments (<!-- wp:... --> and <!-- /wp:... -->)
  html = html.replace(/<!--\s*\/?wp:[^\n>]*-->/gi, '');

  // 2. Clean up Microsoft Word / WordPress paste junk
  html = html.replace(/class="[^"]*wp-block-[^"]*"/gi, '');
  html = html.replace(/class="[^"]*MsoNormal[^"]*"/gi, '');
  html = html.replace(/style="[^"]*mso-[^"]*"/gi, '');

  // 3. Normalize Headings
  html = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>'); // Ensure single H1 per page, convert body H1 to H2

  // 4. Convert WordPress/Markdown bold, italic, headings if pasted in Markdown style
  // Markdown Headings
  html = html.replace(/^#### (.*?)$/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gim, '<h2>$1</h2>');

  // Markdown Quotes (> Quote)
  html = html.replace(/^> (.*?)$/gim, '<blockquote style="border-left: 4px solid #D4AF37; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: #F8FAFC; font-style: italic; color: #1E293B; border-radius: 0 8px 8px 0;">$1</blockquote>');

  // Markdown Lists
  html = html.replace(/^\s*\*\s+(.*?)$/gim, '<li>$1</li>');
  html = html.replace(/^\s*-\s+(.*?)$/gim, '<li>$1</li>');

  // Wrap loose <li> in <ul> if not already wrapped
  html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gis, (match) => {
    if (match.includes('<ul') || match.includes('<ol')) return match;
    return `<ul style="margin: 1rem 0 1.25rem 1.5rem; line-height: 1.8;">${match}</ul>`;
  });

  // Markdown Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Markdown Links [Text](URL)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0B192C; text-decoration: underline; font-weight: 600;">$1</a>');

  // 5. Enhance standard Blockquotes with ministry styling if plain
  html = html.replace(/<blockquote>(.*?)<\/blockquote>/gis, (match, inner) => {
    return `<blockquote style="border-left: 4px solid #D4AF37; padding: 0.85rem 1.35rem; margin: 1.5rem 0; background: #F8FAFC; font-style: italic; color: #1E293B; border-radius: 0 8px 8px 0;">${inner}</blockquote>`;
  });

  // 6. Enhance Tables with responsive container & border styling
  html = html.replace(/<table([^>]*)>/gi, '<div style="overflow-x: auto; margin: 1.5rem 0;"><table$1 style="width: 100%; border-collapse: collapse; font-size: 0.95rem; border: 1px solid #E2E8F0;">');
  html = html.replace(/<\/table>/gi, '</table></div>');
  html = html.replace(/<th([^>]*)>/gi, '<th$1 style="background: #0B192C; color: #FFFFFF; padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #CBD5E1;">');
  html = html.replace(/<td([^>]*)>/gi, '<td$1 style="padding: 0.75rem 1rem; border: 1px solid #E2E8F0; color: #334155;">');

  // 7. Ensure Paragraph breaks for double newlines if plain text was entered
  if (!html.includes('<p>') && !html.includes('<div>') && !html.includes('<h2>') && !html.includes('<h3>')) {
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p style="margin-bottom: 1.25rem; line-height: 1.8; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n\n');
  }

  // 8. Clean up extra empty paragraphs
  html = html.replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '');

  return html.trim();
};

/**
 * Extracts plain text snippet from rich HTML/WordPress body for SEO meta description.
 */
export const extractCleanSnippet = (htmlContent, maxLength = 155) => {
  if (!htmlContent) return '';
  
  // Strip all HTML tags
  const text = htmlContent
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Calculates keyword density in content
 */
export const calculateKeywordDensity = (content, focusKeyword) => {
  if (!content || !focusKeyword) return { count: 0, density: 0 };
  
  const cleanText = extractCleanSnippet(content, 999999).toLowerCase();
  const keyword = focusKeyword.trim().toLowerCase();
  
  if (!keyword) return { count: 0, density: 0 };

  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  if (totalWords === 0) return { count: 0, density: 0 };

  const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedKw}\\b`, 'gi');
  const matches = cleanText.match(regex);
  const count = matches ? matches.length : 0;
  const density = ((count / totalWords) * 100).toFixed(1);

  return { count, density: parseFloat(density), totalWords };
};
