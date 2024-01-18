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
  Tag,
  ViewDescriptorWrapperBase,
} from 'rnoh';
import { ScrollViewDescriptor } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNScrollView/RNScrollView'
import { ViewBaseDescriptor } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNViewBase/RNViewBase'
import { CellContainerDescriptor } from "./RNCellContainer";
import { AutoLayoutShadow } from "./RNAutoLayoutShadow";
import Logger from './Logger';
import { _RNScrollViewManager } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNScrollView/RNScrollViewManager';

export interface AutoLayoutViewState {}

export interface AutoLayoutViewRawProps extends ViewRawProps {
  scrollOffset?: number
  windowSize?: number
  renderAheadOffset?: number
  horizontal?: number
  enableInstrumentation?: boolean
  disableAutoLayout?: boolean
}

export const FLASH_LIST_TYPE: string = "AutoLayoutView";

export type AutoLayoutViewDescriptor = Descriptor<"AutoLayoutView", ViewBaseProps, AutoLayoutViewState, AutoLayoutViewRawProps>

class AutoLayoutViewDescriptorWrapper extends ViewDescriptorWrapperBase<"AutoLayoutView", ViewBaseProps, AutoLayoutViewState, AutoLayoutViewRawProps> {
}

@Component
export struct RNAutoLayoutView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: AutoLayoutViewDescriptor = Object() as AutoLayoutViewDescriptor
  @State descriptorWrapper: AutoLayoutViewDescriptorWrapper | undefined = undefined
  @State private childrenTags: Tag[] = []
  private alShadow: AutoLayoutShadow = new AutoLayoutShadow()
  private footerDescriptor: CellContainerDescriptor = Object() as CellContainerDescriptor
  private parentViewDescriptor: ViewBaseDescriptor = Object() as ViewBaseDescriptor
  private parentScrollViewDescriptor: ScrollViewDescriptor = Object() as ScrollViewDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<AutoLayoutViewDescriptor>(this.tag)
    this.descriptorWrapper = new AutoLayoutViewDescriptorWrapper(this.descriptor)
    this.onDescriptorChange(this.descriptor)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as AutoLayoutViewDescriptor);
        // this.descriptor = newDescriptor as AutoLayoutViewDescriptor
      }
    )
    Logger.debug(`[RNOH]: in AutoLayoutViewDescriptor rawprops: ${JSON.stringify(this.descriptor.rawProps)}`)
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.();
  }

  onDescriptorChange(newDescriptor: AutoLayoutViewDescriptor) {
    this.childrenTags = this.descriptor.childrenTags;
    this.descriptor = newDescriptor;
    Logger.debug(`[RNOH]: in RNAutoLayoutView this.descriptor: ${JSON.stringify(this.descriptor)}`)
    this.descriptorWrapper = new AutoLayoutViewDescriptorWrapper(this.descriptor);

    const footerTag = this.getFooterTag();
    this.footerDescriptor = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(footerTag);
    Logger.debug(`[RNOH]: in RNAutoLayoutView footer descriptor: ${JSON.stringify(this.footerDescriptor)}`)

    const autoLayoutParentTag = this.descriptor.parentTag;
    this.parentViewDescriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(autoLayoutParentTag);
    Logger.debug(`[RNOH]: in RNAutoLayoutView parentViewDescriptor: ${JSON.stringify(this.parentViewDescriptor)}`)
    const autoLayoutGrandparentTag = this.parentViewDescriptor.parentTag
    const autoLayoutGrandparentDescriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(autoLayoutGrandparentTag);
    Logger.debug(`[RNOH]: in RNAutoLayoutView autoLayoutGrandparentDescriptor: ${JSON.stringify(autoLayoutGrandparentDescriptor)}`)
    const parentScrollViewTag = autoLayoutGrandparentDescriptor.parentTag;
    this.parentScrollViewDescriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(parentScrollViewTag);
    Logger.debug(`[RNOH]: in RNAutoLayoutView parentScrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)

    this.alShadow.horizontal = this.descriptor.rawProps.horizontal === 1
    this.alShadow.scrollOffset = this.descriptor.rawProps.scrollOffset as number
    this.alShadow.windowSize = this.descriptor.rawProps.windowSize as number
    this.alShadow.renderOffset = this.descriptor.rawProps.renderAheadOffset as number

    Logger.debug(`[RNOH]: in RNAutoLayoutView descriptor: ${JSON.stringify(this.descriptor)}`)
    this.fixLayout();
    this.fixFooter();

    if (this.descriptor.rawProps.enableInstrumentation && this.parentScrollViewDescriptor !== null) {
      let scrollContainerSize = this.alShadow.horizontal ?
      this.parentScrollViewDescriptor.layoutMetrics.frame.size.width :
      this.parentScrollViewDescriptor.layoutMetrics.frame.size.height;
      let scrollOffset = this.alShadow.horizontal ?
      this.parentScrollViewDescriptor.props.contentOffsetX :
      this.parentScrollViewDescriptor.props.contentOffsetY;
      let startOffset = this.alShadow.horizontal ?
      this.descriptor.layoutMetrics.frame.origin.x :
      this.descriptor.layoutMetrics.frame.origin.y;
      let endOffset: number = this.alShadow.horizontal ?
        (this.descriptor.layoutMetrics.frame.origin.x + this.descriptor.layoutMetrics.frame.size.width) :
        (this.descriptor.layoutMetrics.frame.origin.y + this.descriptor.layoutMetrics.frame.size.height)

      let distanceFromWindowStart = Math.max(startOffset - scrollOffset, 0)
      let distanceFromWindowEnd = Math.max(scrollOffset + scrollContainerSize - endOffset, 0)
      this.descriptor.rawProps.windowSize = this.descriptor.layoutMetrics.frame.size.height

      this.alShadow.computeBlankFromGivenOffset(scrollOffset, distanceFromWindowStart, distanceFromWindowEnd)
      this.emitBlankAreaEvent();

    }

    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear scrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)
    this.parentScrollViewDescriptor.state.contentSizeHeight = this.parentScrollViewDescriptor.layoutMetrics.frame.size.height;
    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear After scrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)
  }

  fixLayout(): void {
    Logger.debug(`[RNOH]: in RNAutoLayoutView fixLayout: start `)
    if (this.childrenTags.length > 1 && !this.descriptor.rawProps.disableAutoLayout) {
      Logger.debug(`[RNOH]: in RNAutoLayoutView fixLayout children: ` + this.childrenTags)
      this.alShadow.offsetFromStart = this.alShadow.horizontal ?
      this.descriptor.layoutMetrics.frame.origin.x :
      this.descriptor.layoutMetrics.frame.origin.y;
      this.alShadow.clearGapsAndOverlaps(this.childrenTags, this.ctx);
    }
  }

  fixFooter(): void {
    if (this.descriptor.rawProps.disableAutoLayout || this.parentScrollViewDescriptor === null) {
      return;
    }
    const isAutoLayoutEndVisible = this.alShadow.horizontal ?
      (this.descriptor.layoutMetrics.frame.origin.x + this.descriptor.layoutMetrics.frame.size.width) <=
        (this.parentScrollViewDescriptor.layoutMetrics.frame.size.width) :
      (this.descriptor.layoutMetrics.frame.origin.y + this.descriptor.layoutMetrics.frame.size.height) <=
        (this.parentScrollViewDescriptor.layoutMetrics.frame.size.height);
    if (!isAutoLayoutEndVisible) {
      return;
    }
    const diff = this.getFooterDiff();
    if (diff === 0 || this.footerDescriptor == null || this.parentViewDescriptor == null) {
      return;
    }
    if (this.alShadow.horizontal) {
      this.footerDescriptor.layoutMetrics.frame.origin.x += diff;
      this.descriptor.layoutMetrics.frame.origin.x += diff;
      this.parentViewDescriptor.layoutMetrics.frame.origin.x += diff;
    } else {
      this.footerDescriptor.layoutMetrics.frame.origin.y += diff
      this.descriptor.layoutMetrics.frame.origin.y += diff;
      Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear autoLayoutParentDescriptor: ${JSON.stringify(this.parentViewDescriptor)}`)
      this.parentViewDescriptor.layoutMetrics.frame.origin.y += diff;
      Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear After autoLayoutParentDescriptor: ${JSON.stringify(this.parentViewDescriptor)}`)
    }
  }

  getFooterDiff(): number {
    if (this.childrenTags.length === 0) {
      this.alShadow.lastMaxBoundOverall = 0;
    } else {
      const lastChildTag = this.childrenTags[this.childrenTags.length - 1];
      const lastChildDescriptor = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(lastChildTag);
      this.alShadow.lastMaxBoundOverall = this.alShadow.horizontal ?
        (lastChildDescriptor.layoutMetrics.frame.origin.x + lastChildDescriptor.layoutMetrics.frame.size.width) :
        (lastChildDescriptor.layoutMetrics.frame.origin.y + lastChildDescriptor.layoutMetrics.frame.size.height);
    }
    const autoLayoutEnd = this.alShadow.horizontal ? this.descriptor.layoutMetrics.frame.size.width : this.descriptor.layoutMetrics.frame.size.height;
    Logger.debug(`[RNOH]: in RNAutoLayoutView fixFooter getFooterDiff lastMaxBoundOverall: ${JSON.stringify(this.alShadow.lastMaxBoundOverall)}`)
    Logger.debug(`[RNOH]: in RNAutoLayoutView fixFooter getFooterDiff autoLayoutEnd: ${JSON.stringify(autoLayoutEnd)}`)
    return autoLayoutEnd - this.alShadow.lastMaxBoundOverall;
  }

  getFooterTag(): Tag | null {
    let ParentTag: Tag = this.descriptor.parentTag as Tag;
    let ParentDescriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(ParentTag);
    let ParentChildrenTags: Tag[] = ParentDescriptor.childrenTags;
    for (let i = 0; i < ParentChildrenTags.length; i++) {
      const viewTag = ParentChildrenTags[i];
      const cellContainer = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(viewTag);
      if (cellContainer.rawProps.index === -1) {
        Logger.debug(`[RNOH]: in RNAutoLayoutView fixFooter getFooterTag: ${JSON.stringify(viewTag)}`)
        return viewTag;
      }
    }
    return null;
  }

  // sortTagByIndex(childrenTags: Tag[]): Tag[] {
  //   let TagIndexMap = new List<[Tag, number]>();
  //   for (let idx = 0; idx < childrenTags.length; idx++) {
  //     const ChildDescriptor: CellContainerDescriptor = this.ctx.descriptorRegistry.getDescriptor(childrenTags[idx]) as CellContainerDescriptor;
  //     TagIndexMap.add([childrenTags[idx], ChildDescriptor.props.index])
  //     Logger.debug(`[RNOH]: before TagIndexMap: ${TagIndexMap[idx]}`)
  //   }
  //   TagIndexMap.sort((a, b) => a[1] - b[1])
  //   for (let idx = 0; idx < TagIndexMap.length; idx++) {
  //     Logger.debug(`[RNOH]: after TagIndexMap: ${TagIndexMap[idx]}`)
  //   }
  //   return
  // }

  emitBlankAreaEvent() {
    this.ctx.rnInstance.emitComponentEvent(
      this.descriptor.tag,
      FLASH_LIST_TYPE,
      {
        offsetStart: this.alShadow.blankOffsetAtStart,
        offsetEnd: this.alShadow.blankOffsetAtEnd,
      }
    )
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, (childrenTag: Tag) => childrenTag.toString())
    }
  }
}