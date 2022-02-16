#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FlatListPerformanceViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onInteractive, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onBlankAreaEvent, RCTDirectEventBlock)

@end
