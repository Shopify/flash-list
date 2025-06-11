---
id: testing
title: Testing with Jest
slug: /testing
---

By default `FlashList` will mount all items in the test environment. You can use the following mock to setup measurements to prevent everything from mounting. You can also create your own mock.

## Setup

Add the following line to your `jest-setup.js` file:

```js
require("@shopify/flash-list/jestSetup");
```

To be sure, check if your jest.config.js file contains:

```
...
preset: 'react-native',
setupFiles: ['./jest-setup.js'],
...
```

## Example

Here is an example of using [`@testing-library/react-native`](https://callstack.github.io/react-native-testing-library/):

```tsx
import React from "react";
import { render } from "@testing-library/react-native";

describe("MyFlashListComponent", () => {
  it("renders items", () => {
    const { getByText } = render(<MyFlashListComponent />);
    const element = getByText("Title of one of the items");
    // Do something with element ...
  });
});
```
