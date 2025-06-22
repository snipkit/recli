'use client';
import React, { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { jsx, css } from '@emotion/core';
import { KhulnasoftContent, getContentWithInfo } from './khulnasoft-content.component';
import { KhulnasoftBlocks } from './khulnasoft-blocks.component';
import {
  Khulnasoft,
  GetContentOptions,
  khulnasoft,
  Subscription,
  BehaviorSubject,
  KhulnasoftElement,
  KhulnasoftContent as Content,
  Component,
} from '@khulnasoft.com/sdk';
import { KhulnasoftStoreContext } from '../store/khulnasoft-store';
import hash from 'hash-sum';
import onChange from '../../lib/on-change';

export { onChange };

import { Breakpoints, getSizesForBreakpoints, Sizes } from '../constants/device-sizes.constant';
import {
  KhulnasoftAsyncRequestsContext,
  RequestOrPromise,
  RequestInfo,
  isRequestInfo,
} from '../store/khulnasoft-async-requests';
import { Url } from 'url';
import { debounceNextTick } from '../functions/debonce-next-tick';
import { throttle } from '../functions/throttle';
import { KhulnasoftMetaContext } from '../store/khulnasoft-meta';
import { tryEval } from '../functions/try-eval';
import { toError } from '../to-error';
import { getKhulnasoftPixel } from '../functions/get-khulnasoft-pixel';
import { isDebug } from '../functions/is-debug';

export type RegisteredComponent = Component & {
  component?: React.ComponentType<any>;
};

function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}
function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const ret: any = { ...obj };
  keys.forEach(key => {
    delete ret[key];
  });
  return ret;
}

const instancesMap = new Map<string, Khulnasoft>();

const wrapComponent = (info: any) => {
  return (props: any) => {
    // TODO: convention for all of this, like khulnasoftTagProps={{ style: {} foo: 'bar' }}
    const Tag = props.khulnasoftTag || 'div';
    const inputNames = ['children'].concat(
      info.inputs?.map((item: any) => item.name as string) || []
    );

    const baseProps = omit(props, ...inputNames, 'attributes');
    const inputProps = props; // pick(props, ...inputNames);

    if (info.noWrap) {
      return <info.class attributes={baseProps} {...inputProps} />;
    }

    return (
      <Tag {...baseProps}>
        <info.class {...inputProps} />
      </Tag>
    );
  };
};

const size = (thing: object) => Object.keys(thing).length;

