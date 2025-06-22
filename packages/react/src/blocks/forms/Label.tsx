'use client';
import React from 'react';
import { KhulnasoftElement } from '@khulnasoft.com/sdk';
import { KhulnasoftBlockComponent } from '../../khulnasoft-react';
import { withKhulnasoft } from '../../functions/with-khulnasoft';

export interface LabelProps {
  attributes?: any;
  text?: string;
  for?: string;
  khulnasoftBlock?: KhulnasoftElement;
}

class LabelComponent extends React.Component<LabelProps> {
  render() {
    return (
      <label htmlFor={this.props.for} {...this.props.attributes}>
        {this.props.text && (
          <span
            className="khulnasoft-label-text"
            dangerouslySetInnerHTML={{
              __html: this.props.text,
            }}
          />
        )}
        {this.props.khulnasoftBlock &&
          this.props.khulnasoftBlock.children &&
          this.props.khulnasoftBlock.children.map(item => (
            <KhulnasoftBlockComponent key={item.id} block={item} />
          ))}
      </label>
    );
  }
}

// TODO: strict ADA mode that enforces with custom error messages that all inputs need
// labels and names
export const Label = withKhulnasoft(LabelComponent, {
  name: 'Form:Label',
  image:
    'https://cdn.khulnasoft.com/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F9322342f04b545fb9a8091cd801dfb5b',
  inputs: [
    {
      name: 'text',
      type: 'html',
      richText: true,
      defaultValue: 'Label',
    },
    {
      name: 'for',
      type: 'text',
      helperText: 'The name of the input this label is for',
      advanced: true,
    },
  ],
  noWrap: true,
  static: true,
  canHaveChildren: true,
  // TODO: take inner html or blocsk
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
});
