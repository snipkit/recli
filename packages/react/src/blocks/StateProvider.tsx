'use client';
import React, { PropsWithChildren } from 'react';
import { KhulnasoftElement } from '@khulnasoft.com/sdk';
import { KhulnasoftBlock as KhulnasoftBlockComponent } from '../components/khulnasoft-block.component';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';
import { withKhulnasoft } from '../functions/with-khulnasoft';

interface StateProviderProps {
  khulnasoftBlock?: KhulnasoftElement;
  state: any;
  context?: any;
}

class StateProviderComponent extends React.Component<PropsWithChildren<StateProviderProps>> {
  render() {
    return (
      <KhulnasoftStoreContext.Consumer>
        {state => (
          <KhulnasoftStoreContext.Provider
            value={{
              ...state,
              state: {
                ...state.state,
                ...this.props.state,
              },
              context: {
                ...state.context,
                ...this.props.context,
              },
            }}
          >
            {this.props.khulnasoftBlock &&
              this.props.khulnasoftBlock.children &&
              this.props.khulnasoftBlock.children.map((block, index) => (
                <KhulnasoftBlockComponent block={block} key={block.id} index={index} child={true} />
              ))}
            {this.props.children}
          </KhulnasoftStoreContext.Provider>
        )}
      </KhulnasoftStoreContext.Consumer>
    );
  }
}

export const StateProvider = withKhulnasoft(StateProviderComponent, {
  name: 'Khulnasoft:StateProvider',
  // TODO: default children
  canHaveChildren: true,
  static: true,
  noWrap: true,
  hideFromInsertMenu: true,
});
