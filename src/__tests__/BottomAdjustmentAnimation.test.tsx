import React, { createRef } from "react";
import { Animated, Text } from "react-native";
import { render } from "@quilted/react-testing";

import { FlashListRef } from "../FlashListRef";
import { FlashList } from "..";

jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      width: 399,
      height: 899,
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});

const { measureItemLayout } = jest.requireMock(
  "../recyclerview/utils/measureLayout"
) as { measureItemLayout: jest.Mock };

const renderChatList = (data: number[], animateAutoScrollToBottom = true) => {
  const ref = createRef<FlashListRef<number>>();
  const result = render(
    <FlashList
      ref={ref}
      data={data}
      renderItem={({ item }) => <Text>{item}</Text>}
      maintainVisibleContentPosition={{
        autoscrollToBottomThreshold: 0.2,
        animateAutoScrollToBottom,
        startRenderingFromBottom: true,
      }}
    />
  );
  return { result, ref };
};

const scrollTo = (root: ReturnType<typeof render>, y: number) => {
  const scrollable = root.findWhere((node: any) => node.props.onScroll);
  if (!scrollable) throw new Error("Could not find scrollable component");

  const onScroll: any = scrollable.prop("onScroll" as never);
  root.act(() => {
    onScroll({
      nativeEvent: {
        contentOffset: { x: 0, y },
        contentSize: { width: 399, height: 2000 },
        layoutMeasurement: { width: 399, height: 899 },
      },
    });
  });
};

describe("short-list bottom autoscroll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    measureItemLayout.mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("animates the adjustment offset when a short list grows", () => {
    const data = [0, 1, 2];
    const { result, ref } = renderChatList(data);
    const scrollToEndSpy = jest.fn();
    const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
    expect(nativeScrollRef).toBeTruthy();
    nativeScrollRef.scrollToEnd = scrollToEndSpy;

    result.act(() => jest.runAllTimers());
    scrollToEndSpy.mockClear();

    const timingSpy = jest.spyOn(Animated, "timing").mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }));

    result.act(() => {
      result.setProps({ data: [...data, 3] });
      jest.runAllTimers();
    });

    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 250,
        toValue: 0,
        useNativeDriver: true,
      })
    );
    expect((timingSpy.mock.calls[0][0] as Animated.Value).__getValue()).toBe(
      100
    );
    expect(scrollToEndSpy).toHaveBeenCalledWith({ animated: true });

    timingSpy.mockRestore();
  });

  it("keeps native scroll animation for content taller than the viewport", () => {
    const data = Array.from({ length: 20 }, (_, index) => index);
    const { result, ref } = renderChatList(data);
    const scrollToEndSpy = jest.fn();
    const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
    expect(nativeScrollRef).toBeTruthy();
    nativeScrollRef.scrollToEnd = scrollToEndSpy;

    result.act(() => jest.runAllTimers());
    scrollTo(result, 1101);
    jest.runAllTimers();
    scrollToEndSpy.mockClear();

    const timingSpy = jest.spyOn(Animated, "timing");
    result.setProps({ data: [...data, 20] });
    jest.runAllTimers();

    expect(timingSpy).not.toHaveBeenCalled();
    expect(scrollToEndSpy).toHaveBeenCalledWith({ animated: true });

    timingSpy.mockRestore();
  });

  it("keeps an active adjustment animation during later appends", () => {
    const { result, ref } = renderChatList([0, 1, 2]);
    const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
    expect(nativeScrollRef).toBeTruthy();
    nativeScrollRef.scrollToEnd = jest.fn();

    result.act(() => jest.runAllTimers());

    const timingSpy = jest.spyOn(Animated, "timing").mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }));

    result.act(() => {
      result.setProps({ data: [0, 1, 2, 3] });
      jest.runAllTimers();
    });
    scrollTo(result, 0);

    result.act(() => {
      result.setProps({
        data: Array.from({ length: 10 }, (_, index) => index),
      });
      jest.runAllTimers();
    });

    expect(timingSpy).toHaveBeenCalledTimes(2);
    const animatedValue = timingSpy.mock.calls[1][0] as Animated.Value;
    expect(animatedValue.__getValue()).toBe(599);

    scrollTo(result, 101);
    result.act(() => {
      result.setProps({
        data: Array.from({ length: 11 }, (_, index) => index),
      });
      jest.runAllTimers();
    });

    expect(timingSpy).toHaveBeenCalledTimes(2);
    expect(animatedValue.__getValue()).toBe(599);
    timingSpy.mockRestore();
  });

  it("does not animate the adjustment when autoscroll animation is disabled", () => {
    const data = [0, 1, 2];
    const { result, ref } = renderChatList(data, false);
    const scrollToEndSpy = jest.fn();
    const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
    expect(nativeScrollRef).toBeTruthy();
    nativeScrollRef.scrollToEnd = scrollToEndSpy;

    result.act(() => jest.runAllTimers());
    scrollToEndSpy.mockClear();

    const timingSpy = jest.spyOn(Animated, "timing");
    result.act(() => {
      result.setProps({ data: [...data, 3] });
      jest.runAllTimers();
    });

    expect(timingSpy).not.toHaveBeenCalled();
    expect(scrollToEndSpy).toHaveBeenCalledWith({ animated: false });

    timingSpy.mockRestore();
  });
});
