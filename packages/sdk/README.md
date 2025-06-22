# Khulnasoft Core SDK

This SDK is largely a wrapper over our [Content API](https://www.khulnasoft.com/c/docs/content-api)

```javascript
import { khulnasoft } from '@khulnasoft.com/sdk';

khulnasoft.init(YOUR_KEY);

// Optional custom targeting
khulnasoft.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value',
});

khulnasoft
  .get(YOUR_MODEL_NAME, {
    // Optional custom query
    query: {
      'data.customField.$gt': 100,
    },
  })
  .promise()
  .then(({ data }) => {
    // Do something with the data
  });

// The options that you can send to khulnasoft.get and khulnasoft.getAll
// are defined here: https://forum.khulnasoft.com/t/what-are-the-options-for-the-methods-khulnasoft-get-and-khulnasoft-getall/1036
khulnasoft
  .getAll(YOUR_MODEL_NAME, {
    limit: 10,
  })
  .then(results => {
    // Do something with the results
  });

// Turn of cookies/tracking
khulnasoft.canTrack = false;
```

View all options for `khulnasoft.get` [here](./docs/interfaces/GetContentOptions.md)

Learn more about how to use the Khulnasoft core SDK:

- [Content API](https://www.khulnasoft.com/c/docs/content-api)
- [Querying Cheatsheet](https://www.khulnasoft.com/c/docs/querying)
