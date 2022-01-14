//
//  AutoLayoutViewTests.swift
//  FlatListProTests
//
//  Created by Elvira Burchik on 14.01.22.
//

import XCTest
@testable import FlatListPro

class AutoLayoutViewTests: XCTestCase {
    var autoLayoutView = AutoLayoutView()
    let testCell = CellContainer()
    let cellHeight: CGFloat = 50
    let windowSize: CGFloat = 500
    
    func test_IsWithinBoundsVerticalListScrollToBottom() throws {
        testCell.frame = CGRect(x: 0, y: 0, width: cellHeight, height: cellHeight)
        print(testCell)
        // Top left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize))
        
        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize))
        
        // Above visible
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: 100,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize))
    }
    
    func test_IsWithinBoundsVerticalListScrollToTop() throws {
        testCell.frame = CGRect(x: 0, y: windowSize - cellHeight, width: cellHeight, height: cellHeight)
        // Bottom left corner of the screen
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: 0,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize))
        
        // Partly visible
        XCTAssertTrue(autoLayoutView.isWithinBounds(testCell,
                                                    scrollOffset: -25,
                                                    renderAheadOffset: 0,
                                                    windowSize: windowSize))
        
        // Below visible
        XCTAssertFalse(autoLayoutView.isWithinBounds(testCell,
                                                     scrollOffset: -100,
                                                     renderAheadOffset: 0,
                                                     windowSize: windowSize))
    }
    
    func test_IsWithinBoundsHorizontalListScrollToLeft() throws {
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
    
    func test_IsWithinBoundsHorizontalListScrollToRight() throws {
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
