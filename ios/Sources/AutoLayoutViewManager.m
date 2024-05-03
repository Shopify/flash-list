#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(AutoLayoutViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(horizontal, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scrollOffset, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(windowSize, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(renderAheadOffset, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(enableInstrumentation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(enableAutoLayoutInfo, BOOL)
RCT_EXPORT_VIEW_PROPERTY(disableAutoLayout, BOOL)
RCT_EXPORT_VIEW_PROPERTY(autoLayoutId, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(renderId, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(preservedIndex, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(onBlankAreaEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAutoLayout, RCTDirectEventBlock)

@end
