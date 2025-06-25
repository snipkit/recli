# Khulnasoft

Drag and drop page building for any website. Use your React components, publish remotely

[gif with hot reload]

## What is it good for?

- Landing pages
- Documentation
- Blogging
- Marketing pages (homepage, etc)
- Content pages (about, FAQ, etc)
- Optimization (ab test pages)
- Marketing teams that never stop asking for changes
- Developers who are tired of pushing pixels


## Getting Started

```sh
npm install --save @khulnasoft.com/react
```

Create a free account at [khulnasoft.com](https://khulnasoft.com) and grab your [API key](https://khulnasoft.com/account/organization)

```ts
import { khulnasoft, KhulnasoftComponent } from '@khulnasoft.com/react'

khulnasoft.init(YOUR_KEY)
```

Then in your router
```tsx
<Route path="/something" render={() => <KhulnasoftComponent model="page" />}>
```

Create a new page and open your-dev-url:port/something and edit

[gif]

### Using your components

Wrap a component

```tsx
import { KhulnasoftBlock } from '@khulnasoft.com/react'

@KhulnasoftBlock({
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }]
})
export class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}
```

Then back at your page

```tsx
import './simple-page'

// ...

<Route path="/something" render={() => <KhulnasoftComponent model="page">}>
```

Open the dashboard and use it

[gif]

More docs on khulnasoft APIs and such at [khulnasoft.com/c/docs](https://khulnasoft.com/c/docs)

For Khulnasoft decorator support you need to be using typescript or babel with legacy decorators.
Alternatively you can use the alternative syntax:

```tsx
import { khulnasoftBlocks } from '@khulnasoft.com/react'

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}

khulnasoftBlocks.add(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }]
})
```



## Troubleshooting and feedback

Problems? Requests? Open an issue. Always want feedback, interesting new use cases, happy to help.
