/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Khulnasoft } from '@khulnasoft.com/sdk';
import { KhulnasoftBlock } from './khulnasoft-block.component';
// TODO: fetch these for user and send them with same response like graphql
import { Size } from '../constants/device-sizes.constant';
import ReactDOM from 'react-dom';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';

export interface KhulnasoftBlocksProps {
  fieldName?: string;
  // TODO: block type (ElementType[])
  blocks?: any[] | React.ReactNode;
  child?: boolean;
  // TODO: use new react context for this to pass window size all the way down
  size?: Size;
  style?: React.CSSProperties;
  parentElementId?: string;
  parent?: any;
  dataPath?: string;
  className?: string;
  emailMode?: boolean;
}

interface KhulnasoftBlocksState {
  // width: number
}

// TODO: options to set direciotn
export class KhulnasoftBlocks extends React.Component<
  KhulnasoftBlocksProps,
  KhulnasoftBlocksState
> {
  hydrated = false;
  get isRoot() {
    return !this.props.child;
  }

  get noBlocks() {
    const { blocks } = this.props;
    return !(blocks && (blocks as any).length); // TODO: allow react nodes
  }
  get path() {
    const pathPrefix = 'component.options.';
    let path = this.props.dataPath || '';
    const thisPrefix = 'this.';
    if (path.trim()) {
      if (path.startsWith(thisPrefix)) {
        path = path.replace(thisPrefix, '');
      } else if (!path.startsWith(pathPrefix)) {
        path = pathPrefix + path;
      }
    }
    return path;
  }

  get parentId() {
    if (this.props.parentElementId) {
      return this.props.parentElementId;
    }
    return this.props.parent && this.props.parent.id;
  }

  componentDidMount() {
    this.hydrated = true;
  }

  onClickEmptyBlocks = () => {
    if (Khulnasoft.isIframe && this.noBlocks) {
      window.parent?.postMessage(
        {
          type: 'khulnasoft.clickEmptyBlocks',
          data: {
            parentElementId: this.parentId,
            dataPath: this.path,
          },
        },
        '*'
      );
    }
  };
  onHoverEmptyBlocks = () => {
    if (Khulnasoft.isEditing && this.noBlocks) {
      window.parent?.postMessage(
        {
          type: 'khulnasoft.hoverEmptyBlocks',
          data: {
            parentElementId: this.parentId,
            dataPath: this.path,
          },
        },
        '*'
      );
    }
  };

  // <!-- Khulnasoft Blocks --> in comments hmm
  render() {
    const { blocks } = this.props;

    const TagName = this.props.emailMode ? 'span' : 'div';

    // TODO: how deep check this automatically for mobx... hmmm optional / peer dependency?
    return (
      // TODO: component <Stack direction="vertical">
      // TODO: react.fragment instead?
      <TagName
        className={
          'khulnasoft-blocks' +
          (this.noBlocks ? ' no-blocks' : '') +
          (this.props.child ? ' khulnasoft-blocks-child' : '') +
          (this.props.className ? ' ' + this.props.className : '')
        }
        khulnasoft-type="blocks"
        khulnasoft-path={Khulnasoft.isIframe && this.hydrated ? this.path : undefined}
        khulnasoft-parent-id={this.parentId}
        css={
          {
            ...(!this.props.emailMode && {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }),
            ...this.props.style,
          } as any
        }
        onClick={() => {
          if (this.noBlocks) {
            this.onClickEmptyBlocks();
          }
        }}
        {...(Khulnasoft.isEditing && {
          onMouseEnter: () => this.onHoverEmptyBlocks(),
        })}
      >
        {/* TODO: if is react node (for react compatibility) render it */}
        {/* TODO: maybe don't do this to preserve blocks always editable */}
        {(blocks &&
          Array.isArray(blocks) &&
          (blocks as any[]).map((block, index) =>
            block && block['@type'] === '@khulnasoft.com/sdk:Element' ? (
              <KhulnasoftBlock
                key={block.id}
                block={block}
                index={index}
                fieldName={this.props.fieldName}
                child={this.props.child}
                emailMode={this.props.emailMode}
              />
            ) : (
              block
            )
          )) ||
          blocks}
      </TagName>
    );
  }

  static renderInto(
    elementOrSelector: string | HTMLElement,
    props: KhulnasoftBlocksProps = {},
    khulnasoftState: any
  ) {
    if (!elementOrSelector) {
      return;
    }

    let element: Element | null = null;

    if (typeof elementOrSelector === 'string') {
      element = document.querySelector(elementOrSelector);
    } else {
      if (elementOrSelector instanceof Element) {
        element = elementOrSelector;
      }
    }
    return ReactDOM.render(
      <KhulnasoftStoreContext.Provider value={khulnasoftState}>
        <KhulnasoftBlocks {...props} />
      </KhulnasoftStoreContext.Provider>,
      element
    );
  }
}
