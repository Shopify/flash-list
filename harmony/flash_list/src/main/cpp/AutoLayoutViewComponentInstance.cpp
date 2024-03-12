#include "AutoLayoutViewComponentInstance.h"
#include "ComponentDescriptors.h"
#include <sys/param.h>

namespace rnoh {

    AutoLayoutViewComponentInstance::AutoLayoutViewComponentInstance(Context context, facebook::react::Tag tag)
        : CppComponentInstance(std::move(context), tag) {}

    void AutoLayoutViewComponentInstance::insertChild(ComponentInstance::Shared childComponentInstance,
                                                      std::size_t index) {
        CppComponentInstance::insertChild(childComponentInstance, index);
        m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }

    StackNode &AutoLayoutViewComponentInstance::getLocalRootArkUINode() { return m_stackNode; }

    void AutoLayoutViewComponentInstance::removeChild(ComponentInstance::Shared childComponentInstance) {
        CppComponentInstance::removeChild(childComponentInstance);
        m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
    };

    void AutoLayoutViewComponentInstance::finalizeUpdates() {
        int i = 0;
        for (const auto &child : getChildren()) {
            if (child != nullptr) {
                if (auto cellContainer = std::dynamic_pointer_cast<rnoh::CellContainerComponentInstance>(child)) {
                    LOG(INFO) << "[clx] AutoLayoutViewComponentInstance::finalizeUpdates index:" << cellContainer->getIndex() << ", child numer: " << i;
                }
            }
            i ++;
        }


        this->getLocalRootArkUINode().markDirty();
    }

    void AutoLayoutViewComponentInstance::setProps(facebook::react::Props::Shared props) {
        CppComponentInstance::setProps(props);

        //         auto childProp = std::dynamic_pointer_cast<const
        //         facebook::react::AutoLayoutViewProps>(getChildren()[0]->getProps());

        auto autoLayoutViewProps = std::dynamic_pointer_cast<const facebook::react::AutoLayoutViewProps>(props);
        if (autoLayoutViewProps == nullptr) {
            return;
        }
        this->horizontal = autoLayoutViewProps->horizontal;
        this->scrollOffset = autoLayoutViewProps->scrollOffset;
        this->windowSize = autoLayoutViewProps->windowSize;
        this->renderAheadOffset = autoLayoutViewProps->renderAheadOffset;
        this->enableInstrumentation = autoLayoutViewProps->enableInstrumentation;
        this->disableAutoLayout = autoLayoutViewProps->disableAutoLayout;

        LOG(INFO) << "[clx] autoLayoutViewProps" << autoLayoutViewProps->renderAheadOffset;
    }

    void AutoLayoutViewComponentInstance::setLayout(facebook::react::LayoutMetrics layoutMetrics) {
        this->top = layoutMetrics.frame.origin.y;
        this->bottom = layoutMetrics.frame.origin.y + layoutMetrics.frame.size.height;
        this->left = layoutMetrics.frame.origin.x;
        this->right = layoutMetrics.frame.origin.x + layoutMetrics.frame.size.width;
        this->height = layoutMetrics.frame.size.height;
        this->width = layoutMetrics.frame.size.width;
        
        // TODO this->fixLayout();
        // TODO this->fixFooter();
        // TODO get parent scroll view: if (this->enableInstrumentation && parentScrollView != null) {}
        // TODO auto scrollContainerSize = alShadow.horizontal : parentScrollView->width : parentScrollView->height;
        // TODO auto scrollOffset = alShadow.horizontal : parentScrollView->contentOffsetX :
        // parentScrollView->contentOffsetY;
        auto startOffset = alShadow.horizontal ? this->left : this->top;
        auto endOffset = alShadow.horizontal ? this->right : this->bottom;
        // TODO auto distanceFromWindowStart = MAX(startOffset - scrollOffset, 0);
        // TODO auto distanceFromWindowEnd = MAX(scrollOffset + this.scrollContainerSize - endOffset, 0);
        // TODO alShadow.computeBlankFromGivenOffset(scrollOffset, distanceFromWindowStart, distanceFromWindowEnd);
        // TODO emitBlankAreaEvent();

        this->getLocalRootArkUINode().setPosition({this->left, this->top});
        this->getLocalRootArkUINode().setSize({this->height, this->width});
    }

    void AutoLayoutViewComponentInstance::fixLayout() {
        // TODO get children nodes and sorted by index
        for (auto child : this->getChildren()) {
            
            if (typeid(child) == typeid(CellContainerComponentInstance)) {
                
            }
        }
        alShadow.offsetFromStart = alShadow.horizontal ? this->left : this->top;
        // TODO pass sortedItems into alShadow.clearGapsAndOverlaps(sortedItems)
    }

    void AutoLayoutViewComponentInstance::fixFooter() {
        // TODO get parentScrollView
        ComponentInstance *parentScrollView; // tmp
        if (this->disableAutoLayout || parentScrollView == nullptr) {
            return;
        }
        // TODO get parentScrollView's width and height
        bool isAutoLayoutEndVisible = true; // tmp
        // TODO auto isAutoLayoutEndVisible = alShadow.horizontal ? (this->right <= parentScrollView->width) :
        // (this->bottom <= parentScrollView->height);
        if (!isAutoLayoutEndVisible) {
            return;
        }
        // TODO get parentView
        ComponentInstance *autoLayoutParent; // tmp
        // TODO get footerView
        CellContainerComponentInstance *footer; // tmp
        auto diff = this->getFooterDiff();
        if (diff == 0 || footer == nullptr || autoLayoutParent == nullptr) {
            return;
        }

        if (alShadow.horizontal) {
            footer->setLeft(footer->getLeft() + static_cast<facebook::react::Float>(diff));
            this->left += diff;
            // TODO autoLayoutParent.layoutMetrics.frame.origin.x += diff
        } else {
            footer->setTop(footer->getTop() + static_cast<facebook::react::Float>(diff));
            this->top += diff;
            // TODO autoLayoutParent.layoutMetrics.frame.origin.y += diff
        }
    }

    int AutoLayoutViewComponentInstance::getFooterDiff() {
        // TODO if children number == 0 {} else if children number ==1  {}
        auto autoLayoutEnd = alShadow.horizontal ? this->right - this->left : this->bottom - this->top;
        return alShadow.lastMaxBoundOverall - autoLayoutEnd;
    }
} // namespace rnoh
