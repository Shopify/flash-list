#ifndef CellContainer_h
#define CellContainer_h

#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>

@interface CellContainerComponentView : RCTViewComponentView
#else
@interface CellContainerComponentView : UIView
#endif // RCT_NEW_ARCH_ENABLED

@property int64_t index;

@end

#endif /* CellContainer_h */
