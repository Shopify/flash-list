#import "CellContainerComponentView.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>

#import <react/renderer/components/rnflashlist/ComponentDescriptors.h>
#import <react/renderer/components/rnflashlist/EventEmitters.h>
#import <react/renderer/components/rnflashlist/Props.h>
#import <react/renderer/components/rnflashlist/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

#if __has_include(<RNFlashList/RNFlashList-Swift.h>)
#import <RNFlashList/RNFlashList-Swift.h>
#else
#import "RNFlashList-Swift.h"
#endif

using namespace facebook::react;

@interface CellContainerComponentView () <RCTCellContainerViewProtocol>
@end

@implementation CellContainerComponentView

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const CellContainerProps>();
        _props = defaultProps;

        self.userInteractionEnabled = true;
    }

    return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<CellContainerComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const CellContainerProps>(props);

    self.index = newProps.index;

    [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> CellContainerCls(void)
{
    return CellContainerComponentView.class;
}
#else
@implementation CellContainerComponentView
@end
#endif /* RCT_NEW_ARCH_ENABLED */
