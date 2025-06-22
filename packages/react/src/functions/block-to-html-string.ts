import { KhulnasoftElement } from '@khulnasoft.com/sdk';

export const htmlEscape = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// TODO: handle self closing tags
// TODO: how allow components (e.g. react components) in templates?
export const blockToHtmlString = (block: KhulnasoftElement): string =>
  `<${htmlEscape(block.tagName || 'div')} 
    class="khulnasoft-block ${block.id} ${block.class || ''}"
    khulnasoft-id="${block.id}"
  ${Object.keys(block.properties || {})
    .map(key => `${htmlEscape(key)}="${htmlEscape(block.properties![key])}"`)
    .join(' ')}
  >${
    block?.component?.name === 'Text'
      ? block.component.options.text
      : block.children
        ? block.children.map(item => blockToHtmlString(item)).join('')
        : ''
  }</${block.tagName || 'div'}>`.replace(/\s+/g, ' ');
