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

import List from '@ohos.util.List'

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
  RNViewManager
} from 'rnoh';
import { ScrollViewDescriptor } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNScrollView/RNScrollView'
import { ViewBaseDescriptor } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNViewBase/RNViewBase'
import { CellContainerDescriptor, CellContainerProps, CellContainerRawProps } from "./RNCellContainer";
import { AutoLayoutShadow } from "./RNAutoLayoutShadow";
import Logger from './Logger';
import { _RNScrollViewManager } from 'rnoh/src/main/ets/RNOHCorePackage/components/RNScrollView/RNScrollViewManager';

export interface AutoLayoutViewProps extends ViewBaseProps {
  scrollOffset?: number
  windowSize?: number
  renderAheadOffset?: number
  horizontal?: number
  enableInstrumentation?: boolean
  disableAutoLayout?: boolean
}

export interface AutoLayoutViewState {}

export interface AutoLayoutViewRawProps extends ViewRawProps {
  top: number
  left: number
  height: number
  width: number
}

export const FLASH_LIST_TYPE: string = "AutoLayoutView";

export type AutoLayoutViewDescriptor = Descriptor<"AutoLayoutView", AutoLayoutViewProps, AutoLayoutViewState, AutoLayoutViewRawProps>

class AutoLayoutViewDescriptorWrapper extends ViewDescriptorWrapperBase<"AutoLayoutView", AutoLayoutViewProps, AutoLayoutViewState, AutoLayoutViewRawProps> {
}

