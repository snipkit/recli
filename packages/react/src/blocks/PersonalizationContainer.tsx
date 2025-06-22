import React, { useContext, useRef } from 'react';
import { Khulnasoft, khulnasoft, KhulnasoftElement } from '@khulnasoft.com/sdk';
import { useEffect, useState } from 'react';
import { KhulnasoftBlocks } from '../components/khulnasoft-blocks.component';
import {
  filterWithCustomTargeting,
  filterWithCustomTargetingScript,
  Query,
} from '../functions/filter-with-custom-targeting';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';

export type PersonalizationContainerProps = {
  children: React.ReactNode;
  previewingIndex: number | null;
  khulnasoftBlock?: KhulnasoftElement;
  khulnasoftState: any;
  variants?: [
    {
      query: Query[];
      startDate?: string;
      endDate?: string;
      blocks: KhulnasoftElement[];
    },
  ];
  attributes: any;
};

export function PersonalizationContainer(props: PersonalizationContainerProps) {
  const isBeingHydrated = Boolean(
    Khulnasoft.isBrowser && (window as any).__hydrated?.[props.khulnasoftBlock?.id!]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(isBeingHydrated);
  const [isHydrated, setIsHydrated] = useState(false);
  const [_, setUpdate] = useState(0);
  const khulnasoftStore = useContext(KhulnasoftStoreContext);

  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
    const subscriber = khulnasoft.userAttributesChanged.subscribe(() => {
      setUpdate(prev => prev + 1);
    });
    let unsubs = [() => subscriber.unsubscribe()];

    if (!(Khulnasoft.isEditing || Khulnasoft.isPreviewing)) {
      const variant = filteredVariants[0];
      // fire a custom event to update the personalization container
      rootRef.current?.dispatchEvent(
        new CustomEvent('khulnasoft.variantLoaded', {
          detail: {
            variant: variant || 'default',
            content: khulnasoftStore.content,
          },
          bubbles: true,
        })
      );

      // add an intersection observer to fire a khulnasoft.variantDisplayed event when the container is in the viewport
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            rootRef.current?.dispatchEvent(
              new CustomEvent('khulnasoft.variantDisplayed', {
                detail: {
                  variant: variant || 'default',
                  content: khulnasoftStore.content,
                },
                bubbles: true,
              })
            );
          }
        });
      });

      observer.observe(rootRef.current!);
      unsubs.push(() => observer.disconnect());
    }

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  if (Khulnasoft.isServer) {
    return (
      <React.Fragment>
        <div
          {...props.attributes}
          // same as the client side styles for hydration matching
          style={{
            opacity: 1,
            transition: 'opacity 0.2s ease-in-out',
            ...props.attributes?.style,
          }}
          className={`khulnasoft-personalization-container ${props.attributes.className}`}
        >
          {props.variants?.map((variant, index) => (
            <template key={index} data-variant-id={props.khulnasoftBlock?.id! + index}>
              <KhulnasoftBlocks
                blocks={variant.blocks}
                parentElementId={props.khulnasoftBlock?.id}
                dataPath={`component.options.variants.${index}.blocks`}
                child
              />
            </template>
          ))}
          <script
            nonce={khulnasoftStore.context.nonce}
            id={`variants-script-${props.khulnasoftBlock?.id}`}
            dangerouslySetInnerHTML={{
              __html: getPersonalizationScript(
                props.variants,
                props.khulnasoftBlock?.id || 'none',
                props.khulnasoftState.state?.locale
              ),
            }}
          />
          <KhulnasoftBlocks
            blocks={props.khulnasoftBlock?.children}
            parentElementId={props.khulnasoftBlock?.id}
            dataPath="this.children"
            child
          />
        </div>
        <script
          nonce={khulnasoftStore.context.nonce}
          dangerouslySetInnerHTML={{
            __html: `
         window.__hydrated = window.__hydrated || {};
         window.__hydrated['${props.khulnasoftBlock?.id}'] = true;
        `.replace(/\s+/g, ' '),
          }}
        />
      </React.Fragment>
    );
  }

  const filteredVariants = (props.variants || []).filter(variant => {
    return filterWithCustomTargeting(
      {
        ...(props.khulnasoftState.state?.locale
          ? { locale: props.khulnasoftState.state.locale }
          : {}),
        ...khulnasoft.getUserAttributes(),
      },
      variant.query,
      variant.startDate,
      variant.endDate
    );
  });

  return (
    <React.Fragment>
      <div
        ref={rootRef}
        {...props.attributes}
        style={{
          opacity: isClient ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          ...props.attributes?.style,
        }}
        className={`khulnasoft-personalization-container ${
          props.attributes.className
        }${isClient ? '' : ' khulnasoft-personalization-container-loading'}`}
      >
        {/* If editing a specific varient */}
        {isHydrated &&
        Khulnasoft.isEditing &&
        typeof props.previewingIndex === 'number' &&
        props.previewingIndex < (props.variants?.length || 0) ? (
          <KhulnasoftBlocks
            blocks={props.variants?.[props.previewingIndex]?.blocks}
            parentElementId={props.khulnasoftBlock?.id}
            dataPath={`component.options.variants.${props.previewingIndex}.blocks`}
            child
          />
        ) : // If editing the default or we're on the server and there are no matching variants show the default
        (isHydrated && Khulnasoft.isEditing && typeof props.previewingIndex !== 'number') ||
          !isClient ||
          !filteredVariants.length ? (
          <KhulnasoftBlocks
            blocks={props.khulnasoftBlock?.children}
            parentElementId={props.khulnasoftBlock?.id}
            dataPath="this.children"
            child
          />
        ) : (
          // Show the variant matching the current user attributes
          <KhulnasoftBlocks
            blocks={filteredVariants[0]?.blocks}
            parentElementId={props.khulnasoftBlock?.id}
            dataPath={`component.options.variants.${props.variants?.indexOf(
              filteredVariants[0]
            )}.blocks`}
            child
          />
        )}
      </div>
      <script
        nonce={khulnasoftStore.context.nonce}
        dangerouslySetInnerHTML={{
          __html: `
         window.__hydrated = window.__hydrated || {};
         window.__hydrated['${props.khulnasoftBlock?.id}'] = true;
        `.replace(/\s+/g, ' '),
        }}
      />
    </React.Fragment>
  );
}

