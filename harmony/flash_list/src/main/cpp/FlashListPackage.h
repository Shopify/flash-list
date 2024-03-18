/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#ifndef FLASH_SRC_MAIN_CPP_FLASHLISTPACKAGE_H
#define FLASH_SRC_MAIN_CPP_FLASHLISTPACKAGE_H

#include "ComponentDescriptors.h"
#include "RNOH/Package.h"
#include "AutoLayoutViewJSIBinder.h"
#include "CellContainerJSIBinder.h"
#include "AutoLayoutViewEventEmitRequestHandler.h"
#include "AutoLayoutViewComponentInstance.h"
#include "CellContainerComponentInstance.h"

using namespace rnoh;
using namespace facebook;

class FlashListComponentInstanceFactoryDelegate : public ComponentInstanceFactoryDelegate {
public:
    using ComponentInstanceFactoryDelegate::ComponentInstanceFactoryDelegate;

    ComponentInstance::Shared create(ComponentInstance::Context ctx) override {
        if (ctx.componentName == "AutoLayoutView") {
            return std::make_shared<AutoLayoutViewComponentInstance>(std::move(ctx));
        } else if (ctx.componentName == "CellContainer") {
            return std::make_shared<CellContainerComponentInstance>(std::move(ctx));
        }
        return nullptr;
    }
};

class FlashListPackage : public Package {
  public:
    FlashListPackage(Package::Context ctx) : Package(ctx) {}

    ComponentInstanceFactoryDelegate::Shared createComponentInstanceFactoryDelegate() override {
        return std::make_shared<FlashListComponentInstanceFactoryDelegate>(m_ctx);
    }

    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override {
      return {
        facebook::react::concreteComponentDescriptorProvider<facebook::react::AutoLayoutViewComponentDescriptor>(),
        facebook::react::concreteComponentDescriptorProvider<facebook::react::CellContainerComponentDescriptor>(),
      };
    }

    ComponentJSIBinderByString createComponentJSIBinderByName() override {
      return {
        {"AutoLayoutView", std::make_shared<AutoLayoutViewJSIBinder>()},
        {"CellContainer", std::make_shared<CellContainerJSIBinder>()}
      };
    };

    EventEmitRequestHandlers createEventEmitRequestHandlers() override {
      return {std::make_shared<AutoLayoutViewEventEmitRequestHandler>()};
    };
};
#endif
