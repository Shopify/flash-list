import XCTest
@testable import RNRecyclerFlatList

class RecyclerFlatListTests: XCTestCase {

    var subject: RecyclerFlatListModule!

    override func setUp() {
        super.setUp()
        subject = RecyclerFlatListModule()
    }

    override func tearDown() {
        subject = nil
        super.tearDown()
    }

    func testExample() throws {
        XCTAssertTrue(subject.method())
    }
}
