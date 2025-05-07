import React from "react";
import { render } from "@quilted/react-testing";

import { useUnmountAwareTimeout } from "../recyclerview/hooks/useUnmountAwareCallbacks";

const TestComponent = ({
  onRender,
}: {
  onRender: (api: ReturnType<typeof useUnmountAwareTimeout>) => void;
}) => {
  const api = useUnmountAwareTimeout();
  onRender(api);
  return null;
};

describe("useUnmountAwareCallbacks", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("returns a setTimeout function", () => {
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;
    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    expect(api).toBeDefined();
    expect(api?.setTimeout).toBeDefined();
    expect(typeof api?.setTimeout).toBe("function");
  });

  it("executes the callback after the specified delay", () => {
    const callback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("executes multiple callbacks after their respective delays", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(callback1, 1000);
    api?.setTimeout(callback2, 2000);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    // Fast-forward time by 1000ms
    jest.advanceTimersByTime(1000);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Fast-forward time by another 1000ms
    jest.advanceTimersByTime(1000);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("clears all timeouts when the component unmounts", () => {
    const callback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    const component = render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(callback, 1000);
    api?.setTimeout(callback, 2000);

    // Spy on clearTimeout to verify it's called during unmount
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    // Unmount the component
    component.unmount();

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    // Expect callbacks not to be called because timeouts were cleared
    expect(callback).not.toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("removes timeout from tracking set once it executes", () => {
    const callback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    const component = render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(callback, 1000);

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    // Verify callback was called
    expect(callback).toHaveBeenCalledTimes(1);

    // We can't directly check the timeoutIds Set, so we'll verify indirectly
    // by making sure no clearTimeout calls happen on unmount (since the timeout was already cleared)
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    clearTimeoutSpy.mockClear(); // Reset the mock calls before unmount

    // Unmount the component
    component.unmount();

    // If the timeout was properly removed from the set, clearTimeout won't be called on unmount
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });

  it("handles multiple timeouts correctly", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    const component = render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    // Set up three timeouts with different delays
    api?.setTimeout(callback1, 1000);
    api?.setTimeout(callback2, 2000);
    api?.setTimeout(callback3, 3000);

    // Fast-forward time by 1500ms (should trigger only the first callback)
    jest.advanceTimersByTime(1500);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();

    // Unmount the component (should clear remaining timeouts)
    component.unmount();

    // Fast-forward time to when all callbacks would have been called
    jest.advanceTimersByTime(2000);

    // Only the first callback should have been called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  it("handles callbacks that trigger new timeouts", () => {
    const finalCallback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    const firstCallback = () => {
      api?.setTimeout(finalCallback, 1000);
    };

    api?.setTimeout(firstCallback, 1000);

    // Fast-forward time to trigger first callback
    jest.advanceTimersByTime(1000);

    expect(finalCallback).not.toHaveBeenCalled();

    // Fast-forward time to trigger second callback
    jest.advanceTimersByTime(1000);

    expect(finalCallback).toHaveBeenCalledTimes(1);
  });

  it("handles zero delay timeouts", () => {
    const callback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(callback, 0);

    expect(callback).not.toHaveBeenCalled();

    // Even with zero delay, we need to advance the timer to execute
    jest.advanceTimersByTime(0);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("handles errors in callbacks without affecting other timeouts", () => {
    const errorCallback = jest.fn(() => {
      throw new Error("Test error");
    });
    const successCallback = jest.fn();
    let api: ReturnType<typeof useUnmountAwareTimeout> | undefined;

    // Suppress error log during test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    render(
      <TestComponent
        onRender={(hookApi) => {
          api = hookApi;
        }}
      />
    );

    api?.setTimeout(errorCallback, 1000);
    api?.setTimeout(successCallback, 2000);

    // Fast-forward time to trigger error callback
    try {
      jest.advanceTimersByTime(1000);
    } catch (error) {
      // Expected error
    }

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(successCallback).not.toHaveBeenCalled();

    // Fast-forward time to trigger success callback
    jest.advanceTimersByTime(1000);

    expect(successCallback).toHaveBeenCalledTimes(1);

    // Restore console.error
    console.error = originalConsoleError;
  });
});
