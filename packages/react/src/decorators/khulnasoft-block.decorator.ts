import { Khulnasoft, Component } from '@khulnasoft.com/sdk';

interface ReactComponent extends Component {}

export function KhulnasoftBlock(options: ReactComponent) {
  options.type = 'react';

  return Khulnasoft.Component(options);
}
