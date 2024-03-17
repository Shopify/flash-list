#include "AutoLayoutNode.h"
#include <memory>
#include <glog/logging.h>

namespace rnoh {

    AutoLayoutNode::AutoLayoutNode()
        : ArkUINode(NativeNodeApi::getInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_STACK)) {
        maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(m_nodeHandle, NODE_EVENT_ON_APPEAR, 0));
    }

    void AutoLayoutNode::insertChild(ArkUINode &child, std::size_t index) {
        maybeThrow(NativeNodeApi::getInstance()->addChild(m_nodeHandle, child.getArkUINodeHandle()));
    }

    void AutoLayoutNode::removeChild(ArkUINode &child) {
        maybeThrow(NativeNodeApi::getInstance()->removeChild(m_nodeHandle, child.getArkUINodeHandle()));
    }

    void AutoLayoutNode::onNodeEvent(ArkUI_NodeEvent *event) {
        LOG(INFO) << "[clx] <AutoLayoutNode::onNodeEvent> in!";
        if (event->kind == ArkUI_NodeEventType::NODE_EVENT_ON_APPEAR) {
            LOG(INFO) << "[clx] <AutoLayoutNode::onNodeEvent> onApear!";
            m_autoLayoutNodeDelegate->onAppear();
        }
    }

    void AutoLayoutNode::setAutoLayoutNodeDelegate(AutoLayoutNodeDelegate *scrollNodeDelegate) {
        m_autoLayoutNodeDelegate = scrollNodeDelegate;
    }

    AutoLayoutNode::~AutoLayoutNode() {
        NativeNodeApi::getInstance()->unregisterNodeEvent(m_nodeHandle, NODE_EVENT_ON_APPEAR);
    }

    void AutoLayoutNode::setMargin(float top, float right, float bottom, float left) {
        ArkUI_NumberValue value[] = {top, right, bottom, left};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_MARGIN, &item));
    }

    void AutoLayoutNode::setAlign(int32_t align) {
        ArkUI_NumberValue value[] = {{.i32 = align}};
        ArkUI_AttributeItem item = {.value = value, .size = 1};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_STACK_ALIGN_CONTENT, &item));
    }
} // namespace rnoh