@Component
export struct RNAutoLayoutView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: AutoLayoutViewDescriptor = Object() as AutoLayoutViewDescriptor
  @State descriptorWrapper: AutoLayoutViewDescriptorWrapper | undefined = undefined
  @State private childrenTags: Tag[] = []
  // public componentManager!: RNViewManager


  private alShadow: AutoLayoutShadow = new AutoLayoutShadow()
  private footerDescriptor: CellContainerDescriptor = Object() as CellContainerDescriptor
  private parentViewDescriptor: ViewBaseDescriptor = Object() as ViewBaseDescriptor
  private parentScrollViewDescriptor: ScrollViewDescriptor = Object() as ScrollViewDescriptor

  private unregisterDescriptorChangesListener?: () => void = undefined
  // private unregisterComponentManager?: () => void = undefined
  // private unregisterCommandCallback?: () => void = undefined
  // private cleanupCallback?: () => void = undefined


  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<AutoLayoutViewDescriptor>(this.tag)
    this.descriptorWrapper = new AutoLayoutViewDescriptorWrapper(this.descriptor)
    // if(!this.componentManager) {
    //   this.componentManager = new RNViewManager(this.tag, this.ctx)
    // }
    this.onDescriptorChange(this.descriptor)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as AutoLayoutViewDescriptor);
      }
    )
  }

  aboutToDisappear() {
    Logger.info('RNAutoLayoutView aboutToDisappear');
    // this.cleanupCallback?.();
    this.unregisterDescriptorChangesListener?.();
    // this.unregisterComponentManager?.();
    // this.unregisterCommandCallback?.();
  }

  onDescriptorChange(newDescriptor: AutoLayoutViewDescriptor) {
    this.childrenTags = this.descriptor.childrenTags;
    this.descriptor = newDescriptor;
    this.descriptorWrapper = new AutoLayoutViewDescriptorWrapper(this.descriptor);

    const footerTag = this.getFooterTag();
    this.footerDescriptor = this.ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(footerTag);
    Logger.debug(`[RNOH]: in RNAutoLayoutView footer descriptor: ${JSON.stringify(this.footerDescriptor)}`)
    Logger.debug(`[RNOH]: in RNAutoLayoutView is horizontal: ${this.descriptor.props.horizontal}`)

    const autoLayoutParentTag = this.descriptor.parentTag;
    this.parentViewDescriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(autoLayoutParentTag);

    const autoLayoutGrandparentTag = this.parentViewDescriptor.parentTag
    const autoLayoutGrandparentDescriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(autoLayoutGrandparentTag);

    const parentScrollViewTag = autoLayoutGrandparentDescriptor.parentTag;
    this.parentScrollViewDescriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(parentScrollViewTag);

    this.alShadow.horizontal = this.descriptor.props.horizontal === 1
    this.alShadow.scrollOffset = this.descriptor.props.scrollOffset as number
    this.alShadow.windowSize = this.descriptor.props.windowSize as number
    this.alShadow.renderOffset = this.descriptor.props.renderAheadOffset as number

    this.updateAutoLayout();
    this.emitBlankAreaEvent();

    // const autoLayoutParentTag: number = this.descriptor.parentTag;
    // const autoLayoutParentDescriptor: ViewBaseDescriptor = this.ctx.descriptorRegistry.getDescriptor(autoLayoutParentTag) as ViewBaseDescriptor


    // const autoLayoutGrandparentTag = autoLayoutParentDescriptor.parentTag;
    // const autoLayoutGrandparentDescriptor: ViewBaseDescriptor = this.ctx.descriptorRegistry.getDescriptor(autoLayoutGrandparentTag) as ViewBaseDescriptor;
    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear autoLayoutGrandparentDescriptor: ${JSON.stringify(autoLayoutGrandparentDescriptor)}`)
    autoLayoutGrandparentDescriptor.rawProps.height = this.descriptor.rawProps.height + this.footerDescriptor?.rawProps.height;
    autoLayoutGrandparentDescriptor.layoutMetrics.frame.size.height = autoLayoutGrandparentDescriptor.rawProps.height;
    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear After autoLayoutGrandparentDescriptor: ${JSON.stringify(autoLayoutGrandparentDescriptor)}`)

    // const parentScrollViewTag = autoLayoutGrandparentDescriptor.parentTag;
    // this.parentScrollView = this.ctx.descriptorRegistry.getDescriptor(parentScrollViewTag) as ScrollViewDescriptor
    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear scrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)
    this.parentScrollViewDescriptor.rawProps.height = this.descriptor.rawProps.height + this.footerDescriptor?.rawProps.height;
    this.parentScrollViewDescriptor.state.contentSizeHeight = this.parentScrollViewDescriptor.rawProps.height;
    Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear After scrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)
  }

  fixLayout(): void {
    Logger.debug(`[RNOH]: in RNAutoLayoutView fixLayout: start `)
    if (this.childrenTags.length > 1 && !this.descriptor.props.disableAutoLayout) {
      Logger.debug(`[RNOH]: in RNAutoLayoutView fixLayout children: ` + this.childrenTags)
      this.alShadow.offsetFromStart = this.alShadow.horizontal ? this.descriptor.rawProps.left : this.descriptor.rawProps.top;
      this.alShadow.clearGapsAndOverlaps(this.childrenTags, this.ctx);
    }
  }

  updateAutoLayout() {
    // this.children = this.ctx.descriptorRegistry.getDescriptor(this.tag).childrenTags;
    Logger.debug(`[RNOH]: in RNAutoLayoutView descriptor: ${JSON.stringify(this.descriptor)}`)
    this.fixLayout();
    this.fixFooter();

    let scrollContainerSize: number = this.alShadow.horizontal ? this.parentScrollViewDescriptor.rawProps.width as number : this.parentScrollViewDescriptor.rawProps.height as number

    let scrollOffset: number = this.alShadow.horizontal ? this.parentScrollViewDescriptor.props.contentOffsetX : this.parentScrollViewDescriptor.props.contentOffsetY

    let startOffset: number = this.alShadow.horizontal ? this.descriptor.rawProps.left : this.descriptor.rawProps.top
    let endOffset: number = this.alShadow.horizontal ? (this.descriptor.rawProps.left + this.descriptor.rawProps.width) : (this.descriptor.rawProps.top + this.descriptor.rawProps.height)

    let distanceFromWindowStart: number = Math.max(startOffset - scrollOffset, 0)
    let distanceFromWindowEnd: number = Math.max(scrollOffset + scrollContainerSize - endOffset, 0)
    this.descriptor.props.windowSize = this.descriptor.rawProps.height

    this.alShadow.computeBlankFromGivenOffset(scrollOffset, distanceFromWindowStart, distanceFromWindowEnd)
  }

  fixFooter(): void {
    if (this.descriptor.props.disableAutoLayout || this.parentScrollViewDescriptor == null) {
      return;
    }
    Logger.debug(`[RNOH]: in RNAutoLayoutView fixFooter scrollViewDescriptor: ${JSON.stringify(this.parentScrollViewDescriptor)}`)
    const isAutoLayoutEndVisible = this.alShadow.horizontal ?
      (this.descriptor?.rawProps.left + this.descriptor?.rawProps.width) <= (this.parentScrollViewDescriptor.rawProps.width as number) :
      (this.descriptor?.rawProps.top + this.descriptor?.rawProps.height) <= (this.parentScrollViewDescriptor.rawProps.height as number);
    if (!isAutoLayoutEndVisible) {
      return;
    }
    const diff = this.getFooterDiff();
    if (diff === 0 || this.footerDescriptor == null || this.parentViewDescriptor == null) {
      return;
    }

    if (this.alShadow.horizontal) {
      this.footerDescriptor.rawProps.left += diff;
      this.descriptor.rawProps.left += diff;
      this.parentViewDescriptor.rawProps.left = this.parentViewDescriptor.rawProps.left as number + diff;
    } else {
      // TODO diff 待确定
      // this.descriptor.props.top = this.descriptor.props.top - 100;
      if (this.footerDescriptor) this.footerDescriptor.rawProps.top = this.descriptor.rawProps.height;
      this.descriptor.rawProps.height = this.descriptor.rawProps.height - diff;
      Logger.debug(`[RNOH]: in RNAutoLayoutView aboutToAppear autoLayoutParentDescriptor: ${JSON.stringify(this.parentViewDescriptor)}`)
      this.parentViewDescriptor.rawProps.height = this.descriptor.rawProps.height + this.footerDescriptor?.rawProps.height;
      this.parentViewDescriptor.layoutMetrics.frame.size.height = this.parentViewDescriptor.rawProps.height;
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
        (lastChildDescriptor.rawProps.left + lastChildDescriptor.rawProps.width) :
        (lastChildDescriptor.rawProps.top + lastChildDescriptor.rawProps.height)
    }
    const autoLayoutEnd = this.alShadow.horizontal ? this.descriptor.rawProps.width : this.descriptor.rawProps.height;
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
      if (cellContainer.props.index === -1) {
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
        // blankArea: Math.max(this.alShadow.blankOffsetAtStart, this.alShadow.blankOffsetAtEnd)
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