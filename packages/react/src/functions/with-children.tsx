'use client';
import React from 'react';
import { KhulnasoftElement } from '@khulnasoft.com/sdk';
import { KhulnasoftBlock } from '../components/khulnasoft-block.component';

const isKhulnasoftElement = (item: unknown): item is KhulnasoftElement => {
  return Boolean(
    typeof item === 'object' && item && (item as any)?.['@type'] === '@khulnasoft.com/sdk:Element'
  );
};

/**
 * Higher order component for passing Khulnasoft.com children as React children
 *
 * @example
 * ```tsx
 *
 *    const MyButton = props => <Button>
 *      {children}
 *    </Button>
 *
 *    const ButtonWithKhulnasoftChildren = withChildren(MyButton)
 *
 *    Khulnasoft.registerComponent(ButtonWithKhulnasoftChildren, {
 *      name: 'MyButton',
 *      defaultChildren: [
 *        {
 *          '@type': '@khulnasoft.com/sdk:Element'
 *        }
 *      ]
 *    })
 * ```
 */
export const withChildren = <P extends object>(Component: React.ComponentType<P>) => {
  const HOC = React.forwardRef<
    any,
    React.PropsWithChildren<P> & { khulnasoftBlock?: KhulnasoftElement }
  >((props, ref) => {
    const useProps = { ...props };
    const children =
      props.children ||
      (props.khulnasoftBlock &&
        props.khulnasoftBlock.children &&
        props.khulnasoftBlock.children.map(child => (
          <KhulnasoftBlock key={child.id} block={child} />
        )));

    const componentOptions = props.khulnasoftBlock?.component?.options;
    if (!!componentOptions) {
      Object.keys(componentOptions).forEach(key => {
        const value = componentOptions[key];
        if (Array.isArray(value) && value.every(isKhulnasoftElement)) {
          useProps[key] = value.map(child => <KhulnasoftBlock key={child.id} block={child} />);
        } else if (isKhulnasoftElement(value)) {
          useProps[key] = <KhulnasoftBlock block={value} />;
        }
      });
    }

    return (
      // getting type errors due to `@types/react` version mismatches. Can safely ignore.
      // @ts-ignore
      <Component {...useProps} ref={ref}>
        {children}
      </Component>
    );
  });

  (HOC as any).khulnasoftOptions = {
    canHaveChildren: true,
  };

  return HOC;
};
