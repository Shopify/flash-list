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

#include "Props.h"
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

AutoLayoutViewProps::AutoLayoutViewProps(
  const PropsParserContext &context,
  const AutoLayoutViewProps &sourceProps,
  const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

  horizontal(convertRawProp(context, rawProps, "horizontal", sourceProps.horizontal, {false})),
  scrollOffset(convertRawProp(context, rawProps, "scrollOffset", sourceProps.scrollOffset, {0.0})),
  windowSize(convertRawProp(context, rawProps, "windowSize", sourceProps.windowSize, {0.0})),
  renderAheadOffset(convertRawProp(context, rawProps, "renderAheadOffset", sourceProps.renderAheadOffset, {0.0})),
  enableInstrumentation(convertRawProp(context, rawProps, "enableInstrumentation", sourceProps.enableInstrumentation, {false})),
  disableAutoLayout(convertRawProp(context, rawProps, "disableAutoLayout", sourceProps.disableAutoLayout, {false})) {}

CellContainerProps::CellContainerProps(
  const PropsParserContext &context,
  const CellContainerProps &sourceProps,
  const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),
  
  index(convertRawProp(context, rawProps, "index", sourceProps.index, {0})) {}

} // namespace react
} // namespace facebook