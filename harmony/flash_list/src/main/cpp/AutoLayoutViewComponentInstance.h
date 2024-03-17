//
// Created on 5/3/2024.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H
#define HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H

#include "RNOH/CppComponentInstance.h"
#include "RNOHCorePackage/ComponentInstances/ScrollViewComponentInstance.h"
#include "RNOH/arkui/StackNode.h"
#include "AutoLayoutShadow.h"
#include "AutoLayoutNode.h"
#include "EventEmitters.h"

namespace rnoh {
    class AutoLayoutViewComponentInstance : public CppComponentInstance, public AutoLayoutNodeDelegate {
    private:
        AutoLayoutNode m_autoLayoutNode;
        std::shared_ptr<const facebook::react::AutoLayoutViewEventEmitter> m_autoLayoutViewEventEmitter;
        AutoLayoutShadow alShadow{AutoLayoutShadow()};
        bool horizontal{false};
        facebook::react::Float scrollOffset{0.0};
        facebook::react::Float windowSize{0.0};
        facebook::react::Float renderAheadOffset{0.0};

        bool enableInstrumentation{false};
        bool disableAutoLayout{false};
        Float pixelDensity{1.0};

        std::shared_ptr<rnoh::ScrollViewComponentInstance> parentScrollView;

    public:
        AutoLayoutViewComponentInstance(Context context);

        void insertChild(ComponentInstance::Shared childComponentInstance, std::size_t index) override;

        void removeChild(ComponentInstance::Shared childComponentInstance) override;

        AutoLayoutNode &getLocalRootArkUINode() override;

        void setProps(facebook::react::Props::Shared props) override;
        void getNapiProps(facebook::react::Props::Shared props);
        void finalizeUpdates() override;

        void setLeft(facebook::react::Float const &);
        facebook::react::Float getLeft();
        void setTop(facebook::react::Float const &);
        facebook::react::Float getTop();
        void setRight(facebook::react::Float const &);
        facebook::react::Float getRight();
        void setBottom(facebook::react::Float const &);
        facebook::react::Float getBottom();
        void setHeight(facebook::react::Float const &);
        facebook::react::Float getHeight();
        void setWidth(facebook::react::Float const &);
        facebook::react::Float getWidth();

        void fixLayout();
        void fixFooter();
        int getFooterDiff();
        void onAppear() override;
        std::shared_ptr<rnoh::CellContainerComponentInstance> getFooter();
        std::shared_ptr<rnoh::ScrollViewComponentInstance> getParentScrollView();
        void emitBlankAreaEvent() override;
        void setEventEmitter(facebook::react::SharedEventEmitter eventEmitter) override;
    };
} // namespace rnoh

#endif // HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H
