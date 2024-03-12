#pragma once
#include "Props.h"
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
    class CellContainerComponentInstance : public CppComponentInstance {
    private:
        StackNode m_stackNode;
        int index{-1};
        facebook::react::Float top;
        facebook::react::Float bottom;
        facebook::react::Float left;
        facebook::react::Float right;
        facebook::react::Float height;
        facebook::react::Float width;

    public:
        CellContainerComponentInstance(Context context, facebook::react::Tag tag);
    
        void insertChild(ComponentInstance::Shared childComponentInstance, std::size_t index) override;

        void removeChild(ComponentInstance::Shared childComponentInstance) override;

        StackNode &getLocalRootArkUINode() override;

        void setIndex(int const &);
        int getIndex();
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

        void setProps(facebook::react::Props::Shared props) override;
        void setLayout(facebook::react::LayoutMetrics layoutMetrics) override;
    };
} // namespace rnoh