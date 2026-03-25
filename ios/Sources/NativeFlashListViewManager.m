/**
 * NativeFlashListViewManager - React Native ViewManager for iOS.
 *
 * Registers the NativeFlashListView component with React Native's UI system.
 * Handles prop registration, event export, and native command dispatch.
 */

#import <React/RCTViewManager.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import "NativeFlashListView.h"

@interface NativeFlashListViewManager : RCTViewManager
@end

@implementation NativeFlashListViewManager

RCT_EXPORT_MODULE(NativeFlashListView)

- (UIView *)view {
    return [[NativeFlashListView alloc] init];
}

#pragma mark - Props

RCT_EXPORT_VIEW_PROPERTY(horizontal, BOOL)
RCT_EXPORT_VIEW_PROPERTY(inverted, BOOL)
RCT_EXPORT_VIEW_PROPERTY(numColumns, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(masonry, BOOL)
RCT_EXPORT_VIEW_PROPERTY(itemCount, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(drawDistance, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(showsVerticalScrollIndicator, BOOL)
RCT_EXPORT_VIEW_PROPERTY(showsHorizontalScrollIndicator, BOOL)
RCT_EXPORT_VIEW_PROPERTY(bounces, BOOL)
RCT_EXPORT_VIEW_PROPERTY(pagingEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(snapToInterval, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(snapToAlignment, NSString)
RCT_EXPORT_VIEW_PROPERTY(decelerationRate, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(nestedScrollEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(keyboardDismissMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(onEndReachedThreshold, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(onStartReachedThreshold, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(refreshing, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onRefreshEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(progressViewOffset, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(contentInsetTop, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(contentInsetBottom, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(contentInsetLeft, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(contentInsetRight, CGFloat)

RCT_EXPORT_VIEW_PROPERTY(itemTypes, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(itemKeys, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(spanSizes, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(stickyHeaderIndices, NSArray)
RCT_CUSTOM_VIEW_PROPERTY(maintainVisibleContentPosition, NSDictionary, NativeFlashListView) {
    view.maintainVisibleContentPositionConfig = json;
}

#pragma mark - Events

RCT_EXPORT_VIEW_PROPERTY(onScroll, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onEndReached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onStartReached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRefreshEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRenderRequest, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onViewableItemsChanged, RCTDirectEventBlock)

#pragma mark - Commands

RCT_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)reactTag
                  index:(NSInteger)index
                  animated:(BOOL)animated
                  viewPosition:(CGFloat)viewPosition
                  viewOffset:(CGFloat)viewOffset)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeFlashListView *view = (NativeFlashListView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeFlashListView class]]) {
            [view scrollToIndex:index animated:animated viewPosition:viewPosition viewOffset:viewOffset];
        }
    }];
}

RCT_EXPORT_METHOD(scrollToOffset:(nonnull NSNumber *)reactTag
                  offset:(CGFloat)offset
                  animated:(BOOL)animated)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeFlashListView *view = (NativeFlashListView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeFlashListView class]]) {
            [view scrollToOffset:offset animated:animated];
        }
    }];
}

RCT_EXPORT_METHOD(scrollToEnd:(nonnull NSNumber *)reactTag
                  animated:(BOOL)animated)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeFlashListView *view = (NativeFlashListView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeFlashListView class]]) {
            [view scrollToEnd:animated];
        }
    }];
}

RCT_EXPORT_METHOD(scrollToTop:(nonnull NSNumber *)reactTag
                  animated:(BOOL)animated)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeFlashListView *view = (NativeFlashListView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeFlashListView class]]) {
            [view scrollToTop:animated];
        }
    }];
}

RCT_EXPORT_METHOD(flashScrollIndicators:(nonnull NSNumber *)reactTag)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeFlashListView *view = (NativeFlashListView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeFlashListView class]]) {
            [view flashScrollIndicators];
        }
    }];
}

@end
