//
// Created on 2024/3/3
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot befoun,
// please include "napai/native_api.h".

#include <arkui/native_interface.h>
#include <react/renderer/components/view/ViewProps.h>
#include <glog/logging.h>
#include <chrono>
#include <sys/param.h>
#include <thread>
#include "AutoLayoutShadow.h"

namespace rnoh {

    /**checks for overlaps or gaps.between adjacent items and then applies a correction (Only Grid layouts with varying
     * spans) Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple
     * layouts on Android side. Not expecting any major perf issu.*/
    void AutoLayoutShadow::clearGapsAndOverlaps(std::vector<ComponentInstance::Shared> sortedItems) {
        if (sortedItems.empty()) {
            return;
        }
        int maxBound = 0;
        int minBound = INT_MAX;
        int maxBoundNeighbour = 0;
        lastMaxBoundOverall = 0;
        for (int i = 0; i < sortedItems.size() - 1; i++) {
            auto cell = std::dynamic_pointer_cast<rnoh::CellContainerComponentInstance>(sortedItems[i]);
            auto neighbour = std::dynamic_pointer_cast<rnoh::CellContainerComponentInstance>(sortedItems[i + 1]);
            // Only apply correction if the next cell is consecutive.
            bool isNeighbourConsecutive = neighbour->getIndex() == cell->getIndex() + 1;
            if (isWithinBounds(*cell)) {
                if (!horizontal) {
                    maxBound = MAX(maxBound, cell->getBottom());
                    minBound = MIN(minBound, cell->getTop());
                    maxBoundNeighbour = maxBound;
                    if (isNeighbourConsecutive) {
                        if (cell->getLeft() < neighbour->getLeft()) {
                            if (cell->getRight() != neighbour->getLeft()) {
                                neighbour->setRight(cell->getRight() + neighbour->getWidth());
                            }
                            if (cell->getTop() != neighbour->getTop()) {
                                neighbour->setBottom(cell->getTop() + neighbour->getHeight());
                                neighbour->setTop(cell->getTop());
                            }
                        } else {
                            neighbour->setBottom(maxBound + neighbour->getHeight());
                            neighbour->setTop(cell->getTop());
                        }
                    }
                    if (isWithinBounds(*neighbour)) {
                        maxBoundNeighbour = MAX(maxBound, neighbour->getBottom());
                    }
                } else {
                    maxBound = MAX(maxBound, cell->getRight());
                    minBound = MIN(minBound, cell->getLeft());
                    maxBoundNeighbour = maxBound;
                    if (isNeighbourConsecutive) {
                        if (cell->getTop() < neighbour->getTop()) {
                            if (cell->getBottom() != neighbour->getTop()) {
                                neighbour->setBottom(cell->getBottom() + neighbour->getHeight());
                                neighbour->setTop(cell->getBottom());
                            }
                            if (cell->getLeft() != neighbour->getLeft()) {
                                neighbour->setRight(cell->getLeft() + neighbour->getWidth());
                                neighbour->setLeft(cell->getLeft());
                            }
                        } else {
                            neighbour->setRight(maxBound + neighbour->getWidth());
                            neighbour->setLeft(maxBound);
                        }
                    }
                    if (isWithinBounds(*neighbour)) {
                        maxBoundNeighbour = MAX(maxBound, neighbour->getRight());
                    }
                }
            }
            if (horizontal) {
                lastMaxBoundOverall = MAX(lastMaxBoundOverall, cell->getRight());
                lastMaxBoundOverall = MAX(lastMaxBoundOverall, neighbour->getRight());
            } else {
                lastMaxBoundOverall = MAX(lastMaxBoundOverall, cell->getBottom());
                lastMaxBoundOverall = MAX(lastMaxBoundOverall, neighbour->getBottom());
            }
            cell->setLayout(cell->getLayoutMetrics());
            neighbour->setLayout(neighbour->getLayoutMetrics());
        }
        lastMaxBound = maxBoundNeighbour;
        lastMinBound = minBound;
    }

    /** Offset provider by react can be one frame behind the real one, it's important that this method is called with
     * offset taken directly from scrollview object*/
    int AutoLayoutShadow::computeBlankFromGivenOffset(int actualScrollOffset, int distanceFromWindowStart,
                                                      int distanceFromWindowEnd) {
        auto scrollOffset = actualScrollOffset - offsetFromStart;
        blankOffsetAtStart = lastMinBound - scrollOffset - distanceFromWindowStart;
        blankOffsetAtEnd =
            scrollOffset + windowSize - renderOffset - lastMaxBound - distanceFromWindowEnd;
        return MAX(blankOffsetAtStart, blankOffsetAtEnd);
    }

    /**It's importance to aviod correcting views outside the render window. An item that isn't being recycled might
     * still remain in the view tree. If views outside get considered then gaps between unused items will cause
     * algorithm to fail.*/
    bool AutoLayoutShadow::isWithinBounds(CellContainerComponentInstance &cell) {
        auto scrollOffset = this->scrollOffset - offsetFromStart;
        if (!this->horizontal) {
            return (cell.getTop() >= (scrollOffset - renderOffset) ||
                    cell.getBottom() >= (scrollOffset - renderOffset)) &&
                   (cell.getTop() <= scrollOffset + windowSize ||
                    cell.getBottom() <= scrollOffset + windowSize);
        } else {
            return (cell.getLeft() >= (scrollOffset - renderOffset) ||
                    cell.getRight() >= (scrollOffset - renderOffset)) &&
                   (cell.getLeft() <= scrollOffset + windowSize ||
                    cell.getRight() <= scrollOffset + windowSize);
        }
    }
} // namespace rnoh