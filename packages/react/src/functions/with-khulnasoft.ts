import { Component } from '@khulnasoft.com/sdk';
import { KhulnasoftBlock } from '../decorators/khulnasoft-block.decorator';

export function withKhulnasoft(component: Function, options: Component) {
  KhulnasoftBlock(options)(component as any);
  return component;
}
