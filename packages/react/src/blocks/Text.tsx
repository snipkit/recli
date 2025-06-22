/** @jsx jsx */
import { jsx, InterpolationWithTheme } from '@emotion/core';
import React from 'react';
import { Khulnasoft, KhulnasoftElement } from '@khulnasoft.com/sdk';
import { withKhulnasoft } from '../functions/with-khulnasoft';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';
import { tryEval } from '../functions/try-eval';

const iconUrl =
  'https://firebasestorage.googleapis.com/v0/b/khulnasoft-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929';

export interface TextProps {
  text: string;
  khulnasoftBlock?: KhulnasoftElement;
}

class TextComponent extends React.Component<TextProps> {
  textRef: HTMLSpanElement | null = null;

  componentDidMount() {
    // test if there are any expressions in text before assigning innerHTML
    if (this.textRef && !/{{([^}]+)}}/.test(this.props.text)) {
      this.textRef.innerHTML = this.props.text;
    }
  }

  evalExpression(expression: string, state: any) {
    // Don't interpolate when inline editing
    if (this.allowTextEdit) {
      return String(expression);
    }
    return String(expression).replace(/{{([^}]+)}}/g, (match, group) => tryEval(group, state));
  }

  get allowTextEdit() {
    return (
      Khulnasoft.isBrowser &&
      Khulnasoft.isEditing &&
      location.search.includes('khulnasoft.allowTextEdit=true') &&
      !(
        this.props.khulnasoftBlock &&
        this.props.khulnasoftBlock.bindings &&
        (this.props.khulnasoftBlock.bindings['component.options.text'] ||
          this.props.khulnasoftBlock.bindings['options.text'] ||
          this.props.khulnasoftBlock.bindings['text'])
      )
    );
  }

  render() {
    const textCSS: InterpolationWithTheme<any> = {
      outline: 'none',
      '& p:first-of-type, & .khulnasoft-paragraph:first-of-type': {
        margin: 0,
      },
      '& > p, & .khulnasoft-paragraph': {
        color: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        fontWeight: 'inherit',
        fontSize: 'inherit',
        textAlign: 'inherit',
        fontFamily: 'inherit',
      },
    };

    return (
      <KhulnasoftStoreContext.Consumer>
        {state => {
          if (state.content.meta?.rtlMode) {
            textCSS.direction = 'rtl';
          }

          return (
            <React.Fragment>
              {/* TODO: <KhulnasoftEditableText component that wraps this for other components with text */}
              <span
                ref={ref => {
                  this.textRef = ref;
                }}
                css={textCSS}
                className={
                  /* NOTE: This class name must be "khulnasoft-text" for inline editing to work in the Khulnasoft editor */
                  'khulnasoft-text'
                }
                {...{
                  dangerouslySetInnerHTML: {
                    __html: this.evalExpression(
                      this.props.text || (this.props as any).content || '',
                      state.state
                    ),
                  },
                }}
              />
            </React.Fragment>
          );
        }}
      </KhulnasoftStoreContext.Consumer>
    );
  }
}

export const Text = withKhulnasoft(TextComponent, {
  name: 'Text',
  static: true,
  image: iconUrl,
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      autoFocus: true,
      bubble: true,
      defaultValue: 'Enter some text...',
    },
  ],
  // Maybe optionally a function that takes in some params like block vs absolute, etc
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center',
  },
});
