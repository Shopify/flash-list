import React, { useEffect, useRef } from "react";
import { mount } from "@quilted/react-testing";
import { Text } from "react-native";

import {
  BlankAreaTrackerConfig,
  BlankAreaTrackerResult,
  useBlankAreaTracker,
} from "../benchmark/useBlankAreaTracker";
import FlashList from "../FlashList";

import { MockFlashListProps } from "./helpers/mountFlashList";

jest.mock("../FlashList", () => {
  const ActualFlashList = jest.requireActual("../FlashList").default;
  class MockFlashList extends ActualFlashList {
    componentDidMount() {
      super.componentDidMount();
      this.rlvRef?._scrollComponent?._scrollViewRef?.props.onLayout({
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    }
  }
  return MockFlashList;
});

type BlankTrackingFlashListProps = MockFlashListProps & {
  onCumulativeBlankAreaResult?: (result: BlankAreaTrackerResult) => void;
  onCumulativeBlankAreaChange?: (updatedResult: BlankAreaTrackerResult) => void;
  blankAreaTrackerConfig?: BlankAreaTrackerConfig;
};
describe("useBlankAreaTracker Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  const BlankTrackingFlashList = (props?: BlankTrackingFlashListProps) => {
    const ref = useRef<FlashList<string>>(null);
    const [blankAreaTrackerResult, onBlankArea] = useBlankAreaTracker(
      ref,
      props?.onCumulativeBlankAreaChange,
      {
        startDelayInMs: props?.blankAreaTrackerConfig?.startDelayInMs ?? 500,
        sumNegativeValues:
          props?.blankAreaTrackerConfig?.sumNegativeValues ?? false,
      }
    );
    useEffect(() => {
      return () => {
        props?.onCumulativeBlankAreaResult?.(blankAreaTrackerResult);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <FlashList
        {...props}
        ref={ref}
        onBlankArea={onBlankArea}
        renderItem={({ item }) => <Text>{item}</Text>}
        estimatedItemSize={400}
        data={props?.data || ["One", "Two", "Three", "Four"]}
      />
    );
  };
  const mountBlankTrackingFlashList = (props?: BlankTrackingFlashListProps) => {
    const blankTrackingFlashList = mount(<BlankTrackingFlashList {...props} />);
    return {
      root: blankTrackingFlashList,
      instance: blankTrackingFlashList.find(FlashList)!,
    };
  };
  it("ignores blank events for 500ms on mount and if content is not enough to fill the list", () => {
    const onCumulativeBlankAreaChange = jest.fn();
    const flashList = mountBlankTrackingFlashList({
      onCumulativeBlankAreaChange,
    });
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    jest.advanceTimersByTime(400);
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(100);
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(1);
    onCumulativeBlankAreaChange.mockClear();

    flashList.root.setProps({ data: ["1"] });
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
    flashList.root.unmount();
  });
  it("keeps result object updated with correct values on unmount", () => {
    let resultObjectCopy: BlankAreaTrackerResult | undefined;
    const onCumulativeBlankAreaChange = jest.fn(
      (result: BlankAreaTrackerResult) => {
        if (!resultObjectCopy) {
          resultObjectCopy = result;
        }
      }
    );
    const onCumulativeBlankAreaResult = jest.fn();
    const flashList = mountBlankTrackingFlashList({
      onCumulativeBlankAreaResult,
      onCumulativeBlankAreaChange,
      blankAreaTrackerConfig: { startDelayInMs: 300 },
    });
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    jest.advanceTimersByTime(300);
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(resultObjectCopy!.cumulativeBlankArea).toBe(100);
    expect(resultObjectCopy!.maxBlankArea).toBe(100);

    flashList.instance.props.onBlankArea!({
      blankArea: 200,
      offsetEnd: 200,
      offsetStart: 0,
    });
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    expect(resultObjectCopy!.cumulativeBlankArea).toBe(300);
    expect(resultObjectCopy!.maxBlankArea).toBe(200);

    flashList.root.unmount();
    expect(onCumulativeBlankAreaResult).toHaveBeenCalledWith(resultObjectCopy!);
  });
  it("can track negative values on demand", () => {
    const onCumulativeBlankAreaResult = jest.fn();
    const flashList = mountBlankTrackingFlashList({
      onCumulativeBlankAreaResult,
      blankAreaTrackerConfig: { sumNegativeValues: true },
    });
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    jest.advanceTimersByTime(500);
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    flashList.root.unmount();
    expect(onCumulativeBlankAreaResult).toHaveBeenCalledWith({
      cumulativeBlankArea: -400,
      maxBlankArea: 0,
    });
  });
  it("only calls onCumulativeBlankAreaChange when values have a change", () => {
    const onCumulativeBlankAreaChange = jest.fn();
    const flashList = mountBlankTrackingFlashList({
      onCumulativeBlankAreaChange,
    });
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    jest.advanceTimersByTime(500);
    flashList.instance.props.onBlankArea!({
      blankArea: -200,
      offsetEnd: -200,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
    flashList.instance.props.onBlankArea!({
      blankArea: -100,
      offsetEnd: -100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
    flashList.instance.props.onBlankArea!({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(1);
    flashList.root.unmount();
  });
});
