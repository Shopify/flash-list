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
      const cell =  ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(sortedItems[i]);
      Logger.debug(`[RNOH]: in AutoLayoutShadow cell: ${JSON.stringify(cell)}`)
      const neighbour = ctx.descriptorRegistry.getDescriptor<CellContainerDescriptor>(sortedItems[i+1]);
      Logger.debug(`[RNOH]: in AutoLayoutShadow neighbour: ${JSON.stringify(neighbour)}`)
      let isNeighbourConsecutive = neighbour.rawProps.index === cell.rawProps.index ?? -1 + 1;
      if (this.isWithinBounds(cell)) {
        if (!this.horizontal) {
          maxBound = Math.max(maxBound, cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height);
          minBound = Math.min(minBound, cell.layoutMetrics.frame.origin.y);
          maxBoundNeighbour = maxBound;
          if (isNeighbourConsecutive) {
            if (cell.layoutMetrics.frame.origin.x < neighbour.layoutMetrics.frame.origin.x) {
              if (cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width !==
              neighbour.layoutMetrics.frame.origin.x) {
                neighbour.layoutMetrics.frame.origin.x = cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width;
              }
              if (cell.layoutMetrics.frame.origin.y !== neighbour.layoutMetrics.frame.origin.y) {
                neighbour.layoutMetrics.frame.origin.y = cell.layoutMetrics.frame.origin.y;
              }
            } else {
              neighbour.layoutMetrics.frame.origin.y = maxBound;
            }
          }
          if (this.isWithinBounds(neighbour)) {
            maxBoundNeighbour = Math.max(maxBound, neighbour.layoutMetrics.frame.origin.y + neighbour.layoutMetrics.frame.size.height);
          }
        } else {
          maxBound = Math.max(maxBound, cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width);
          minBound = Math.min(minBound, cell.layoutMetrics.frame.origin.x);
          maxBoundNeighbour = maxBound;
          if (cell.layoutMetrics.frame.origin.y < neighbour.layoutMetrics.frame.origin.y) {
            if (cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height !== neighbour.layoutMetrics.frame.origin.y) {
              neighbour.layoutMetrics.frame.origin.y = cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height;
            }
            if (cell.layoutMetrics.frame.origin.x !== neighbour.layoutMetrics.frame.origin.x) {
              neighbour.layoutMetrics.frame.origin.x = cell.layoutMetrics.frame.origin.x;
            }
          } else {
            neighbour.layoutMetrics.frame.origin.x = maxBound;
          }
          if (this.isWithinBounds(neighbour)) {
            maxBoundNeighbour = Math.max(maxBound, neighbour.layoutMetrics.frame.origin.x + neighbour.layoutMetrics.frame.size.width);
          }
        }
      }
      this.lastMaxBoundOverall = Math.max(
        this.lastMaxBoundOverall,
        this.horizontal ? cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width :
          cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height
      );
      this.lastMaxBoundOverall = Math.max(
        this.lastMaxBoundOverall,
        this.horizontal ? neighbour.layoutMetrics.frame.origin.x + neighbour.layoutMetrics.frame.size.width :
          neighbour.layoutMetrics.frame.origin.y + neighbour.layoutMetrics.frame.size.height
      );
    }
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
    this.blankOffsetAtStart = this.lastMinBound - actualOffset - distanceFromWindowStart;
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
        (cell.layoutMetrics.frame.origin.y >= (scrollOffset - this.renderOffset) ||
          (cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height) >=
            (scrollOffset - this.renderOffset) ) &&
          (cell.layoutMetrics.frame.origin.y <= (scrollOffset + this.windowSize) ||
            (cell.layoutMetrics.frame.origin.y + cell.layoutMetrics.frame.size.height) <=
              (scrollOffset + this.windowSize) )
      );
    } else {
      return (
        (cell.layoutMetrics.frame.origin.x >= (scrollOffset - this.renderOffset) ||
          (cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width) >=
            (scrollOffset - this.renderOffset)) &&
          (cell.layoutMetrics.frame.origin.x <= (scrollOffset + this.windowSize) ||
            (cell.layoutMetrics.frame.origin.x + cell.layoutMetrics.frame.size.width) <=
              (scrollOffset + this.windowSize))
      );
    }
  }
}