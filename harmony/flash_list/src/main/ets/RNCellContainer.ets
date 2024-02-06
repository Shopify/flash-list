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

import {
  Descriptor,
  ComponentBuilderContext,
  RNComponentFactory,
  RNOHContext,
  RNViewBase,
  ViewBaseProps,
  ViewRawProps,
  ColorSegments,
  BorderColors,
  Tag,
  ViewDescriptorWrapperBase
} from 'rnoh';
import Logger from './Logger';

export const CELL_CONTAINER_TYPE: string = "CellContainer";

export interface CellContainerRawProps extends ViewRawProps {
  index?: number
}

export interface CellContainerState {}

export type CellContainerDescriptor = Descriptor<"CellContainer", ViewBaseProps, CellContainerState, CellContainerRawProps>

class CellContainerDescriptorWrapper extends ViewDescriptorWrapperBase<"CellContainer", ViewBaseProps, CellContainerState, CellContainerRawProps> {
}

@Component
export struct RNCellContainer {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: CellContainerDescriptor = Object() as CellContainerDescriptor
  @State descriptorWrapper: CellContainerDescriptorWrapper | undefined = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  @State index: number = -1;
  // @State private childrenTags: Tag[] = []

  aboutToAppear() {
    this.initComponent();
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(this.tag)
    this.descriptorWrapper = new CellContainerDescriptorWrapper(this.descriptor)

    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as CellContainerDescriptor)
      }
    )
    Logger.debug(`[RNOH]: in RNCellContainer descriptor: ${JSON.stringify(this.descriptor)}`)
    Logger.debug(`[RNOH]: in RNCellContainer descriptorWrapper: ${JSON.stringify(this.descriptorWrapper)}`)
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  initComponent() {
    let descriptor = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(this.tag);
    this.setDescriptor(descriptor)
    // const parentTag = descriptor.parentTag;
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.setDescriptor(newDescriptor as CellContainerDescriptor)
      }
    )
  }

  private setDescriptor(descriptor: CellContainerDescriptor) {
    this.descriptorWrapper = new CellContainerDescriptorWrapper(descriptor)
  }

  setIndex(value: number): void {
    this.index = value;
  }

  getIndex(): number {
    Logger.debug(`[RNOH]: in RNCellContainer index: ${JSON.stringify(this.index)}`)
    return this.index;
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      ForEach(this.descriptor.childrenTags, (tag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: tag, buildCustomComponent: this.buildCustomComponent })
      }, (tag: Tag) => tag.toString())
    }
  }
}
