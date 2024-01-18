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

#ifndef FLASH_SRC_MAIN_CPP_SHADOWNODES_H
#define FLASH_SRC_MAIN_CPP_SHADOWNODES_H

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>
#include <jsi/jsi.h>
#include "EventEmitters.h"

namespace facebook {
namespace react {

JSI_EXPORT extern const char AutoLayoutViewComponentName[];
JSI_EXPORT extern const char CellContainerComponentName[];


using AutoLayoutViewShadowNode =
    ConcreteViewShadowNode<AutoLayoutViewComponentName, ViewProps, AutoLayoutViewEventEmitter>;

using CellContainerShadowNode =
    ConcreteViewShadowNode<CellContainerComponentName, ViewProps, ViewEventEmitter>;

} // namespace react
} // namespace facebook
#endif
