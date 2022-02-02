#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RecyclerFlatListPerformanceViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onInteractive, RCTBubblingEventBlock)

@end
