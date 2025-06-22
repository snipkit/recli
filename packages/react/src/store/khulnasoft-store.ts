import React from 'react';

export const KhulnasoftStoreContext = React.createContext<KhulnasoftStore>({
  state: {},
  rootState: {},
  content: {},
  context: {},
  update: (mutator: (state: any) => any) => null,
});

export interface KhulnasoftStore {
  state: any;
  rootState: any;
  content: any;
  context: any;
  update: (mutator: (state: any) => any) => any;
  renderLink?: (props: React.AnchorHTMLAttributes<any>) => React.ReactNode;
}
