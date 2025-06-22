# Khulnasoft.com React SDK

NOTE: If you want to register your React Server Components as custom components in Khulnasoft, you will need to use our experimental NextJS SDK [here](https://github.com/khulnasoft-lab/recli/tree/main/packages/sdks/output/nextjs).

## Integration

See our full [getting started docs](https://www.khulnasoft.com/c/docs/developers), or jump right into integration. We generally recommend to start with page building as your initial integration:

<table>
  <tr>
    <td align="center">Integrate Page Building</td>
    <td align="center">Integrate Section Building</td>
    <td align="center">Integrate CMS Data</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.khulnasoft.com/c/docs/integrating-khulnasoft-pages">
        <img alt="CTA to integrate page building" src="https://cdn.khulnasoft.com/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F48bbb0ef5efb4d19a95a3f09f83c98f0" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.khulnasoft.com/c/docs/integrate-section-building">
        <img alt="CTA to integrate section building" src="https://cdn.khulnasoft.com/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9db93cd1a29443fca7b67c1f9f458356" />
      </a>
    </td>    
    <td align="center">
      <a href="https://www.khulnasoft.com/c/docs/integrate-cms-data">
        <img alt="CTA to integrate CMS data" src="https://cdn.khulnasoft.com/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8df098759b0a4c89b8c25edec1f3c9eb" />
      </a>
    </td>        
  </tr>
</table>

## React API

### Simple example

The gist of using Khulnasoft, is fetching content (using queries on [custom fields](https://www.khulnasoft.com/c/docs/custom-fields) and [targeting](https://www.khulnasoft.com/c/docs/targeting-with-khulnasoft). Khulnasoft is structured like a traditional headless CMS where you can have different content types, called [models](https://www.khulnasoft.com/c/docs/guides/getting-started-with-models). By default, every Khulnasoft space has a `"page"` model.

```tsx
import { khulnasoft } from '@khulnasoft.com/react'

const API_KEY = '...' // Your Khulnasoft public API key
const MODEL_NAME = 'page';

const content = await khulnasoft
  .get(MODEL_NAME, {
    // Optional custom query
    query: {
      'data.customField.$gt': 100,
    },
    // Optional custom targeting
    userAttributes: {
      urlPath: '/' // Most Khulnasoft content is targeted at least by the URL path
    }
  })
  .promise()

// Later, pass the fetched content to the KhulnasoftComponent
<KhulnasoftComponent model={MODEL_NAME} content={content} />
```

The khulnasoft content is simply json that you pass to a `<KhulnasoftComponent />` to render. [Learn more about it here](https://www.khulnasoft.com/c/docs/how-khulnasoft-works-technical)

You can view all of the options for `khulnasoft.get` for fetching content [in our full reference here](https://github.com/khulnasoft-lab/recli/blob/main/packages/core/docs/interfaces/GetContentOptions.md)

For example, with Next.js, to render Khulnasoft as your homepage:

```tsx
export const getStaticProps = async () => {
  return {
    props: {
      khulnasoftContent: await khulnasoft
        .get('page', {
          userAttributes: {
            urlPath: '/', // Fetch content targeted to the homepage ("/" url)
          },
        })
        .promise(),
    },
  };
};

export default function MyHomePage({ khulnasoftContent }) {
  return (
    <>
      <YourHeader />
      <KhulnasoftComponent model="page" content={khulnasoftContent} />
      <YourFooter />
    </>
  );
}
```

You can also allow dynamic page building (the ability to create new pages on new URLs dynamically). E.g. see [this guide](https://www.khulnasoft.com/c/docs/integrating-khulnasoft-pages) on how to do that

### Registering Components

One of Khulnasoft's most powerful features is registering your own components for use in the drag and drop editor.
You can choose to have these compliment the built-in components, or to be the only components allowed to be used
(e.g. via [components-only mode](https://www.khulnasoft.com/c/docs/guides/components-only-mode))

```tsx
import { Khulnasoft } from '@khulnasoft.com/sdk-react';

function MyHero(props) {
  /* Your own hero component in your codebase */
}

Khulnasoft.registerComponent(MyHero, {
  name: 'Hero',
  inputs: [
    { name: 'title', type: 'string' }, // Gets passed as the `title` prop to the Hero
  ],
});
```

Learn more about [registering components in Khulnasoft](https://www.khulnasoft.com/c/docs/custom-react-components)

### KhulnasoftComponent

You can find the full [reference docs for the KhulnasoftComponent props here](docs/interfaces/khulnasoft_component_component.KhulnasoftComponentProps.md)

```tsx
const MODEL_NAME = 'page';

// Render
<KhulnasoftComponent model={MODEL_NAME} content={khulnasoftJson} />;
```

See our guides for [Gatsby](https://github.com/khulnasoft-lab/recli/tree/main/examples/gatsby) and [Next.js](https://github.com/khulnasoft-lab/recli/tree/main/examples/next-js) for guides on using with those frameworks

#### Passing data and functions down

You can also pass [data](https://www.khulnasoft.com/c/docs/guides/connecting-api-data) and [functions](https://www.khulnasoft.com/c/docs/react/custom-actions) down to the Khulnasoft component to use in the UIs (e.g. bind
data values to UIs e.g. for text values or iterating over lists, and actions to trigger for instance on click of a button)

All data passed down is available in Khulnasoft [actions and bindings](https://www.khulnasoft.com/c/docs/guides/custom-code) as `state.*`, for instance in the below example `state.products`, etc will be available

```tsx
<KhulnasoftComponent
  model="page"
  data={{
    products: productsList,
    foo: 'bar',
  }}
  content={khulnasoftJson}
/>
```

You can also pass down functions, complex data like custom objects and libraries you can use `context`. Similar to React context, context passes all the way down (e.g. through symbols, etc). This data is not observed for changes and mutations

```tsx
<KhulnasoftComponent
  model="page"
  context={{
    addToCart: () => myService.addToCart(currentProduct),
    lodash: lodash,
  }}
  content={khulnasoftJson}
/>
```

Context is available in [actions and bindings](https://www.khulnasoft.com/c/docs/guides/custom-code) as `context.*`, such as `context.lodash` or `context.myFunction()` in the example above

#### Passing complex data

Everything passed down is available on the `state` object in data and actions - e.g. `state.products[0].name`

See more about using data passed down [here](https://www.khulnasoft.com/c/docs/react/custom-actions)

### Khulnasoft

The global `Khulnasoft` singleton has a number of uses. Most important is registering custom components.

```tsx
import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Khulnasoft } from '@khulnasoft.com/react';

class CodeBlockComponent extends React.Component {
  render() {
    return <SyntaxHighlighter language={this.props.language}>{this.props.code}</SyntaxHighlighter>;
  }
}

Khulnasoft.registerComponent(CodeBlockComponent, {
  name: 'Code Block',
  inputs: [
    {
      name: 'code',
      type: 'string',
      defaultValue: 'const incr = num => num + 1',
    },
    {
      name: 'language',
      type: 'string',
      defaultValue: 'javascript',
    },
  ],
});
```

See our full guide on [registering custom components here](https://www.khulnasoft.com/c/docs/custom-react-components).

See the [full reference docs for registerComponent options here](https://github.com/khulnasoft-lab/recli/blob/main/packages/core/docs/interfaces/Component.md).

### KhulnasoftContent

#### Usage with Data Models

Although you can already fetch data models from our Content API directly and use it as you would any other API resource, with a KhulnasoftContent component you are able to use live Editing / Previewing / [A/B testing](https://forum.khulnasoft.com/t/a-b-testing-data-models/158) of your Data Models within the Khulnasoft Visual Editor.

##### Example, setting up an editable theme:

```tsx
 <KhulnasoftContent model="site-settings"> { (data, loading) => {
   If (loading) {
     return <Spinner />
   }
   return <>
      /*pass values down to an example ThemeProvider, used as a wrapper in your application*/
       <ThemeProvider theme={data.theme} >
           {props.children}
       </ThemeProvider>
   </>
   }}
</KhulnasoftContent>
```

Or an example fetching server side and passing the content using the `content` prop, e.g. in Next.js

```tsx
export const getStaticProps = async () => {
  return {
    props: {
      khulnasoftDataContent: await khulnasoft.get('site-settings', /* other options like queries and targeting */).promise()
    }
  }
}

export default function MyPage({ khulnasoftDataContent }) {
  return <KhulnasoftContent content={khulnasoftDataContent}>{data =>
    <ThemeProvider theme={data.theme}>
      {/* ... more content ... */}
    </ThemeProvider>
  </KhulnasoftContent>
}
```

#### Usage with Page/Section Custom Fields

Page and section models in khulnasoft can be extended with [custom fields](https://www.khulnasoft.com/c/docs/custom-fields). To enable live editing / previewing on components that uses those custom fields, you can use KhulnasoftContent to pass input data from the model to your components that are outside the rendered content

##### Example, passing Custom Field input:

```tsx
<KhulnasoftContent model="landing-page">
  {data => {
    /*use your data here within your custom component*/
    return (
      <>
        <FeaturedImage image={data.featuredImage} />
        <KhulnasoftComponent content={content} model="landing-page" />
      </>
    );
  }}
</KhulnasoftContent>
```

#### Passing content manually

This is useful for doing server side rendering, e.g. with [Gatsby](https://github.com/khulnasoft-lab/recli/tree/main/examples/gatsby) and [Next.js](https://github.com/khulnasoft-lab/recli/tree/main/examples/next-js) or via
loading data from other sources than our default APIs, such as data in your own database saved via [webhooks](https://www.khulnasoft.com/c/docs/webhooks)

```tsx
const content = await khulnasoft.get(‘your-data-model’, { ...options });
if (content) {
  /*use your data here*/
  return <KhulnasoftContent model="your-data-model" content={content} >
}
```

#### Advanced querying

When using custom [models](https://www.khulnasoft.com/c/docs/guides/getting-started-with-models) and [fields](https://www.khulnasoft.com/c/docs/custom-fields) you can do more advanced filtering of your content with [queries](<(https://www.khulnasoft.com/c/docs/custom-fields)>)
and [targeting](https://www.khulnasoft.com/c/docs/guides/targeting-and-scheduling)

```tsx
import { KhulnasoftContent, khulnasoft } from '@khulnasoft.com/react';

khulnasoft.setUserAttributes({ isLoggedIn: false })

export default () => <div>
  <KhulnasoftContent
     model="your-data-model"
     options={{ query: { 'data.something.$in': ['value a', 'value b'] } }} />
  <!-- some other content -->
</div>
```

### khulnasoft

The React SDK exports the core SDK's [khulnasoft object](https://github.com/khulnasoft-lab/recli/tree/main/packages/core), which can be used for setting things like
your API key and user attributes

```tsx
import { khulnasoft } from '@khulnasoft.com/react';

khulnasoft.init(YOUR_KEY);

// Optional custom targeting
khulnasoft.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value',
});
```

#### Lite version

NOTE: If you want a zero-dependencies, fast and small Khulnasoft SDK for React, we strongly encourage you to try out our Gen 2 React SDK. You can find it [here](https://github.com/khulnasoft-lab/recli/tree/main/packages/sdks/output/react).

This SDK has a lite version where it provides only the bare minimum of components needed to render your Khulnasoft content, it won't have any built-in components registered by default, this option should work with custom components. The main difference is that you need to specifically add any built-in components you want to use or they won’t show up.
To use the lite package, you change all your imports from `@khulnasoft/react` to `@khulnasoft/react/lite` and then import only the built-in components that you want to use:

```ts
// Change all imports from '@khulnasoft.com/react' to '@khulnasoft.com/react/lite'
import { KhulnasoftComponent } from '@khulnasoft.com/react/lite';

// Import only what built-in components you like to use
import '@khulnasoft.com/react/dist/lib/src/blocks/Button';
import '@khulnasoft.com/react/dist/lib/src/blocks/Columns';
```

### Guide to use API Version v3 to query for content

For using API Version `v3`, you need to pass apiVersion as "v3" in the init function. For example:

```js
import { khulnasoft } from '@khulnasoft.com/react';

// First, initialize the SDK with your API key
khulnasoft.init('YOUR_API_KEY_GOES_HERE');
// Then, set the API version to v3
khulnasoft.apiVersion = 'v3';
```

#### Reasons to switch to API Version v3

- Better, more scalable infra: Query v3 is built on global scale infrastructure to ensure fast response times and high availability
- Ability to ship more features, faster: Query V3 will allow us to keep shipping the latest features to our customers without breaking fundamental flows. These will be shipped only to Query V3 and not to the older versions of the query API

_Coming soon..._

- Better support for localization: Some of the newer features of localization and querying based on it will be better supported in Query V3
- Support multi-level nested references: Query V3 will allow you to query, resolve, and return content that has nested references of other contents and symbols.

## Node v20 + M1 Macs (Apple Silicon) Support

The SDKs rely on `isolated-vm`, a library to securely execute code on a Node server. There is a compatibility issue for that library when running on Node v20 and M1 Macs. To workaround this issue, you must provide `NODE_OPTIONS=--no-node-snapshot` to the command that runs your server.

If you do not provide this flag, the SDK will skip using `isolated-vm`. This will only occur on Apple Silicon machines that are running Node v20.

For more information, see [this issue](https://github.com/laverdet/isolated-vm/issues/424#issuecomment-1864629126).
