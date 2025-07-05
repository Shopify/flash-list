import React, { useLayoutEffect, useMemo, useRef } from "react";

import {
  RecyclerViewContext,
  RecyclerViewContextProvider,
  useRecyclerViewContext,
} from "./RecyclerViewContextProvider";
import { useLayoutState } from "./hooks/useLayoutState";

export interface LayoutCommitObserverProps {
  children: React.ReactNode;
  onCommitLayoutEffect?: () => void;
}

/**
 * LayoutCommitObserver can be used to observe when FlashList commits a layout.
 * It is useful when your component has one or more FlashLists somewhere down the tree.
 * LayoutCommitObserver will trigger `onCommitLayoutEffect` when all of the FlashLists in the tree have finished their first commit.
 */
export const LayoutCommitObserver = React.memo(
  (props: LayoutCommitObserverProps) => {
    const { children, onCommitLayoutEffect } = props;
    const parentRecyclerViewContext = useRecyclerViewContext();
    const [_, setRenderId] = useLayoutState(0);
    const pendingChildIds = useRef<Set<string>>(new Set()).current;

    useLayoutEffect(() => {
      if (pendingChildIds.size > 0) {
        return;
      }
      onCommitLayoutEffect?.();
    });

    // Create context for child components
    const recyclerViewContext: RecyclerViewContext<unknown> = useMemo(() => {
      return {
        layout: () => {
          setRenderId((prev) => prev + 1);
        },
        getRef: () => {
          return parentRecyclerViewContext?.getRef() ?? null;
        },
        getParentRef: () => {
          return parentRecyclerViewContext?.getParentRef() ?? null;
        },
        getParentScrollViewRef: () => {
          return parentRecyclerViewContext?.getParentScrollViewRef() ?? null;
        },
        getScrollViewRef: () => {
          return parentRecyclerViewContext?.getScrollViewRef() ?? null;
        },
        markChildLayoutAsPending: (id: string) => {
          parentRecyclerViewContext?.markChildLayoutAsPending(id);
          pendingChildIds.add(id);
        },
        unmarkChildLayoutAsPending: (id: string) => {
          parentRecyclerViewContext?.unmarkChildLayoutAsPending(id);
          if (pendingChildIds.has(id)) {
            pendingChildIds.delete(id);
            recyclerViewContext.layout();
          }
        },
      };
    }, [parentRecyclerViewContext, pendingChildIds, setRenderId]);

    return (
      <RecyclerViewContextProvider value={recyclerViewContext}>
        {children}
      </RecyclerViewContextProvider>
    );
  }
);

LayoutCommitObserver.displayName = "LayoutCommitObserver";
