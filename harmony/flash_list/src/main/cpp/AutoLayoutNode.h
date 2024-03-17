#pragma once

#include "RNOH/arkui/ArkUINode.h"
#include "RNOH/arkui/NativeNodeApi.h"

namespace rnoh {

    class AutoLayoutNodeDelegate {
    public:
        virtual ~AutoLayoutNodeDelegate() = default;
        virtual void onAppear(){};
        virtual void emitBlankAreaEvent(){};
    };

    class AutoLayoutNode : public ArkUINode {
    protected:
        AutoLayoutNodeDelegate *m_autoLayoutNodeDelegate;

    public:
        AutoLayoutNode();
        ~AutoLayoutNode() override;

        void insertChild(ArkUINode &child, std::size_t index);
        void removeChild(ArkUINode &child);
        void onNodeEvent(ArkUI_NodeEvent *event) override;
        void setAutoLayoutNodeDelegate(AutoLayoutNodeDelegate *autoLayoutNodeDelegate);

        void setMargin(float top, float right, float bottom, float left);

        void setAlign(int32_t align);
    };

} // namespace rnoh