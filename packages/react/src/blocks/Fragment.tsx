'use client';
import React from 'react';
import { KhulnasoftElement } from '@khulnasoft.com/sdk';
import { withKhulnasoft } from '../functions/with-khulnasoft';
import { KhulnasoftBlock as KhulnasoftBlockComponent } from '../components/khulnasoft-block.component';

export interface FragmentProps {
  khulnasoftBlock?: KhulnasoftElement;
}

class FragmentComponent extends React.Component<FragmentProps> {
  render() {
    return (
      this.props.khulnasoftBlock &&
      this.props.khulnasoftBlock.children &&
      this.props.khulnasoftBlock.children.map((block, index) => (
        <KhulnasoftBlockComponent block={block} key={block.id} index={index} />
      ))
    );
  }
}

export const Fragment = withKhulnasoft(FragmentComponent, {
  name: 'Core:Fragment',
  canHaveChildren: true,
  noWrap: true,
  static: true,
  hideFromInsertMenu: true,
});
