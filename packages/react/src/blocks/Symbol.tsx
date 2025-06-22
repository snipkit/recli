/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { PropsWithChildren } from 'react';
import { KhulnasoftComponent } from '../components/khulnasoft-component.component';
import { Khulnasoft, KhulnasoftElement, khulnasoft } from '@khulnasoft.com/sdk';
import hash from 'hash-sum';
import { NoWrap } from '../components/no-wrap';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';
import { withKhulnasoft } from '../functions/with-khulnasoft';
import { omit } from '../functions/utils';

const size = (thing: object) => Object.keys(thing).length;

const isShopify = Khulnasoft.isBrowser && 'Shopify' in window;

const refs: Record<string, Element> = {};

if (Khulnasoft.isBrowser) {
  try {
    Array.from(document.querySelectorAll('[khulnasoft-static-symbol]')).forEach(el => {
      const id = (el as HTMLDivElement).getAttribute('khulnasoft-static-symbol');
      if (id) {
        refs[id] = el;
      }
    });
  } catch (err) {
    console.error('Khulnasoft replace nodes error:', err);
  }
}

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: any;
  inline?: boolean;
  dynamic?: boolean;
  ownerId?: string;
}

export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  khulnasoftBlock?: KhulnasoftElement;
  attributes?: any;
  inheritState?: boolean;
}

class SymbolComponent extends React.Component<PropsWithChildren<SymbolProps>> {
  ref: KhulnasoftComponent | null = null;
  staticRef: HTMLDivElement | null = null;
  isEditingThisSymbol = false;

  get placeholder() {
    return (
      <div css={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please choose a model and entry
        for this symbol.
      </div>
    );
  }

  componentDidMount() {
    if (this.useStatic && this.staticRef && refs[this.props.khulnasoftBlock?.id!]) {
      this.staticRef.parentNode?.replaceChild(
        refs[this.props.khulnasoftBlock?.id!],
        this.staticRef
      );
    }
    Khulnasoft.nextTick(() => {
      const { model, entry } = this.props.symbol || {};
      // allows editing of symbols in the context of a parent page
      this.isEditingThisSymbol = Boolean(
        Khulnasoft.isEditing &&
          model === khulnasoft.editingModel &&
          entry &&
          location.search.includes(`overrides.${entry}`)
      );
    });
  }

  get useStatic() {
    return Boolean(
      Khulnasoft.isBrowser &&
        refs[this.props.khulnasoftBlock?.id!] &&
        !(Khulnasoft.isEditing || Khulnasoft.isPreviewing)
    );
  }

  render() {
    if (this.useStatic) {
      return <div ref={el => (this.staticRef = el)} />;
    }

    const symbol = this.props.symbol;

    let showPlaceholder = false;

    if (!symbol) {
      showPlaceholder = true;
    }

    const TagName = this.props.dataOnly
      ? NoWrap
      : (this.props.khulnasoftBlock && this.props.khulnasoftBlock.tagName) || 'div';

    const { model, entry, data, content, inline, ownerId } = symbol || {};
    const dynamic = symbol?.dynamic || this.props.dynamic;
    if (!(model && (entry || dynamic)) && !content?.data?.blocksJs && !inline) {
      showPlaceholder = true;
    }

    if (this.isEditingThisSymbol) {
      showPlaceholder = false;
    }

    let key = dynamic ? this.props.khulnasoftBlock?.id : [model, entry].join(':');
    const dataString = data && size(data) && hash(data);

    if (key && dataString && dataString.length < 300) {
      key += ':' + dataString;
    }
    const attributes = this.props.attributes || {};
    return (
      <KhulnasoftStoreContext.Consumer
        key={(model || 'no model') + ':' + (entry || 'no entry' + this.isEditingThisSymbol)}
      >
        {state => {
          const khulnasoftComponentKey = `${key}_${state?.state?.locale || 'Default'}`;
          return (
            <TagName
              data-model={model}
              {...attributes}
              className={
                (attributes.class || attributes.className || '') +
                ' khulnasoft-symbol' +
                (symbol?.inline ? ' khulnasoft-inline-symbol' : '') +
                (symbol?.dynamic || this.props.dynamic ? ' khulnasoft-dynamic-symbol' : '')
              }
            >
              {showPlaceholder ? (
                this.placeholder
              ) : (
                <KhulnasoftComponent
                  {...(ownerId && { apiKey: ownerId })}
                  {...(state.state?.locale && { locale: state.state.locale })}
                  isChild
                  ref={(ref: any) => (this.ref = ref)}
                  context={{ ...state.context, symbolId: this.props.khulnasoftBlock?.id }}
                  model={model}
                  entry={entry}
                  data={{
                    ...data,
                    ...(!!this.props.inheritState && omit(state.state, 'children')),
                    ...this.props.khulnasoftBlock?.component?.options?.symbol?.content?.data?.state,
                  }}
                  renderLink={state.renderLink}
                  inlineContent={symbol?.inline}
                  {...(content && { content })}
                  key={khulnasoftComponentKey}
                  options={{
                    ...(!this.isEditingThisSymbol && {
                      key: khulnasoftComponentKey,
                      noEditorUpdates: true,
                    }),
                    ...(Khulnasoft.singletonInstance.apiEndpoint === 'content' &&
                      entry && {
                        query: {
                          id: entry,
                        },
                      }),
                  }}
                  codegen={!!content?.data?.blocksJs}
                  hydrate={state.state?._hydrate}
                  khulnasoftBlock={this.props.khulnasoftBlock}
                  dataOnly={this.props.dataOnly}
                  nonce={state.context.nonce}
                >
                  {/* TODO: khulnasoft blocks option for loading stuff */}
                  {this.props.children}
                </KhulnasoftComponent>
              )}
            </TagName>
          );
        }}
      </KhulnasoftStoreContext.Consumer>
    );
  }
}

export const Symbol = withKhulnasoft(SymbolComponent, {
  // Khulnasoft:Symbol
  name: 'Symbol',
  noWrap: true,
  static: true,
  // TODO: allow getter for icon so different icon if data symbol hm,
  // Maybe "this" context is the block element in editor, and it's the
  // khulnasoftBlock json otherwise. In KhulnasoftBlock decorator find any getters
  // and convert to strings when passing and convert back to getters after
  // with `this` bound
  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol',
    },
    {
      name: 'dataOnly',
      helperText: `Make this a data symbol that doesn't display any UI`,
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'inheritState',
      helperText: `Inherit the parent component state and data`,
      type: 'boolean',
      defaultValue: isShopify,
      advanced: true,
    },
    {
      name: 'renderToLiquid',
      helperText:
        'Render this symbols contents to liquid. Turn off to fetch with javascript and use custom targeting',
      type: 'boolean',
      defaultValue: isShopify,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'useChildren',
      hideFromUI: true,
      type: 'boolean',
    },
  ],
});
