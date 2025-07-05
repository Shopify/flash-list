import React from "react";
import { render } from "@quilted/react-testing";

import { RecyclerView } from "../recyclerview/RecyclerView";
import { useFlashListContext } from "../recyclerview/RecyclerViewContextProvider";
import { LayoutCommitObserver } from "../recyclerview/LayoutCommitObserver";

describe("LayoutCommitObserver", () => {
  it("should not alter ref captured by child", () => {
    const ChildComponent = () => {
      const context = useFlashListContext();
      expect(context?.getRef()?.props.testID).toBe("child");
      expect(context?.getParentRef()?.props.testID).toBe("parent");
      expect(context?.getScrollViewRef()?.props.testID).toBe("child");
      expect(context?.getParentScrollViewRef()?.props.testID).toBe("parent");

      return null;
    };

    let commitLayoutEffectCount = 0;

    const content = (
      <RecyclerView
        testID="parent"
        data={[1]}
        renderItem={() => (
          <LayoutCommitObserver
            onCommitLayoutEffect={() => {
              commitLayoutEffectCount++;
            }}
          >
            <RecyclerView
              testID="child"
              data={[1]}
              renderItem={() => (
                <LayoutCommitObserver
                  onCommitLayoutEffect={() => {
                    commitLayoutEffectCount++;
                  }}
                >
                  <LayoutCommitObserver
                    onCommitLayoutEffect={() => {
                      commitLayoutEffectCount++;
                    }}
                  >
                    <ChildComponent />
                  </LayoutCommitObserver>
                </LayoutCommitObserver>
              )}
            />
          </LayoutCommitObserver>
        )}
      />
    );

    render(content);

    expect(commitLayoutEffectCount).toBe(3);
  });
});
