//
// Created on 5/3/2024.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef HARMONY_AUTOLAYOUTSHADOW_H
#define HARMONY_AUTOLAYOUTSHADOW_H

#include "react/renderer/graphics/Float.h"
#include "CellContainerComponentInstance.h"

namespace rnoh {

    class AutoLayoutShadow {
    private:
        facebook::react::Float lastMaxBound; // Tracks where the last pixel is drawn in the visible window
        facebook::react::Float lastMinBound;
        bool isWithinBounds(CellContainerComponentInstance &);

    public:
        bool horizontal{false};
        int scrollOffset{0};
        int offsetFromStart{0};
        int windowSize{0};
        facebook::react::Float renderOffset{0};
        facebook::react::Float blankOffsetAtStart{0}; // Tracks blank area from the top
        facebook::react::Float blankOffsetAtEnd{0};   // Tracks blank area from the bottom
        int lastMaxBoundOverall{0}; // Tracks where the last pixel is drawn in the overall

        AutoLayoutShadow() {};
        ~AutoLayoutShadow() {};
        void clearGapsAndOverlaps(std::vector<CellContainerComponentInstance> &sortedItems);
        int computeBlankFromGivenOffset(int &actualScrollOffset, int &distanceFromWindowStart, int &distanceFromWindowEnd);
    };
} // namespace rnoh

#endif // HARMONY_AUTOLAYOUTSHADOW_H
