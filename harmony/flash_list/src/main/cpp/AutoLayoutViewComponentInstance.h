//
// Created on 5/3/2024.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H
#define HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H

#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"
#include "AutoLayoutShadow.h"

namespace rnoh {
    class AutoLayoutViewComponentInstance : public CppComponentInstance {
    private:
        StackNode m_stackNode;
        AutoLayoutShadow alShadow{AutoLayoutShadow()};
        bool horizontal{false};
        facebook::react::Float scrollOffset{0.0};
        facebook::react::Float windowSize{0.0};
        facebook::react::Float renderAheadOffset{0.0};
        bool enableInstrumentation{false};
        bool disableAutoLayout{false};

        facebook::react::Float top;
        facebook::react::Float bottom;
        facebook::react::Float left;
        facebook::react::Float right;
        facebook::react::Float height;
        facebook::react::Float width;

    public:
        AutoLayoutViewComponentInstance(Context context, facebook::react::Tag tag);

        void insertChild(ComponentInstance::Shared childComponentInstance, std::size_t index) override;

        void removeChild(ComponentInstance::Shared childComponentInstance) override;
        void setLayout(facebook::react::LayoutMetrics layoutMetrics) override;

        StackNode &getLocalRootArkUINode() override;

        void setProps(facebook::react::Props::Shared props) override;
        void finalizeUpdates() override;
        void getNapiProps(facebook::react::Props::Shared props);

        void fixLayout();
        void fixFooter();
        int getFooterDiff();
        // TODO getFooter()
        // TODO getParentScrollView()
        // TODO emitBlankAreaEvent()
    };
} // namespace rnoh

#endif // HARMONY_AUTOLAYOUTVIEWCOMPONENTINSTANCE_H
