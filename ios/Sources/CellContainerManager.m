#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(CellContainerManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(index, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(stableId, NSString)

@end
