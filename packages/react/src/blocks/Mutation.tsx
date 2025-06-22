/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Khulnasoft, KhulnasoftElement } from '@khulnasoft.com/sdk';
import { KhulnasoftBlocks } from '../components/khulnasoft-blocks.component';

Khulnasoft.registerComponent(Mutation, {
  name: 'Khulnasoft:Mutation',
  canHaveChildren: true,
  noWrap: true,
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'type',
      type: 'string',
      defaultValue: 'replace',
      enum: [
        {
          label: 'Replace',
          value: 'replace',
          helperText: 'Replace the contents of this site region with content from Khulnasoft',
        },
        {
          label: 'Append',
          value: 'afterEnd',
          helperText: 'Append Khulnasoft content after the chosen site region',
        },
      ],
    },
    {
      name: 'selector',
      // TODO: special UI for this
      type: 'khulnasoft:domSelector',
    },
  ],
});

type MutationProps = {
  selector: string;
  khulnasoftBlock?: KhulnasoftElement;
  type?: 'replace' | 'afterEnd';
};

export function Mutation(props: MutationProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  useWaitForSelector(props.selector, node => {
    // TODO: static generate this logic
    if (props.type !== 'afterEnd') {
      node.innerHTML = '';
    }
    node.appendChild(ref.current!.firstElementChild!);
  });

  const children = props.khulnasoftBlock?.children;

  return (
    <span style={{ display: 'none' }} ref={ref}>
      <KhulnasoftBlocks
        style={{
          display: 'inline',
        }}
        child
        parentElementId={props.khulnasoftBlock?.id}
        dataPath="this.children"
        blocks={children}
      />
    </span>
  );
}

function useWaitForSelector(selector: string, cb: (node: Element) => void) {
  React.useLayoutEffect(() => {
    try {
      const existingElement = document.querySelector(selector);
      if (existingElement) {
        cb(existingElement);
        return;
      }
    } catch (err) {
      console.warn(err);
    }

    const observer = new MutationObserver(() => {
      try {
        const foundElement = document.querySelector(selector);
        if (foundElement) {
          observer.disconnect();
          cb(foundElement);
        }
      } catch (err) {
        console.warn(err);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [selector]);
}
