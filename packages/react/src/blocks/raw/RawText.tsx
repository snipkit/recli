'use client';
import * as React from 'react';
import { KhulnasoftElement, Khulnasoft } from '@khulnasoft.com/sdk';

export interface RawTextProps {
  attributes?: any;
  text?: string;
  khulnasoftBlock?: KhulnasoftElement;
}

export const RawText = (props: RawTextProps) => {
  const attributes = props.attributes || {};
  return (
    <span
      className={attributes?.class || attributes?.className}
      dangerouslySetInnerHTML={{ __html: props.text || '' }}
    />
  );
};

Khulnasoft.registerComponent(RawText, {
  name: 'Khulnasoft:RawText',
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'text',
      bubble: true,
      type: 'longText',
      required: true,
    },
  ],
});
