---
id: testing
title: Testing with Jest
slug: /testing
---

Since `FlashList` does not immediately render but waits for the size of the underlying `ScrollView` (unless you specify [`estimatedListSize`](usage#estimatedlistsize)), we need to mock triggering `onLayout` event.

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