Khulnasoft.registerComponent(PersonalizationContainer, {
  name: 'PersonalizationContainer',
  noWrap: true,
  friendlyName: 'Dynamic Container',
  image:
    'https://cdn.khulnasoft.com/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F37229ed30d8c41dfb10b8cca1992053a',
  canHaveChildren: true,
  inputs: [
    {
      name: 'variants',
      defaultValue: [],
      behavior: 'personalizationVariantList',
      type: 'list',
      subFields: [
        {
          name: 'name',
          type: 'text',
          localized: false,
        },
        {
          name: 'query',
          friendlyName: 'Targeting rules',
          type: 'KhulnasoftQuery',
          defaultValue: [],
          localized: false,
        },
        {
          name: 'startDate',
          type: 'date',
          localized: false,
        },
        {
          name: 'endDate',
          type: 'date',
          localized: false,
        },
        {
          name: 'blocks',
          type: 'UiBlocks',
          hideFromUI: true,
          defaultValue: [],
        },
      ],
    },
  ],
});

function getPersonalizationScript(
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) {
  return `
      (function() {
        function getCookie(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for(var i=0;i < ca.length;i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1,c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
          }
          return null;
        }
        function removeVariants() {
          variants.forEach(function (template, index) {
            document.querySelector('template[data-variant-id="' + "${blockId}" + index + '"]').remove();
          });
          document.getElementById('variants-script-${blockId}').remove();
        }

        var attributes = JSON.parse(getCookie("${Khulnasoft.attributesCookieName}") || "{}");
        ${locale ? `attributes.locale = "${locale}";` : ''}
        var variants = ${JSON.stringify(variants?.map(v => ({ query: v.query, startDate: v.startDate, endDate: v.endDate })))};
        var winningVariantIndex = variants.findIndex(function(variant) {
          return filterWithCustomTargeting(
            attributes,
            variant.query,
            variant.startDate,
            variant.endDate
          );
        });
        var isDebug = location.href.includes('khulnasoft.debug=true');
        if (isDebug) {
          console.debug('PersonalizationContainer', {
            attributes: attributes,
            variants: variants,
            winningVariantIndex: winningVariantIndex,
            });
        }
        if (winningVariantIndex !== -1) {
          var winningVariant = document.querySelector('template[data-variant-id="' + "${blockId}" + winningVariantIndex + '"]');
          if (winningVariant) {
            var parentNode = winningVariant.parentNode;
            var newParent = parentNode.cloneNode(false);
            newParent.appendChild(winningVariant.content.firstChild);
            parentNode.parentNode.replaceChild(newParent, parentNode);
            if (isDebug) {
              console.debug('PersonalizationContainer', 'Winning variant Replaced:', winningVariant);
            }
          }
        } else if (variants.length > 0) {
          removeVariants();
        }
        ${filterWithCustomTargetingScript}
      })();
    `.replace(/\s+/g, ' ');
}
