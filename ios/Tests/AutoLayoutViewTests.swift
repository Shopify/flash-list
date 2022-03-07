import XCTest
@testable import RNFlashList

class AutoLayoutViewTests: XCTestCase {
    var autoLayoutView: AutoLayoutView!
    var testCell: CellContainer!
    let cellHeight: CGFloat = 50
    let windowSize: CGFloat = 500

    override func setUp() {
        super.setUp()
        autoLayoutView = AutoLayoutView()
        testCell = CellContainer()
    }

    func testIsWithinBoundsVerticalListScrollToBottom() {
        testCell.frame = CGRect(x: 0, y: 0, width: cellHeight, height: cellHeight)
        // Top left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: false))

        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: false))

        // Above visible
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: 100,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize,
                                                     isHorizontal: false))
    }

    func testIsWithinBoundsVerticalListScrollToTop() {
        testCell.frame = CGRect(x: 0, y: windowSize - cellHeight, width: cellHeight, height: cellHeight)
        // Bottom left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: false))

        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: -25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: false))

        // Below visible
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: -100,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize,
                                                     isHorizontal: false))
    }

    func testIsWithinBoundsHorizontalListScrollToLeft() {
        testCell.frame = CGRect(x: 0, y: 0, width: cellHeight, height: cellHeight)
        // Top left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: true))

        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: true))

        // Hidden
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: 100,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize,
                                                     isHorizontal: true))
    }

    func testIsWithinBoundsHorizontalListScrollToRight() {
        testCell.frame = CGRect(x: windowSize - cellHeight, y: 0, width: cellHeight, height: cellHeight)
        // Bottom left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: true))

        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: -25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize,
                                                    isHorizontal: true))

        testCell.frame = CGRect(x: windowSize + cellHeight, y: 0, width: cellHeight, height: cellHeight)
        // Hidden
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: 0,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize,
                                                     isHorizontal: true))
    }

}
