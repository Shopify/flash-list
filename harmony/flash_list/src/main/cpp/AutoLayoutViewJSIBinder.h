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

#ifndef FLASH_SRC_MAIN_CPP_AUTOLAYOUTVIEWEVENTEMITREQUESTHANDLER_H
#define FLASH_SRC_MAIN_CPP_AUTOLAYOUTVIEWJSIBINDER_H

#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class AutoLayoutViewJSIBinder : public ViewComponentJSIBinder {
  facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
    auto object = ViewComponentJSIBinder::createNativeProps(rt);
    object.setProperty(rt, "horizontal", "boolean");
    object.setProperty(rt, "scrollOffset", "float");
    object.setProperty(rt, "windowSize", "float");
    object.setProperty(rt, "renderAheadOffset", "float");
    object.setProperty(rt, "enableInstrumentation", "boolean");
    object.setProperty(rt, "disableAutoLayout", "boolean");
    return object;
  }

  facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override {
    facebook::jsi::Object events(rt);
    events.setProperty(rt, "topBlankAreaEvent", createDirectEvent(rt, "onBlankAreaEvent"));
    return events;
  }

};
} // namespace rnoh
#endif
