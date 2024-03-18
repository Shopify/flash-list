#include "AutoLayoutViewComponentInstance.h"
#include "RNOHCorePackage/ComponentInstances/ViewComponentInstance.h"
#include "folly/Synchronized.h"
#include "folly/synchronization/Lock.h"
#include <mutex>
#include <sys/param.h>
namespace rnoh {

    AutoLayoutViewComponentInstance::AutoLayoutViewComponentInstance(Context context)
        : CppComponentInstance(std::move(context)) {
        m_autoLayoutNode.setAutoLayoutNodeDelegate(this);
    }

    void AutoLayoutViewComponentInstance::insertChild(ComponentInstance::Shared childComponentInstance,
                                                      std::size_t index) {
        CppComponentInstance::insertChild(childComponentInstance, index);
        m_autoLayoutNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }

    AutoLayoutNode &AutoLayoutViewComponentInstance::getLocalRootArkUINode() { return m_autoLayoutNode; }

    void AutoLayoutViewComponentInstance::removeChild(ComponentInstance::Shared childComponentInstance) {
        CppComponentInstance::removeChild(childComponentInstance);
        m_autoLayoutNode.removeChild(childComponentInstance->getLocalRootArkUINode());
    };

    void AutoLayoutViewComponentInstance::finalizeUpdates() {
        if (parentScrollView != nullptr) {
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::finalizeUpdates>";
            onAppear();
        }
        this->getLocalRootArkUINode().markDirty();
    }

