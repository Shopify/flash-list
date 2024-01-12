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

import { CellContainerDescriptor } from "./RNCellContainer";
import { RNOHContext } from 'rnoh';
import Logger from './Logger';

export class AutoLayoutShadow {
  horizontal: boolean = false;
  scrollOffset: number = 0;
  offsetFromStart: number = 0;
  windowSize: number = 0;
  renderOffset: number = 0;

  blankOffsetAtStart: number = 0; // Tracks blank area from the top
  blankOffsetAtEnd: number = 0; // Tracks blank area from the bottom

  lastMaxBoundOverall: number = 0; // Tracks where the last pixel is drawn in the overall

  private lastMaxBound: number = 0; // Tracks where the last pixel is drawn in the visible window
  private lastMinBound: number = 0; // Tracks where first pixel is drawn in the visible window

  /** Checks for overlaps or gaps between adjacent items and then applies a correction (Only Grid layouts with varying spans)
   * Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on Android side. Not expecting any major perf issue. */
  clearGapsAndOverlaps(sortedItems: number[], ctx: RNOHContext): void {
    let maxBound = 0;
    let minBound = Number.MAX_SAFE_INTEGER;
    let maxBoundNeighbour = 0;
    this.lastMaxBoundOverall = 0;
    for (let i = 0; i < sortedItems.length - 1; i++) {
      const cell: CellContainerDescriptor =  ctx.descriptorRegistry.getDescriptor(sortedItems[i]);
      Logger.debug(`[RNOH]: in AutoLayoutShadow cell: ${JSON.stringify(cell)}`)
      const neighbour: CellContainerDescriptor = ctx.descriptorRegistry.getDescriptor(sortedItems[i+1]);
      Logger.debug(`[RNOH]: in AutoLayoutShadow neighbour: ${JSON.stringify(neighbour)}`)
      let isNeighbourConsecutive = neighbour.props.index === cell.props.index as number + 1;
      if (this.isWithinBounds(cell)) {
        if (!this.horizontal) {
          maxBound = Math.max(maxBound, cell.rawProps.top + cell.rawProps.height);
          minBound = Math.min(minBound, cell.rawProps.top);
          maxBoundNeighbour = maxBound;
          if (isNeighbourConsecutive) {
            if (cell.rawProps.left < neighbour.rawProps.left) {
              if (cell.rawProps.left + cell.rawProps.width !== neighbour.rawProps.left) {
                neighbour.rawProps.left = cell.rawProps.left + cell.rawProps.width;
              }
              if (cell.rawProps.top !== neighbour.rawProps.top) {
                neighbour.rawProps.top = cell.rawProps.top;
              }
            } else {
              neighbour.rawProps.top = maxBound;
            }
          }
          if (this.isWithinBounds(neighbour)) {
            maxBoundNeighbour = Math.max(maxBound, neighbour.rawProps.top + neighbour.rawProps.height);
          }
        } else {
          maxBound = Math.max(maxBound, cell.rawProps.left + cell.rawProps.width);
          minBound = Math.min(minBound, cell.rawProps.left);
          maxBoundNeighbour = maxBound;
          if (cell.rawProps.top < neighbour.rawProps.top) {
            if (cell.rawProps.top + cell.rawProps.height !== neighbour.rawProps.top) {
              neighbour.rawProps.top = cell.rawProps.top + cell.rawProps.height;
            }
            if (cell.rawProps.left !== neighbour.rawProps.left) {
              neighbour.rawProps.left = cell.rawProps.left;
            }
          } else {
            neighbour.rawProps.left = maxBound;
          }
          if (this.isWithinBounds(neighbour)) {
            maxBoundNeighbour = Math.max(maxBound, neighbour.rawProps.left + neighbour.rawProps.width);
          }
        }
      }

      this.lastMaxBoundOverall = Math.max(
        this.lastMaxBoundOverall,
        this.horizontal ? cell.rawProps.left + cell.rawProps.width : cell.rawProps.top + cell.rawProps.height
      );
      this.lastMaxBoundOverall = Math.max(
        this.lastMaxBoundOverall,
        this.horizontal ? neighbour.rawProps.left + neighbour.rawProps.width : neighbour.rawProps.top + neighbour.rawProps.height
      );
    }

    // let cell:CellContainerRawProps =  ctx.descriptorRegistry.getDescriptor(sortedItems[sortedItems.length - 2]).rawProps as CellContainerRawProps;
    // cell = JSON.parse(JSON.stringify(cell));
    // Logger.debug(`[RNOH]: in AutoLayoutShadow After cell: ${JSON.stringify(cell)}`)
    // let neighbour:CellContainerRawProps = ctx.descriptorRegistry.getDescriptor(sortedItems[sortedItems.length - 1]).rawProps as CellContainerRawProps;
    // neighbour = JSON.parse(JSON.stringify(neighbour));
    // Logger.debug(`[RNOH]: in AutoLayoutShadow After neighbour: ${JSON.stringify(neighbour)}`)
    this.lastMaxBound = maxBoundNeighbour;
    this.lastMinBound = minBound;
  }

  /** Offset provided by react can be one frame behind the real one, it's important that this method is called with offset taken directly from
   * scrollview object */
  computeBlankFromGivenOffset(
    actualScrollOffset: number,
    distanceFromWindowStart: number,
    distanceFromWindowEnd: number
  ): number {
    const actualOffset = actualScrollOffset - this.offsetFromStart;
    this.blankOffsetAtStart =
      this.lastMinBound - actualOffset - distanceFromWindowStart;
    this.blankOffsetAtEnd =
      actualOffset +
      this.windowSize -
      this.renderOffset -
      this.lastMaxBound -
        distanceFromWindowEnd;
    return Math.max(this.blankOffsetAtStart, this.blankOffsetAtEnd);
  }

  /** It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between
   * unused items will cause algorithm to fail.*/
  private isWithinBounds(cell: CellContainerDescriptor): boolean {
    const scrollOffset = this.scrollOffset - this.offsetFromStart;
    if (!this.horizontal) {
      return (
        (cell.rawProps.top >= (scrollOffset - this.renderOffset) || (cell.rawProps.top + cell.rawProps.height) >= (scrollOffset - this.renderOffset) ) &&
          (cell.rawProps.top <= (scrollOffset + this.windowSize) || (cell.rawProps.top + cell.rawProps.height) <= (scrollOffset + this.windowSize) )
      );
    } else {
      return (
        (cell.rawProps.left >= (scrollOffset - this.renderOffset) || (cell.rawProps.left + cell.rawProps.width) >= (scrollOffset - this.renderOffset)) &&
          (cell.rawProps.left <= (scrollOffset + this.windowSize) || (cell.rawProps.left + cell.rawProps.width) <= (scrollOffset + this.windowSize))
      );
    }
  }
}