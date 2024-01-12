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

#ifndef FLASH_SRC_MAIN_CPP_PROPS_H
#define FLASH_SRC_MAIN_CPP_PROPS_H

#include <jsi/jsi.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>

namespace facebook {
namespace react {

class JSI_EXPORT AutoLayoutViewProps final : public ViewProps {
  public:
    AutoLayoutViewProps() = default;
    AutoLayoutViewProps(const PropsParserContext& context, const AutoLayoutViewProps &sourceProps, const RawProps &rawProps);

#pragma mark - Props

  bool horizontal{false};
  facebook::react::Float scrollOffset{0.0};
  facebook::react::Float windowSize{0.0};
  facebook::react::Float renderAheadOffset{0.0};
  bool enableInstrumentation{false};
  bool disableAutoLayout{false};
};

class JSI_EXPORT CellContainerProps final : public ViewProps {
  public:
    CellContainerProps() = default;
    CellContainerProps(const PropsParserContext& context, const CellContainerProps &sourceProps, const RawProps &rawProps);

#pragma mark - Props

  int index{0};
};

} // namespace react
} // namespace facebook
#endif
