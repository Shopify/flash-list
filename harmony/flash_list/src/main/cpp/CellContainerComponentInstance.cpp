#include "CellContainerComponentInstance.h"

namespace rnoh {

    CellContainerComponentInstance::CellContainerComponentInstance(Context context, facebook::react::Tag tag)
        : CppComponentInstance(std::move(context), tag) {}

    void CellContainerComponentInstance::insertChild(ComponentInstance::Shared childComponentInstance,
                                                     std::size_t index) {
        CppComponentInstance::insertChild(childComponentInstance, index);
        m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }

    void CellContainerComponentInstance::removeChild(ComponentInstance::Shared childComponentInstance) {
        CppComponentInstance::removeChild(childComponentInstance);
        m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
    };

    StackNode &CellContainerComponentInstance::getLocalRootArkUINode() { return m_stackNode; }

    void CellContainerComponentInstance::setIndex(int const &) { this->index = index; }

    int CellContainerComponentInstance::getIndex() { return this->index; }
    void CellContainerComponentInstance::setLeft(facebook::react::Float const &left) { this->left = left; }
    facebook::react::Float CellContainerComponentInstance::getLeft() { return this->left; }
    void CellContainerComponentInstance::setTop(facebook::react::Float const &top) { this->top = top; }
    facebook::react::Float CellContainerComponentInstance::getTop() { return this->top; }
    void CellContainerComponentInstance::setRight(facebook::react::Float const &right) { this->right = right; }
    facebook::react::Float CellContainerComponentInstance::getRight() { return this->right; }
    void CellContainerComponentInstance::setBottom(facebook::react::Float const &bottom) { this->bottom = bottom; }
    facebook::react::Float CellContainerComponentInstance::getBottom() { return this->bottom; }
    void CellContainerComponentInstance::setHeight(facebook::react::Float const &height) { this->height = height; }
    facebook::react::Float CellContainerComponentInstance::getHeight() { return this->height; }
    void CellContainerComponentInstance::setWidth(facebook::react::Float const &width) { this->width = width; }
    facebook::react::Float CellContainerComponentInstance::getWidth() { return this->width; }

    void CellContainerComponentInstance::setProps(facebook::react::Props::Shared props) {
        CppComponentInstance::setProps(props);
        if (auto p = std::dynamic_pointer_cast<const facebook::react::CellContainerProps>(props)) {
            LOG(INFO) << "[clx] CellContainerComponentInstance::setProps" << p->index;
            this->setIndex(p->index);
        }
    }

    void CellContainerComponentInstance::setLayout(facebook::react::LayoutMetrics layoutMetrics) {
        this->setTop(layoutMetrics.frame.origin.y);
        this->setBottom(layoutMetrics.frame.origin.y + layoutMetrics.frame.size.height);
        this->setLeft(layoutMetrics.frame.origin.x);
        this->setRight(layoutMetrics.frame.origin.x + layoutMetrics.frame.size.width);
        this->setHeight(layoutMetrics.frame.size.height);
        this->setWidth(layoutMetrics.frame.size.width);

        this->getLocalRootArkUINode().setPosition(layoutMetrics.frame.origin);
        this->getLocalRootArkUINode().setSize(layoutMetrics.frame.size);
    }

} // namespace rnoh