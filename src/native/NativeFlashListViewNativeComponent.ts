import type { ViewProps, HostComponent } from "react-native";
import type {
  Int32,
  Float,
  DirectEventHandler,
} from "react-native/Libraries/Types/CodegenTypes";

/**
 * Event payload when the native side requests JS to render a cell.
 */
interface OnCellRenderRequestEvent {
  cellKey: Int32;
  index: Int32;
  viewType: Int32;
  isSync: boolean;
}

/**
 * Scroll event payload matching React Native's NativeScrollEvent shape.
 */
interface NativeScrollEventData {
  contentOffset: { x: Float; y: Float };
  contentSize: { width: Float; height: Float };
  layoutMeasurement: { width: Float; height: Float };
}

/**
 * Props for the native FlashList RecyclerView/UICollectionView component.
 */
export interface NativeFlashListViewProps extends ViewProps {
  // --- FlashList core props ---
  dataLength: Int32;
  numColumns?: Int32;
  horizontal?: boolean;
  inverted?: boolean;
  masonry?: boolean;
  drawDistance?: Int32;

  // --- ScrollView-equivalent props ---
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  overScrollMode?: string;
  decelerationRate?: Float;
  pagingEnabled?: boolean;
  nestedScrollEnabled?: boolean;
  scrollEventThrottle?: Int32;
  refreshing?: boolean;
  refreshEnabled?: boolean;

  // --- Events ---
  onScroll?: DirectEventHandler<NativeScrollEventData>;
  onScrollBeginDrag?: DirectEventHandler<NativeScrollEventData>;
  onScrollEndDrag?: DirectEventHandler<NativeScrollEventData>;
  onMomentumScrollBegin?: DirectEventHandler<NativeScrollEventData>;
  onMomentumScrollEnd?: DirectEventHandler<NativeScrollEventData>;
  onCellRenderRequest?: DirectEventHandler<OnCellRenderRequestEvent>;
  onRefresh?: DirectEventHandler<Record<string, never>>;
}

// Use lazy loading to avoid crash at import time when the native component
// isn't registered yet. The component is loaded on first render.
let _NativeComponent: HostComponent<NativeFlashListViewProps> | null = null;

function getNativeComponent(): HostComponent<NativeFlashListViewProps> {
  if (_NativeComponent == null) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { requireNativeComponent } = require("react-native");
    _NativeComponent = requireNativeComponent("FlashListRecyclerView");
  }
  return _NativeComponent!;
}

// Proxy component that loads the native component lazily
const NativeFlashListView = new Proxy({} as HostComponent<NativeFlashListViewProps>, {
  get(_target, prop) {
    const component = getNativeComponent();
    return (component as any)[prop];
  },
});

export default NativeFlashListView;
