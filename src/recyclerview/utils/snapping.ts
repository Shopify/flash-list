import { PlatformConfig } from "../../native/config/PlatformHelper";

interface SnapProps {
  pagingEnabled?: boolean | null;
  snapToInterval?: number | null;
  snapToOffsets?: number[] | null;
}

/**
 * Whether the list snaps, using the same predicate ScrollView.js applies to
 * decide the native `pagingEnabled` it hands Android:
 *
 * ```js
 * pagingEnabled: Platform.select({
 *   android:
 *     this.props.pagingEnabled === true ||
 *     this.props.snapToInterval != null ||
 *     this.props.snapToOffsets != null,
 * })
 * ```
 *
 * That flag is what gates `ReactHorizontalScrollView.flingAndSnap`, so matching
 * it exactly covers every list that snaps and none that don't.
 */
export function isSnappingList(props: SnapProps): boolean {
  return (
    props.pagingEnabled === true ||
    props.snapToInterval != null ||
    props.snapToOffsets != null
  );
}

/**
 * Whether the underlying ScrollView can be handed RN's native
 * `maintainVisibleContentPosition`.
 *
 * Android's `MaintainVisibleScrollPositionHelper` re-anchors on every layout
 * change of the first visible child, and a recycling list repositions its cells
 * constantly. Each re-anchor calls `scrollToPreservingMomentum` ->
 * `recreateFlingAnimation(x, Integer.MAX_VALUE)`, which cancels the in-flight
 * snap animator and re-flings with the velocity `flingAndSnap` boosted 10x -
 * safe only while that call also clamped it with `minX == maxX == targetOffset`.
 * Unclamped, a backward swipe runs all the way to offset 0 instead of landing on
 * the previous snap point.
 *
 * The helper watches the cells themselves, not FlashList's ScrollAnchor, so
 * there is nothing to suppress on the JS side. Keeping the prop off for snapping
 * lists is what stops it.
 */
export function supportsNativeMaintainVisibleContentPosition(
  props: SnapProps
): boolean {
  return !(PlatformConfig.nativeMvcpBreaksSnapFling && isSnappingList(props));
}
