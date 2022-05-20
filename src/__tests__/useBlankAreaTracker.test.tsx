import React, { useEffect, useRef } from "react";
import {
  BlankAreaTrackerConfig,
  BlankAreaTrackerResult,
  useBlankAreaTracker,
} from "../benchmark/useBlankAreaTracker";
import FlashList from "../FlashList";
import {
  MockFlashListProps,
  renderMockFlashList,
} from "./helpers/mountFlashList";
import { mount, RootNode } from "@quilted/react-testing";
import { FlashListProps } from "../FlashListProps";
import { View } from "react-native";
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
      props?.blankAreaTrackerConfig
    );
    useEffect(() => {
      return () => {
        props?.onCumulativeBlankAreaResult?.(blankAreaTrackerResult);
      };
    }, []);
    return (
      <View>{renderMockFlashList({ onBlankArea: onBlankArea }, ref)}</View>
    );
  };
  const mountBlankTrackingFlashList = (props?: BlankTrackingFlashListProps) => {
    const flashList = mount(<BlankTrackingFlashList {...props} />) as Omit<
      RootNode<FlashListProps<string>>,
      "instance"
    > & {
      instance: FlashList<string>;
    };
    return flashList;
  };
  it("ignores blank events if content is not enough to fill the list", () => {
    const onCumulativeBlankAreaResult = jest.fn();
    const flashList = mountBlankTrackingFlashList({
      data: ["1"],
      onCumulativeBlankAreaResult,
    });
    console.log(flashList);
    flashList.instance.props.onBlankArea?.({
      blankArea: 100,
      offsetEnd: 100,
      offsetStart: 0,
    });
    expect(onCumulativeBlankAreaResult).toHaveBeenCalledTimes(0);
  });
});
