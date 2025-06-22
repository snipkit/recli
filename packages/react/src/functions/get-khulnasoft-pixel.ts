import { KhulnasoftElement } from '@khulnasoft.com/sdk';

export function getKhulnasoftPixel(apiKey: string): KhulnasoftElement {
  return {
    id: 'khulnasoft-pixel-' + Math.random().toString(36).split('.')[1],
    '@type': '@khulnasoft.com/sdk:Element',
    tagName: 'img',
    properties: {
      role: 'presentation',
      'aria-hidden': 'true',
      src: `https://cdn.khulnasoft.com/api/v1/pixel?apiKey=${apiKey}`,
    },
    responsiveStyles: {
      large: {
        height: '0',
        width: '0',
        display: 'inline-block',
        opacity: '0',
        overflow: 'hidden',
        pointerEvents: 'none',
      },
    },
  };
}
