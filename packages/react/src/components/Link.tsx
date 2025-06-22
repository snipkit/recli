'use client';
import React from 'react';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';
/**
 * Link component should be used instead of an anchor tag in our components,
 * this is to allow our users to override anchor tags in
 * case they're using a routing Lib that requires using their
 * custom Link component (e.g Next, Gatsby, React Router)
 * <KhulnasoftComponent renderLink=(props) => <myCustomLink {...props} /> />
 */
export const Link = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <KhulnasoftStoreContext.Consumer>
    {context => {
      if (context.renderLink) {
        return context.renderLink(props);
      }
      return <a {...props} />;
    }}
  </KhulnasoftStoreContext.Consumer>
);