    void AutoLayoutViewComponentInstance::setLeft(facebook::react::Float const &left) {
        m_layoutMetrics.frame.origin.x = left;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getLeft() { return m_layoutMetrics.frame.origin.x; }
    void AutoLayoutViewComponentInstance::setTop(facebook::react::Float const &top) {
        m_layoutMetrics.frame.origin.y = top;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getTop() { return m_layoutMetrics.frame.origin.y; }
    void AutoLayoutViewComponentInstance::setRight(facebook::react::Float const &right) {
        m_layoutMetrics.frame.origin.x = right - m_layoutMetrics.frame.size.width;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getRight() {
        return m_layoutMetrics.frame.origin.x + m_layoutMetrics.frame.size.width;
    }
    void AutoLayoutViewComponentInstance::setBottom(facebook::react::Float const &bottom) {
        m_layoutMetrics.frame.origin.y = bottom - m_layoutMetrics.frame.size.height;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getBottom() {
        return m_layoutMetrics.frame.origin.y + m_layoutMetrics.frame.size.height;
    }
    void AutoLayoutViewComponentInstance::setHeight(facebook::react::Float const &height) {
        m_layoutMetrics.frame.size.height = height;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getHeight() { return m_layoutMetrics.frame.size.height; }
    void AutoLayoutViewComponentInstance::setWidth(facebook::react::Float const &width) {
        m_layoutMetrics.frame.size.width = width;
    }
    facebook::react::Float AutoLayoutViewComponentInstance::getWidth() { return m_layoutMetrics.frame.size.width; }

    void AutoLayoutViewComponentInstance::onAppear() {
        fixLayout();
        fixFooter();
//         getLocalRootArkUINode().markDirty();

        parentScrollView = getParentScrollView();
        if (enableInstrumentation && parentScrollView != nullptr) {
            auto scrollContainerSize = alShadow.horizontal
                                           ? parentScrollView->getScrollViewMetrics().containerSize.width
                                           : parentScrollView->getScrollViewMetrics().containerSize.height;
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> scrollContainerSize:"
                      << scrollContainerSize;
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> parentScrollView node address:"
                      << &parentScrollView->getLocalRootArkUINode();
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> parentScrollView nodeHandle address:"
                      << parentScrollView->getLocalRootArkUINode().getArkUINodeHandle();
            auto scrollOffset = alShadow.horizontal ? parentScrollView->getLocalRootArkUINode().getScrollOffset().x
                                                    : parentScrollView->getLocalRootArkUINode().getScrollOffset().y;
            
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> scrollOffset:" << scrollOffset;
            auto startOffset = alShadow.horizontal ? getLeft() : getTop();
            auto endOffset = alShadow.horizontal ? getRight() : getBottom();

            auto distanceFromWindowStart = MAX(startOffset - scrollOffset, 0);
            auto distanceFromWindowEnd = MAX(scrollOffset + scrollContainerSize - endOffset, 0);
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> distanceFromWindowStart:"
                      << distanceFromWindowStart;
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::onAppear> distanceFromWindowEnd:"
                      << distanceFromWindowEnd;
            alShadow.computeBlankFromGivenOffset(static_cast<int>(scrollOffset),
                                                 static_cast<int>(distanceFromWindowStart),
                                                 static_cast<int>(distanceFromWindowEnd));
            emitBlankAreaEvent();
        }
    }

    void AutoLayoutViewComponentInstance::setProps(facebook::react::Props::Shared props) {
        CppComponentInstance::setProps(props);
        auto autoLayoutViewProps = std::dynamic_pointer_cast<const facebook::react::AutoLayoutViewProps>(props);
        if (autoLayoutViewProps == nullptr) {
            return;
        }
        horizontal = autoLayoutViewProps->horizontal;
        scrollOffset = autoLayoutViewProps->scrollOffset;
        windowSize = autoLayoutViewProps->windowSize;
        renderAheadOffset = autoLayoutViewProps->renderAheadOffset;
        enableInstrumentation = autoLayoutViewProps->enableInstrumentation;
        disableAutoLayout = autoLayoutViewProps->disableAutoLayout;
        if (parentScrollView != nullptr) {
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::setProps> onAppear";
            onAppear();
        }

        LOG(INFO) << "[clx] autoLayoutViewProps" << autoLayoutViewProps->renderAheadOffset;
    }

    void AutoLayoutViewComponentInstance::fixLayout() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::fixLayout>";
        alShadow.offsetFromStart = alShadow.horizontal ? getLeft() : getTop();
        alShadow.clearGapsAndOverlaps(getChildren());
        setLayout(m_layoutMetrics);
    }

    void AutoLayoutViewComponentInstance::fixFooter() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::fixFooter>";
        parentScrollView = getParentScrollView();
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::fixFooter> get parentScrollView success!"
                  << &parentScrollView->getLocalRootArkUINode();
        if (disableAutoLayout || parentScrollView == nullptr) {
            return;
        }
        auto isAutoLayoutEndVisible = alShadow.horizontal
                                          ? getRight() <= parentScrollView->getLayoutMetrics().frame.size.width
                                          : getBottom() <= parentScrollView->getLayoutMetrics().frame.size.height;
        if (!isAutoLayoutEndVisible) {
            return;
        }
        auto autoLayoutParent = getParent().lock();
        auto footer = getFooter();
        auto diff = static_cast<facebook::react::Float>(getFooterDiff());
        if (diff == 0 || footer == nullptr || autoLayoutParent == nullptr) {
            return;
        }

        if (alShadow.horizontal) {
            footer->setLeft(footer->getLeft() + diff);
            m_layoutMetrics.frame.origin.x += diff;
            // TODO autoLayoutParent.layoutMetrics.frame.origin.x += diff
        } else {
            footer->setTop(footer->getTop() + diff);
            m_layoutMetrics.frame.origin.y += diff;
            // TODO autoLayoutParent.layoutMetrics.frame.origin.y += diff
        }
        footer->setLayout(footer->getLayoutMetrics());
    }

    int AutoLayoutViewComponentInstance::getFooterDiff() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::getFooterDiff>";
        if (getChildren().empty()) {
            alShadow.lastMaxBoundOverall = 0;
        } else if (getChildren().size() == 1) {
            auto firstChild = std::dynamic_pointer_cast<rnoh::CellContainerComponentInstance>(getChildren()[0]);
            alShadow.lastMaxBoundOverall = alShadow.horizontal ? firstChild->getRight() : firstChild->getBottom();
        }
        auto autoLayoutEnd = alShadow.horizontal ? getRight() - getLeft() : getBottom() - getTop();
        return alShadow.lastMaxBoundOverall - autoLayoutEnd;
    }

    std::shared_ptr<rnoh::CellContainerComponentInstance> AutoLayoutViewComponentInstance::getFooter() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::getFooter>";
        for (auto const child : getChildren()) {
            auto childInstance = std::dynamic_pointer_cast<rnoh::CellContainerComponentInstance>(child);
            if (childInstance != nullptr && childInstance->getIndex() == -1) {
                return childInstance;
            }
        }
        return nullptr;
    }

    std::shared_ptr<rnoh::ScrollViewComponentInstance> AutoLayoutViewComponentInstance::getParentScrollView() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::getParentScrollView>";
        auto autoLayoutParent = getParent().lock();
        while (autoLayoutParent) {
            LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::getParentScrollView> Loop!";
            auto scrollView = std::dynamic_pointer_cast<rnoh::ScrollViewComponentInstance>(autoLayoutParent);
            if (scrollView) {
                LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::getParentScrollView> scrollView address: "
                          << &scrollView->getLocalRootArkUINode();
                return scrollView;
            }
            autoLayoutParent = autoLayoutParent->getParent().lock();
        }
        return nullptr;
    }

    void AutoLayoutViewComponentInstance::setEventEmitter(facebook::react::SharedEventEmitter eventEmitter) {
        CppComponentInstance::setEventEmitter(eventEmitter);
        auto autoLayoutViewEventEmitter =
            std::dynamic_pointer_cast<const facebook::react::AutoLayoutViewEventEmitter>(eventEmitter);
        if (autoLayoutViewEventEmitter == nullptr) {
            return;
        }
        m_autoLayoutViewEventEmitter = autoLayoutViewEventEmitter;
    }

    void AutoLayoutViewComponentInstance::emitBlankAreaEvent() {
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::emitBlankAreaEvent>";
        AutoLayoutViewEventEmitter::OnBlankAreaEvent blankAreaEvent;
        blankAreaEvent.offsetStart = static_cast<int>(alShadow.blankOffsetAtStart / pixelDensity);
        blankAreaEvent.offsetEnd = static_cast<int>(alShadow.blankOffsetAtEnd / pixelDensity);
        LOG(INFO) << "[clx] <AutoLayoutViewComponentInstance::emitBlankAreaEvent> :" << blankAreaEvent.offsetStart
                  << ", " << blankAreaEvent.offsetEnd;
        m_autoLayoutViewEventEmitter->onBlankAreaEvent(blankAreaEvent);
    }
} // namespace rnoh