function debounce(func: Function, wait: number, immediate = false) {
  let timeout: any;
  return function (this: any) {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

const fontsLoaded = new Set();

let fetch: (typeof globalThis)['fetch'];
if (globalThis.fetch) fetch = globalThis.fetch;
fetch ??= require('node-fetch');

const sizeMap = {
  desktop: 'large',
  tablet: 'medium',
  mobile: 'small',
  xsmall: 'xsmall',
};

const fetchCache: { [key: string]: any } = {};

export interface KhulnasoftComponentProps {
  /**
   * @package
   * @deprecated use {@link model} instead.
   * @hidden
   */
  modelName?: string;
  /**
   * Name of the model this is rendering content for. Default is "page".
   */
  model?: string;
  /**
   * @package
   * @deprecated use {@link model} instead.
   * @hidden
   */
  name?: string;
  /**
   * Data is passed along as `state.*` to the component.
   * @see {@link https://github.com/khulnasoft-lab/recli/tree/master/packages/react#passing-data-and-functions-down}
   *
   * @example
   * ```
   * <KhulnasoftComponent
   *  model="page"
   *  data={{
   *    products: productsList,
   *    myFunction: () => alert('Triggered!'),
   *    foo: 'bar'
   *  }} >
   * ```
   */
  data?: any;
  /**
   * Specific instance of Khulnasoft that should be used. You might use this for
   * server side rendering. It's generally not recommended except for very
   * advanced multi-tenant use cases.
   */
  khulnasoft?: Khulnasoft;
  /**
   * Content entry ID for this component to fetch client side
   */
  entry?: string;
  /**
   * @package
   *
   * Khulnasoft public API key.
   *
   * @see {@link khulnasoft.init()} for the preferred way of supplying your API key.
   */
  apiKey?: string;
  /**
   * @private
   * @hidden
   */
  codegen?: boolean;
  options?: GetContentOptions;
  /**
   * Function callback invoked with `data` and your content when it becomes
   * available.
   *
   * @see {@link https://github.com/khulnasoft-lab/recli/tree/master/packages/react#passing-data-and-functions-down}
   */
  contentLoaded?: (data: any, content: Content) => void;
  /**
   * Instead of having Khulnasoft render a link for you with plain anchor
   * elements, use your own function. Useful when using Next.js, Gatsby, or
   * other client side routers' custom `<Link>` components.
   *
   * ## Notes
   *
   * This must be a function that returns JSX, not a component!
   *
   * ## Examples
   *
   * @see {@link https://github.com/khulnasoft-lab/recli/blob/0f0bc1ca835335f99fc21efb20ff3c4836bc9f41/examples/next-js-khulnasoft-site/src/functions/render-link.tsx#L6}
   */
  renderLink?: (props: React.AnchorHTMLAttributes<any>) => React.ReactNode;
  /**
   * Callback to run if an error occurred while fetching content.
   */
  contentError?: (error: any) => void;
  /**
   * Manually specify what Khulnasoft content JSON object to render. @see {@link
   * https://github.com/khulnasoft-lab/recli/tree/master/packages/react#passing-content-manually}
   */
  content?: Content;
  /**
   * @package
   * @hidden
   *
   * Location object that provides the current url, path, etc; for server side
   * rendering.
   */
  location?: Location | Url;
  /**
   * Callback to run when Khulnasoft state changes (e.g. state.foo = 'bar' in an
   * action)
   */
  onStateChange?: (newData: any) => void;
  /**
   * @package
   * @deprecated
   * @hidden
   */
  noAsync?: boolean;
  /**
   * @package
   * @hidden
   *
   * Flag to render email content (small differences in our render logic for
   * email support).
   */
  emailMode?: boolean;
  /**
   * @package
   * @hidden
   *
   * Flag to render amp content (small differences in our render logic for amp
   * support)
   */
  ampMode?: boolean;
  /**
   * @package
   * @hidden
   *
   * Render content in-line only (can't passed from the content prop) don't
   * fetch content from our API.
   */
  inlineContent?: boolean;
  /**
   * @package
   * @deprecated
   * @hidden
   */
  khulnasoftBlock?: KhulnasoftElement;
  /**
   * @package
   * @deprecated
   * @hidden
   */
  dataOnly?: boolean;
  /**
   * @package
   * @deprecated
   * @hidden
   */
  hydrate?: boolean;
  /**
   * @package
   * @deprecated use {@link Khulnasoft.isStatic} instead
   * @hidden
   */
  isStatic?: boolean;
  /**
   * Object that will be available in actions and bindings.
   *
   * @see {@link https://github.com/khulnasoft-lab/recli/tree/master/packages/react#passing-data-and-functions-down}
   */
  context?: any;
  /**
   * @deprecated
   * @hidden
   */
  url?: string;
  /**
   * @hidden
   * Set to true if this is not the root content component, for instance for symbols
   */
  isChild?: boolean;
  /**
   * Set to true to not call `event.stopPropagation()` in the editor to avoid
   * issues with client site routing triggering when editing in Khulnasoft, causing
   * navigation to other pages unintended
   */
  stopClickPropagationWhenEditing?: boolean;

  /**
   * Set to the current locale in your application if you want localized inputs to be auto-resolved, should match one of the locales keys in your space settings
   * Learn more about adding or removing locales [here](https://www.khulnasoft.com/c/docs/add-remove-locales)
   */
  locale?: string;

  /**
   * Pass a list of custom components to register with Khulnasoft.com.
   */
  customComponents?: Array<RegisteredComponent>;

  /**
   * CSP nonce to allow the loading and execution of a script or style tag when Content-Security-Policy is enabled.
   */
  nonce?: string;
}

export interface KhulnasoftComponentState {
  state: any;
  update: (state: any) => any;
  updates: number;
  context: any;
  key: number;
  breakpoints?: Breakpoints;
}

interface KhulnasoftRequest {
  '@type': '@khulnasoft.com/core:Request';
  request: {
    url: string;
    query?: { [key: string]: string };
    headers?: { [key: string]: string };
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
  };
  options?: { [key: string]: any };
  bindings?: { [key: string]: string };
}

function searchToObject(location: Location | Url) {
  const pairs = (location.search || '').substring(1).split('&');
  const obj: { [key: string]: string } = {};

  for (const i in pairs) {
    if (!(pairs[i] && typeof pairs[i] === 'string')) {
      continue;
    }
    const pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}

/**
 * Responsible for rendering Khulnasoft content of type: 'page' or 'section' to
 * react components. It will attempt to fetch content from the API based on
 * defined user attributes (URL path, device type, and any custom targeting you set using `khulnasoft.setUserAttributes`) unless a `KhulnasoftContent`
 * object is provided to `props.content`
 *
 * Use it to mount content in desired location, enable editing in place when
 * previewed in the editor.
 *
 * Supports server-side-rendering when passed the content json as
 * `props.content`.
 */
export class KhulnasoftComponent extends React.Component<
  PropsWithChildren<KhulnasoftComponentProps>,
  KhulnasoftComponentState
> {
  static defaults: Pick<KhulnasoftComponentProps, 'codegen'> = {
    codegen: Boolean(Khulnasoft.isBrowser && location.href.includes('khulnasoft.codegen=true')),
  };

  subscriptions: Subscription = new Subscription();
  // TODO: don't trigger initial one?
  onStateChange = new BehaviorSubject<any>(null);
  asServer = Khulnasoft.isServer;

  contentRef: KhulnasoftContent | null = null;

  styleRef: HTMLStyleElement | null = null;

  rootState = Khulnasoft.isServer ? {} : onChange({}, () => this.updateState());

  lastJsCode = '';
  lastHttpRequests: { [key: string]: string | undefined } = {};
  httpSubscriptionPerKey: { [key: string]: Subscription | undefined } = {};
  firstLoad = true;
  ref: HTMLElement | null = null;

  Component: any;

  get options() {
    // TODO: for perf cache this
    return {
      ...KhulnasoftComponent.defaults,
      ...this.props,
    };
  }

  get name(): string | undefined {
    return this.props.model || this.props.modelName || this.props.name; // || this.props.model
  }

  private _asyncRequests?: RequestOrPromise[];
  private _errors?: Error[];
  private _logs?: string[];
  private sizes: Sizes;

  get element() {
    return this.ref;
  }

  get inlinedContent() {
    if (this.isPreviewing && !this.props.inlineContent) {
      return undefined;
    }
    return this.props.content;
  }

  constructor(props: KhulnasoftComponentProps) {
    super(props);

    let _content: any = this.inlinedContent;
    if (_content && _content.content) {
      _content = _content.content;
    }

    this.sizes = getSizesForBreakpoints(_content?.meta?.breakpoints || {});

    // TODO: pass this all the way down - symbols, etc
    // this.asServer = Boolean(props.hydrate && Khulnasoft.isBrowser)
    const contentData = this.inlinedContent?.data;
    if (contentData && Array.isArray(contentData.inputs) && contentData.inputs.length > 0) {
      if (!contentData.state) {
        contentData.state = {};
      }
      // set default values of content inputs on state
      contentData.inputs.forEach((input: any) => {
        if (input) {
          if (
            input.name &&
            input.defaultValue !== undefined &&
            contentData.state![input.name] === undefined
          ) {
            contentData.state![input.name] = input.defaultValue;
          }
        }
      });
    }
    this.state = {
      // TODO: should change if this prop changes
      context: {
        ...props.context,
        apiKey: this.props.apiKey || khulnasoft.apiKey,
        nonce: this.props.nonce,
      },
      state: Object.assign(this.rootState, {
        ...(this.inlinedContent && this.inlinedContent.data && this.inlinedContent.data.state),
        isBrowser: Khulnasoft.isBrowser, // !this.asServer,
        isServer: !Khulnasoft.isBrowser, // this.asServer,
        _hydrate: props.hydrate,
        location: this.locationState,
        deviceSize: this.deviceSizeState,
        // TODO: will user attributes be ready here?
        device: this.device,
        ...this.getHtmlData(),
        ...props.data,
      }),
      updates: 0,
      key: 0,
      update: this.updateState,
    };

    const key = this.props.apiKey;
    if (key && key !== this.khulnasoft.apiKey && !instancesMap.has(key)) {
      // We create a khulnasoft instance for each api key to support loading of symbols from other spaces
      const instance = new Khulnasoft(key, undefined, undefined, true);
      instancesMap.set(key, instance);
    }

    if (this.inlinedContent) {
      // Sometimes with graphql we get the content as `content.content`
      const content = (this.inlinedContent as any).content || this.inlinedContent;
      this.onContentLoaded(content?.data, getContentWithInfo(content)!);
    }

    this.registerCustomComponents();
  }

  get khulnasoft() {
    const instance = this.props.apiKey && instancesMap.get(this.props.apiKey);
    return instance || this.props.khulnasoft || khulnasoft;
  }

  getHtmlData() {
    const id = (this.inlinedContent && this.inlinedContent.id) || this.props.entry;
    const script =
      id &&
      Khulnasoft.isBrowser &&
      document.querySelector(
        `script[data-khulnasoft-json="${id}"],script[data-khulnasoft-state="${id}"]`
      );
    if (script) {
      try {
        const json = JSON.parse((script as HTMLElement).innerText);
        return json;
      } catch (err) {
        console.warn(
          'Could not parse Khulnasoft.com HTML data transfer',
          err,
          (script as HTMLElement).innerText
        );
      }
    }
    return {};
  }

  // TODO: pass down with context
  get device() {
    return this.khulnasoft.getUserAttributes().device || 'desktop';
  }

  get locationState() {
    return {
      // TODO: handle this correctly on the server. Pass in with CONTEXT
      ...pick(this.location, 'pathname', 'hostname', 'search', 'host'),
      path: (this.location.pathname && this.location.pathname.split('/').slice(1)) || '',
      query: searchToObject(this.location),
    };
  }

  // TODO: trigger state change on screen size change
  get deviceSizeState() {
    // TODO: use context to pass this down on server
    return Khulnasoft.isBrowser
      ? this.sizes.getSizeForWidth(window.innerWidth)
      : sizeMap[this.device] || 'large';
  }

  messageListener = (event: MessageEvent) => {
    const isTrusted = Khulnasoft.isTrustedHostForEvent(event);
    if (!isTrusted) return;

    const info = event.data;
    switch (info.type) {
      case 'khulnasoft.configureSdk': {
        const data = info.data;

        if (!data.contentId || data.contentId !== this.useContent?.id) {
          return;
        }

        this.sizes = getSizesForBreakpoints(data.breakpoints || {});

        this.setState({
          state: Object.assign(this.rootState, {
            deviceSize: this.deviceSizeState,
            // TODO: will user attributes be ready here?
            device: this.device,
          }),
          updates: ((this.state && this.state.updates) || 0) + 1,
          breakpoints: data.breakpoints,
        });

        break;
      }

      case 'khulnasoft.updateSpacer': {
        const data = info.data;
        const currentSpacer = this.rootState._spacer;
        this.updateState(state => {
          state._spacer = data;
        });
        break;
      }
      case 'khulnasoft.resetState': {
        const { state, model } = info.data;
        if (model === this.name) {
          for (const key in this.rootState) {
            // TODO: support nested functions (somehow)
            if (typeof this.rootState[key] !== 'function') {
              delete this.rootState[key];
            }
          }
          Object.assign(this.rootState, state);
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1,
          });
        }
        break;
      }
      case 'khulnasoft.resetSymbolState': {
        const { state, model, id } = info.data.state;
        if (this.props.khulnasoftBlock && this.props.khulnasoftBlock === id) {
          for (const key in this.rootState) {
            delete this.rootState[key];
          }
          Object.assign(this.rootState, state);
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1,
          });
        }
        break;
      }
    }
  };

  resizeFn = () => {
    const deviceSize = this.deviceSizeState;
    if (deviceSize !== this.state.state.deviceSize) {
      this.setState({
        ...this.state,
        updates: ((this.state && this.state.updates) || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          deviceSize,
        }),
      });
    }
  };

  resizeListener = Khulnasoft.isEditing
    ? throttle(this.resizeFn, 200)
    : debounce(this.resizeFn, 400);

  static renderInto(
    elementOrSelector: string | HTMLElement,
    props: KhulnasoftComponentProps = {},
    hydrate = true,
    fresh = false
  ) {
    console.debug('KhulnasoftPage.renderInto', elementOrSelector, props, hydrate, this);

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

    if (!element) {
      return;
    }

    const exists = element.classList.contains('khulnasoft-hydrated');
    if (exists && !fresh) {
      console.debug('Tried to hydrate multiple times');
      return;
    }
    element.classList.add('khulnasoft-hydrated');

    let shouldHydrate = hydrate && element.innerHTML.includes('khulnasoft-block');

    if (!element.classList.contains('khulnasoft-component')) {
      // TODO: maybe remove any khulnasoft-api-styles...
      const apiStyles =
        element.querySelector('.khulnasoft-api-styles') ||
        (element.previousElementSibling &&
        element.previousElementSibling.matches('.khulnasoft-api-styles')
          ? element.previousElementSibling
          : null);
      let keepStyles = '';
      if (apiStyles) {
        const html = apiStyles.innerHTML;
        html.replace(
          /\/\*start:([^\*]+?)\*\/([\s\S]*?)\/\*end:([^\*]+?)\*\//g,
          (match, id, content) => {
            let el: HTMLElement | null = null;
            try {
              el = document.querySelector(`[data-emotion-css="${id}"]`);
            } catch (err) {
              console.warn(err);
            }
            if (el) {
              el.innerHTML = content;
            } else if (!Khulnasoft.isEditing) {
              keepStyles += match;
            }

            return match;
          }
        );
        // NextTick? or longer timeout?
        Khulnasoft.nextTick(() => {
          apiStyles.innerHTML = keepStyles;
        });
      }
      const useElement = element.querySelector('.khulnasoft-component');
      if (useElement) {
        element = useElement;
      } else {
        shouldHydrate = false;
      }
    }

    if (location.search.includes('khulnasoft.debug=true')) {
      console.debug('hydrate', shouldHydrate, element);
    }

    let useEl = element;
    if (!exists) {
      const div = document.createElement('div');
      element.insertAdjacentElement('beforebegin', div);
      div.appendChild(element);
      useEl = div;
    }

    if (
      Khulnasoft.isEditing ||
      (Khulnasoft.isBrowser && location.search.includes('khulnasoft.preview='))
    ) {
      shouldHydrate = false;
    }
    if (shouldHydrate && element) {
      // TODO: maybe hydrate again. Maybe...
      const val = ReactDOM.render(
        <KhulnasoftComponent {...props} />,
        useEl,
        (useEl as any).khulnasoftRootRef
      );
      (useEl as any).khulnasoftRootRef = val;
      return val;
    }
    const val = ReactDOM.render(
      <KhulnasoftComponent {...props} />,
      useEl,
      (useEl as any).khulnasoftRootRef
    );
    (useEl as any).khulnasoftRootRef = val;
    return val;
  }

  mounted = false;

  registerCustomComponents() {
    if (this.props.customComponents) {
      for (const customComponent of this.props.customComponents) {
        if (customComponent) {
          const { component, ...registration } = customComponent;
          Khulnasoft.registerComponent(component, registration);
        }
      }
    }
  }

  componentDidMount() {
    this.mounted = true;
    if (this.asServer) {
      this.asServer = false;
      this.updateState(state => {
        state.isBrowser = true;
        state.isServer = false;
      });
    }

    if (Khulnasoft.isIframe) {
      window.parent?.postMessage(
        {
          type: 'khulnasoft.sdkInjected',
          data: { modelName: this.name, apiKey: this.props.apiKey || khulnasoft.apiKey },
        },
        '*'
      );
    }

    if (Khulnasoft.isBrowser) {
      // TODO: remove event on unload
      window.addEventListener('resize', this.resizeListener);
      if (Khulnasoft.isEditing) {
        window.addEventListener('message', this.messageListener);
      }

      if (Khulnasoft.isEditing || Khulnasoft.isPreviewing) {
        Khulnasoft.nextTick(() => {
          this.firstLoad = false;
          this.reload();
        });
      }

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('khulnasoft:component:load', {
            detail: {
              ref: this,
            },
          })
        );
      });
    }
  }

  updateState = (fn?: (state: any) => void) => {
    const state = this.rootState;
    if (fn) {
      fn(state);
    }
    if (this.mounted) {
      this.setState({
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1,
      });
    } else {
      this.state = {
        ...this.state,
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1,
      };
    }

    this.notifyStateChange();
  };

  get isPreviewing() {
    return (
      (Khulnasoft.isServer ||
        (Khulnasoft.isBrowser && Khulnasoft.isPreviewing && !this.firstLoad)) &&
      (khulnasoft.previewingModel === this.name ||
        khulnasoft.previewingModel === 'KHULNASOFT_STUDIO')
    );
  }

  @debounceNextTick
  notifyStateChange() {
    if (Khulnasoft.isServer) {
      return;
    }
    if (!(this && this.state)) {
      return;
    }
    const nextState = this.state.state;
    // TODO: only run the below once per tick...
    if (this.props.onStateChange) {
      this.props.onStateChange(nextState);
    }

    if (Khulnasoft.isBrowser) {
      window.dispatchEvent(
        new CustomEvent('khulnasoft:component:stateChange', {
          detail: {
            state: nextState,
            ref: this,
          },
        })
      );
    }
    this.onStateChange.next(nextState);
  }

  processStateFromApi(state: { [key: string]: any }) {
    return state; //  mapValues(state, value => tryEval(value, this.data, this._errors))
  }

  get location() {
    return this.props.location || (Khulnasoft.isBrowser ? location : ({} as any));
  }

  getCssFromFont(font: any, data?: any) {
    // TODO: compute what font sizes are used and only load those.......
    const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
    const name = family.split(',')[0];
    const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
    let str = '';
    if (url && family && name) {
      str += `
@font-face {
  font-family: "${family}";
  src: local("${name}"), url('${url}') format('woff2');
  font-display: fallback;
  font-weight: 400;
}
        `.trim();
    }

    if (font.files) {
      for (const weight in font.files) {
        const isNumber = String(Number(weight)) === weight;
        if (!isNumber) {
          continue;
        }
        // TODO: maybe limit number loaded
        const weightUrl = font.files[weight];
        if (weightUrl && weightUrl !== url) {
          str += `
@font-face {
  font-family: "${family}";
  src: url('${weightUrl}') format('woff2');
  font-display: fallback;
  font-weight: ${weight};
}
          `.trim();
        }
      }
    }
    return str;
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (Khulnasoft.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
      window.removeEventListener('message', this.messageListener);
    }
  }

  getFontCss(data?: any) {
    if (!this.khulnasoft.allowCustomFonts) {
      return '';
    }
    // TODO: separate internal data from external
    return (
      (data?.customFonts &&
        data.customFonts.length &&
        data.customFonts.map((font: any) => this.getCssFromFont(font, data)).join(' ')) ||
      ''
    );
  }

  ensureFontsLoaded(data?: any) {
    if (this.khulnasoft.allowCustomFonts && data?.customFonts && Array.isArray(data.customFonts)) {
      for (const font of data.customFonts) {
        const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
        if (!fontsLoaded.has(url)) {
          const html = this.getCssFromFont(font, data);
          fontsLoaded.add(url);
          if (!html) {
            continue;
          }
          const style = document.createElement('style');
          style.className = 'khulnasoft-custom-font';
          style.setAttribute('data-khulnasoft-custom-font', url);
          style.innerHTML = html;
          document.head.appendChild(style);
        }
      }
    }
  }

  getCss(data?: any) {
    const contentId = this.useContent?.id;
    let cssCode = data?.cssCode || '';
    if (contentId) {
      // Allow using `&` in custom CSS code like @emotion
      // E.g. `& .foobar { ... }` to scope CSS
      // TODO: handle if '&' is within a string like `content: "&"`
      cssCode = cssCode.replace(/&/g, `.khulnasoft-component-${contentId}`);
    }

    return cssCode + this.getFontCss(data);
  }

  get data() {
    const data = {
      ...(this.inlinedContent && this.inlinedContent.data?.state),
      ...this.externalState,
      ...this.state.state,
    };
    Object.assign(this.rootState, data);
    return data;
  }

  componentDidUpdate(prevProps: KhulnasoftComponentProps) {
    // TODO: shallow diff
    if (this.props.data && prevProps.data !== this.props.data) {
      this.state.update((state: any) => {
        Object.assign(state, this.externalState);
      });
    }

    if (this.props.customComponents && this.props.customComponents !== prevProps.customComponents) {
      this.registerCustomComponents();
    }

    if (Khulnasoft.isEditing) {
      if (this.inlinedContent && prevProps.content !== this.inlinedContent) {
        this.onContentLoaded(this.inlinedContent.data, this.inlinedContent);
      }
    }
  }

  // FIXME: workaround to issue with CSS extraction and then hydration
  // (might be preact only)
  checkStyles(data: any) {
    if (this.styleRef) {
      const css = this.getCss(data);
      if (this.styleRef.innerHTML !== css) {
        this.styleRef.innerHTML = css;
      }
    }
  }

  reload() {
    this.setState({
      key: this.state.key + 1,
    });
  }

  get content() {
    let content = this.inlinedContent;
    if (content && (content as any).content) {
      // GraphQL workaround
      content = {
        ...content,
        data: (content as any).content,
      };
    }
    return content;
  }

  get externalState() {
    return {
      ...this.props.data,
      ...(this.props.locale ? { locale: this.props.locale } : {}),
    };
  }

  get useContent() {
    return this.content || this.state.context.khulnasoftContent;
  }

  render() {
    const content = this.content;

    const dataString =
      Khulnasoft.isBrowser &&
      this.externalState &&
      size(this.externalState) &&
      hash(this.externalState);
    let key = Khulnasoft.isEditing ? this.name : this.props.entry;
    if (key && !Khulnasoft.isEditing && dataString && dataString.length < 300) {
      key += ':' + dataString;
    }

    const WrapComponent = this.props.dataOnly ? React.Fragment : 'div';

    const contentId = this.useContent?.id;

    return (
      // TODO: data attributes for model, id, etc?
      <WrapComponent
        onClick={event => {
          // Prevent propagation from the root content component when editing to prevent issues
          // like client side routing triggering when links are clicked, unless this behavior is
          // disabled with the stopClickPropagationWhenEditing prop
          if (
            Khulnasoft.isEditing &&
            !this.props.isChild &&
            !this.props.stopClickPropagationWhenEditing
          ) {
            event.stopPropagation();
          }
        }}
        className={`khulnasoft-component ${contentId ? `khulnasoft-component-${contentId}` : ''}`}
        data-name={this.name}
        data-source="Rendered by Khulnasoft.com"
        key={this.state.key}
        ref={ref => (this.ref = ref)}
      >
        <KhulnasoftMetaContext.Consumer>
          {value => (
            <KhulnasoftMetaContext.Provider
              value={
                typeof this.props.ampMode === 'boolean'
                  ? {
                      ...value,
                      ampMode: this.props.ampMode,
                    }
                  : value
              }
            >
              <KhulnasoftAsyncRequestsContext.Consumer>
                {value => {
                  this._asyncRequests = value && value.requests;
                  this._errors = value && value.errors;
                  this._logs = value && value.logs;

                  return (
                    <KhulnasoftContent
                      isStatic={this.props.isStatic || Khulnasoft.isStatic}
                      key={
                        this.inlinedContent?.id ||
                        ('content' in this.props && !this.isPreviewing
                          ? 'null-content-prop'
                          : 'no-content-prop')
                      }
                      khulnasoft={this.khulnasoft}
                      ref={ref => (this.contentRef = ref)}
                      // TODO: pass entry in
                      contentLoaded={(data, content) => this.onContentLoaded(data, content)}
                      options={{
                        key,
                        entry: this.props.entry,
                        ...(content && { initialContent: [content] }),
                        ...(!content &&
                          'content' in this.props &&
                          !this.isPreviewing && { initialContent: [] }),
                        ...(this.props.url && { url: this.props.url }),
                        ...this.props.options,
                        ...(this.props.locale ? { locale: this.props.locale } : {}),
                        ...(this.options.codegen && {
                          format: 'react',
                        }),
                      }}
                      inline={
                        this.props.inlineContent || (!this.isPreviewing && 'content' in this.props)
                      }
                      contentError={this.props.contentError}
                      modelName={this.name || 'page'}
                      nonce={this.props.nonce}
                    >
                      {(data, loading, fullData) => {
                        if (this.props.dataOnly) {
                          return null;
                        }
                        if (fullData && fullData.id) {
                          if (this.state.breakpoints) {
                            fullData.meta = fullData.meta || {};
                            fullData.meta.breakpoints = this.state.breakpoints;
                          }
                          this.state.context.khulnasoftContent = fullData;
                        }
                        if (Khulnasoft.isBrowser) {
                          Khulnasoft.nextTick(() => {
                            this.checkStyles(data);
                          });
                        }

                        const { codegen } = this.options;

                        if (codegen && !this.Component && data?.blocksJs) {
                          const khulnasoftComponentNames: string[] = Array.from(
                            new Set(Khulnasoft.components.map((item: any) => item.name))
                          );
                          const reversedcomponents = Khulnasoft.components.slice().reverse();

                          const khulnasoftComponents = khulnasoftComponentNames.map(name =>
                            reversedcomponents.find((item: any) => item.class && item.name === name)
                          );

                          const useKhulnasoftState = (initialState: any) => {
                            const [, setTick] = React.useState(0);
                            const [state] = React.useState(() =>
                              onChange(initialState, function () {
                                setTick(tick => tick + 1);
                              })
                            );

                            return state;
                          };

                          const mappedComponentNames = khulnasoftComponentNames.map(name =>
                            (name || '').replace(/[^\w]+/gi, '')
                          );

                          const finalizedComponents = khulnasoftComponents.map(info =>
                            wrapComponent(info)
                          );

                          this.Component = new Function(
                            'jsx',
                            '_css',
                            'Khulnasoft',
                            'khulnasoft',
                            'React',
                            'useKhulnasoftState',
                            ...mappedComponentNames,
                            data.blocksJs
                          )(
                            jsx,
                            css,
                            Khulnasoft,
                            khulnasoft,
                            React,
                            useKhulnasoftState,
                            ...finalizedComponents
                          );
                        }

                        const blocks = data?.blocks || [];

                        const hasPixel = blocks.find((block: KhulnasoftElement) =>
                          block.id?.startsWith('khulnasoft-pixel')
                        );

                        if (data && !hasPixel && blocks.length > 0) {
                          blocks.push(getKhulnasoftPixel(khulnasoft.apiKey!));
                        }

                        // TODO: loading option - maybe that is what the children is or component prop
                        // TODO: get rid of all these wrapper divs
                        return data ? (
                          <div
                            data-khulnasoft-component={this.name}
                            data-khulnasoft-content-id={fullData.id}
                            {...(this.isPreviewing
                              ? {
                                  'data-khulnasoft-variation-id':
                                    fullData.testVariationId || fullData.variationId || fullData.id,
                                }
                              : {})}
                          >
                            {!codegen && this.getCss(data) && (
                              <style
                                nonce={this.props.nonce}
                                ref={ref => (this.styleRef = ref)}
                                className="khulnasoft-custom-styles"
                                dangerouslySetInnerHTML={{
                                  __html: this.getCss(data),
                                }}
                              />
                            )}
                            <KhulnasoftStoreContext.Provider
                              value={{
                                ...this.state,
                                rootState: this.rootState,
                                state: this.data,
                                content: fullData,
                                renderLink: this.props.renderLink,
                              }}
                            >
                              {codegen && this.Component ? (
                                <this.Component data={this.data} context={this.state.context} />
                              ) : (
                                <KhulnasoftBlocks
                                  key={String(!!data?.blocks?.length)}
                                  emailMode={this.props.emailMode}
                                  fieldName="blocks"
                                  blocks={blocks}
                                />
                              )}
                            </KhulnasoftStoreContext.Provider>
                          </div>
                        ) : loading ? (
                          <div data-khulnasoft-component={this.name} className="khulnasoft-loading">
                            {this.props.children}
                          </div>
                        ) : (
                          <div
                            data-khulnasoft-component={this.name}
                            className="khulnasoft-no-content"
                          />
                        );
                      }}
                    </KhulnasoftContent>
                  );
                }}
              </KhulnasoftAsyncRequestsContext.Consumer>
            </KhulnasoftMetaContext.Provider>
          )}
        </KhulnasoftMetaContext.Consumer>
      </WrapComponent>
    );
  }

  evalExpression(expression: string) {
    const { data } = this;
    return String(expression).replace(/{{([^}]+)}}/g, (match, group) =>
      tryEval(group, data, this._errors)
    );
  }

  async handleRequest(
    propertyName: string,
    httpRequest: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
    }
  ) {
    const { url, method, body, headers } = httpRequest;

    const fetchCacheKey = JSON.stringify({ url, method, body, headers });
    // TODO: Khulnasoft.isEditing = just checks if iframe and parent page is this.khulnasoft.com or localhost:1234
    if (Khulnasoft.isIframe && fetchCache[fetchCacheKey]) {
      this.updateState(ctx => {
        ctx[propertyName] = fetchCache[fetchCacheKey];
      });
      return fetchCache[fetchCacheKey];
    }
    const request = async () => {
      const requestStart = Date.now();
      if (!Khulnasoft.isBrowser) {
        console.time('Fetch ' + fetchCacheKey);
      }
      let json: any;
      try {
        const fetchOptions = {
          method,
          headers,
          body,
        };
        if (method === 'GET') {
          delete fetchOptions.body;
        }
        const result = await fetch(url, fetchOptions);
        json = await result.json();
      } catch (err) {
        const error = toError(err);
        if (this._errors) {
          this._errors.push(error);
        }
        if (this._logs) {
          this._logs.push(`Fetch to ${fetchCacheKey} errored in ${Date.now() - requestStart}ms`);
        }
        return;
      } finally {
        if (!Khulnasoft.isBrowser) {
          console.timeEnd('Fetch ' + fetchCacheKey);
          if (this._logs) {
            this._logs.push(`Fetched ${fetchCacheKey} in ${Date.now() - requestStart}ms`);
          }
        }
      }

      if (json) {
        if (Khulnasoft.isIframe) {
          fetchCache[fetchCacheKey] = json;
        }
        // TODO: debounce next tick all of these when there are a bunch
        this.updateState(ctx => {
          ctx[propertyName] = json;
        });
      }

      return json;
    };
    const existing =
      this._asyncRequests &&
      (this._asyncRequests.find(
        req => isRequestInfo(req) && req.url === url
      ) as RequestInfo | null);
    if (existing) {
      const promise = existing.promise;
      promise.then(json => {
        if (json) {
          this.updateState(ctx => {
            ctx[propertyName] = json;
          });
        }
      });
      return promise;
    }
    const promise = request();
    Khulnasoft.nextTick(() => {
      if (this._asyncRequests) {
        this._asyncRequests.push(promise);
      }
    });
    return promise;
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }
  }

  handleKhulnasoftRequest(propertyName: string, optionsString: string) {
    const options = tryEval(optionsString, this.data, this._errors);
    // TODO: this will screw up for multiple bits of data
    if (this.subscriptions) {
      this.unsubscribe();
    }
    // TODO: don't unsubscribe and resubscribe every time data changes, will make a TON of requests if that's the case when editing...
    // I guess will be cached then
    if (options) {
      // TODO: unsubscribe on destroy
      this.subscriptions.add(
        this.khulnasoft.queueGetContent(options.model, options).subscribe(matches => {
          if (matches) {
            this.updateState(ctx => {
              ctx[propertyName] = matches;
            });
          }
        })
      );
    }
  }

  onContentLoaded = (data: any, content: Content) => {
    if (this.name === 'page' && Khulnasoft.isBrowser) {
      if (data) {
        const { title, pageTitle, description, pageDescription } = data;

        if (title || pageTitle) {
          document.title = title || pageTitle;
        }

        if (description || pageDescription) {
          let descriptionTag = document.querySelector('meta[name="description"]');

          if (!descriptionTag) {
            descriptionTag = document.createElement('meta');
            descriptionTag.setAttribute('name', 'description');
            document.head.appendChild(descriptionTag);
          }

          descriptionTag.setAttribute('content', description || pageDescription);
        }
      }
    }

    if (Khulnasoft.isEditing) {
      this.notifyStateChange();
    }

    if (this.props.contentLoaded) {
      this.props.contentLoaded(data, content);
    }

    if (data && data.inputs && Array.isArray(data.inputs) && data.inputs.length) {
      if (!data.state) {
        data.state = {};
      }

      data.inputs.forEach((input: any) => {
        if (input) {
          if (
            input.name &&
            input.defaultValue !== undefined &&
            data.state[input.name] === undefined
          ) {
            data.state[input.name] = input.defaultValue;
          }
        }
      });
    }

    if (data && data.state) {
      const newState = {
        ...this.state,
        updates: ((this.state && this.state.updates) || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          location: this.locationState,
          device: this.device,
          ...data.state,
          ...this.externalState,
          deviceSize: this.deviceSizeState,
        }),
      };
      if (this.mounted) {
        this.setState(newState);
      } else {
        this.state = newState;
      }
    }

    // TODO: also throttle on edits maybe
    if (data && data.jsCode && !this.options.codegen) {
      // Don't rerun js code when editing and not changed
      let skip = false;
      if (Khulnasoft.isEditing) {
        if (this.lastJsCode === data.jsCode) {
          skip = true;
        } else {
          this.lastJsCode = data.jsCode;
        }
      }

      if (!skip) {
        const state = this.state.state;

        // TODO: real editing method
        try {
          const result = new Function(
            'data',
            'ref',
            'state',
            'update',
            'element',
            'Khulnasoft',
            'khulnasoft',
            'context',
            data.jsCode
          )(
            data,
            this,
            state,
            this.state.update,
            this.ref,
            Khulnasoft,
            khulnasoft,
            this.state.context
          );

          // TODO: allow exports = { } syntax?
          // TODO: do something with reuslt like view - methods, computed, actions, properties, template, etc etc
        } catch (err) {
          const error = toError(err);
          if (Khulnasoft.isBrowser) {
            console.warn(
              'Khulnasoft custom code error:',
              error.message,
              'in',
              data.jsCode,
              error.stack
            );
          } else {
            if (isDebug()) {
              console.debug(
                'Khulnasoft custom code error:',
                error.message,
                'in',
                data.jsCode,
                error.stack
              );
            }
            // Add to req.options.errors to return to client
          }
        }
      }
    }

    if (data && data.httpRequests /* || data.khulnasoftData @DEPRECATED */ && !this.props.noAsync) {
      // Don't rerun http requests when editing and not changed
      // No longer needed?
      let skip = false;

      if (!skip) {
        // TODO: another structure for this
        for (const key in data.httpRequests) {
          const httpRequest: KhulnasoftRequest | string | undefined = data.httpRequests[key];
          if (httpRequest && (!this.data[key] || Khulnasoft.isEditing)) {
            const isCoreRequest =
              typeof httpRequest === 'object' &&
              httpRequest['@type'] === '@khulnasoft.com/core:Request';
            if (Khulnasoft.isBrowser) {
              const finalUrl = isCoreRequest
                ? this.evalExpression(httpRequest.request.url)
                : this.evalExpression(httpRequest as string);

              if (Khulnasoft.isEditing && this.lastHttpRequests[key] === finalUrl) {
                continue;
              }
              this.lastHttpRequests[key] = finalUrl;

              if (isCoreRequest) {
                this.handleRequest(key, {
                  url: finalUrl,
                  method: httpRequest.request.method,
                  body: httpRequest.request.body,
                  headers: httpRequest.request.headers,
                });
              } else {
                this.handleRequest(key, {
                  url: finalUrl,
                  method: 'GET',
                });
              }
              const currentSubscription = this.httpSubscriptionPerKey[key];
              if (currentSubscription) {
                currentSubscription.unsubscribe();
              }

              // TODO: fix this
              const newSubscription = (this.httpSubscriptionPerKey[key] =
                this.onStateChange.subscribe(() => {
                  const newUrl = isCoreRequest
                    ? this.evalExpression(httpRequest.request.url)
                    : this.evalExpression(httpRequest as string);
                  if (newUrl !== finalUrl) {
                    if (isCoreRequest) {
                      this.handleRequest(key, {
                        url: newUrl,
                        method: httpRequest.request.method,
                        body: httpRequest.request.body,
                        headers: httpRequest.request.headers,
                      });
                    } else {
                      this.handleRequest(key, {
                        url: newUrl,
                        method: 'GET',
                      });
                    }
                    this.lastHttpRequests[key] = newUrl;
                  }
                }));
              this.subscriptions.add(newSubscription);
            } else {
              if (isCoreRequest) {
                this.handleRequest(key, {
                  url: this.evalExpression(httpRequest.request.url),
                  method: httpRequest.request.method,
                  body: httpRequest.request.body,
                  headers: httpRequest.request.headers,
                });
              } else {
                this.handleRequest(key, {
                  url: this.evalExpression(httpRequest as string),
                  method: 'GET',
                });
              }
            }
          }
        }
      }
    }
  };
}
