#ifndef CellContainer_h
#define CellContainer_h

#import <UIKit/UIKit.h>

#ifdef RN_FABRIC_ENABLED
#import <React/RCTViewComponentView.h>

@interface CellContainerComponentView : RCTViewComponentView
#else
@interface CellContainerComponentView : UIView
#endif

@property int64_t index;

@end

#endif /* CellContainer_h */
