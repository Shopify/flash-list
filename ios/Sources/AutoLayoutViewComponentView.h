#ifndef AutoLayoutViewComponentView_h
#define AutoLayoutViewComponentView_h

#import <UIKit/UIKit.h>

#ifdef RN_FABRIC_ENABLED
#import <React/RCTViewComponentView.h>

@interface AutoLayoutViewComponentView : RCTViewComponentView
#else
@interface AutoLayoutViewComponentView : UIView
#endif /* RN_FABRIC_ENABLED */
@end

#endif /* AutoLayoutViewComponentView_h */
