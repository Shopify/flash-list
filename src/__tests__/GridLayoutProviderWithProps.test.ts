import { ScrollView } from "react-native";
import { ProgressiveListView } from "recyclerlistview";

import { mountFlashList } from "./FlashList.test";

describe("GridLayoutProviderWithProps", () => {
  it("updates average window on layout manager change", () => {
    const flashList = mountFlashList();
    const oldAverageWindow =
      flashList.instance.state.layoutProvider.averageWindow;

    // width change from default 400 to 600 will force layout manager to change
    flashList.find(ScrollView)?.trigger("onLayout", {
      nativeEvent: { layout: { height: 900, width: 600 } },
    });

    const newAverageWindow =
      flashList.instance.state.layoutProvider.averageWindow;

    expect(newAverageWindow).not.toBe(oldAverageWindow);
    flashList.unmount();
  });
  it("average window's size is two times the number of items that will fill the screen", () => {
    const flashList = mountFlashList({ numColumns: 2 });
    expect(
      flashList.instance.state.layoutProvider.averageWindow.getStoredValues()
        .length
    ).toBe(20);
    flashList.find(ScrollView)?.trigger("onLayout", {
      nativeEvent: { layout: { height: 2000, width: 600 } },
    });
    expect(
      flashList.instance.state.layoutProvider.averageWindow.getStoredValues()
        .length
    ).toBe(40);
    flashList.setProps({ numColumns: 1 });
    expect(
      flashList.instance.state.layoutProvider.averageWindow.getStoredValues()
        .length
    ).toBe(20);
    flashList.unmount();
  });
  it("average window should not be less than 6 in size", () => {
    const flashList = mountFlashList();
    flashList.find(ScrollView)?.trigger("onLayout", {
      nativeEvent: { layout: { height: 100, width: 100 } },
    });
    expect(
      flashList.instance.state.layoutProvider.averageWindow.getStoredValues()
        .length
    ).toBe(6);
    flashList.unmount();
  });
  it("vertical list: average should not update when widths change", () => {
    const flashList = mountFlashList();
    const layoutProvider = flashList.instance.state.layoutProvider;
    const oldAverage = layoutProvider.averageItemSize;

    layoutProvider.getLayoutManager().getLayouts()[0].width = 500;
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);

    expect(oldAverage).toBe(layoutProvider.averageItemSize);
    flashList.unmount();
  });
  it("horizontal list: average should not update when heights change", () => {
    const flashList = mountFlashList({ horizontal: true });
    const layoutProvider = flashList.instance.state.layoutProvider;
    const oldAverage = layoutProvider.averageItemSize;

    layoutProvider.getLayoutManager().getLayouts()[0].height = 600;

    // Can throw a no op set state warning. Should be handled in PLV.
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);

    expect(oldAverage).toBe(layoutProvider.averageItemSize);
    flashList.unmount();
  });
  it("computes correct average", () => {
    const flashList = mountFlashList();
    const layoutProvider = flashList.instance.state.layoutProvider;
    expect(layoutProvider.averageItemSize).toBe(200);

    const layouts = layoutProvider.getLayoutManager().getLayouts();
    const progressiveListView = flashList.find(ProgressiveListView);
    layouts[0].height = 100;
    layouts[1].height = 200;
    layouts[2].height = 300;
    layouts[3].height = 400;
    progressiveListView?.instance.onItemLayout(0);
    progressiveListView?.instance.onItemLayout(1);
    progressiveListView?.instance.onItemLayout(2);
    progressiveListView?.instance.onItemLayout(3);

    // estimatedItemSize is treated as one of the values. That's why 240.
    expect(layoutProvider.averageItemSize).toBe(240);
    flashList.unmount();
  });
});
