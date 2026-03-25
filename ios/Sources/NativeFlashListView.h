/**
 * NativeFlashListView - UICollectionView-backed native component for React Native.
 *
 * iOS counterpart to the Android RecyclerView implementation.
 * Uses UICollectionView with custom layouts for linear, grid, and masonry modes.
 */

#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>
#import <React/RCTView.h>
#import <React/RCTBridge.h>

@class NativeFlashListViewManager;

@interface NativeFlashListView : RCTView <UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UIScrollViewDelegate>

// Core UICollectionView
@property (nonatomic, strong) UICollectionView *collectionView;
@property (nonatomic, strong) UIRefreshControl *refreshControl;

// Configuration
@property (nonatomic, assign) BOOL horizontal;
@property (nonatomic, assign) BOOL inverted;
@property (nonatomic, assign) NSInteger numColumns;
@property (nonatomic, assign) BOOL masonry;
@property (nonatomic, assign) NSInteger itemCount;
@property (nonatomic, assign) CGFloat drawDistance;

// Scroll configuration
@property (nonatomic, assign) BOOL scrollEnabled;
@property (nonatomic, assign) BOOL showsVerticalScrollIndicator;
@property (nonatomic, assign) BOOL showsHorizontalScrollIndicator;
@property (nonatomic, assign) BOOL bounces;
@property (nonatomic, assign) BOOL pagingEnabled;
@property (nonatomic, assign) CGFloat snapToInterval;
@property (nonatomic, copy) NSString *snapToAlignment;
@property (nonatomic, assign) CGFloat decelerationRate;
@property (nonatomic, assign) BOOL nestedScrollEnabled;
@property (nonatomic, copy) NSString *keyboardDismissMode;

// Thresholds
@property (nonatomic, assign) CGFloat onEndReachedThreshold;
@property (nonatomic, assign) CGFloat onStartReachedThreshold;

// Refresh
@property (nonatomic, assign) BOOL refreshing;
@property (nonatomic, assign) BOOL onRefreshEnabled;
@property (nonatomic, assign) NSInteger progressViewOffset;

// Content insets
@property (nonatomic, assign) CGFloat contentInsetTop;
@property (nonatomic, assign) CGFloat contentInsetBottom;
@property (nonatomic, assign) CGFloat contentInsetLeft;
@property (nonatomic, assign) CGFloat contentInsetRight;

// Scroll event throttle
@property (nonatomic, assign) NSInteger scrollEventThrottle;

// Item metadata
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *itemTypes;
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *itemKeys;
@property (nonatomic, strong) NSDictionary<NSString *, NSNumber *> *spanSizes;

// Sticky headers
@property (nonatomic, strong) NSArray<NSNumber *> *stickyHeaderIndices;

// Maintain visible content position
@property (nonatomic, strong) NSDictionary *maintainVisibleContentPositionConfig;

// Event callbacks (set by ViewManager)
@property (nonatomic, copy) RCTDirectEventBlock onScroll;
@property (nonatomic, copy) RCTDirectEventBlock onScrollBeginDrag;
@property (nonatomic, copy) RCTDirectEventBlock onMomentumScrollBegin;
@property (nonatomic, copy) RCTDirectEventBlock onMomentumScrollEnd;
@property (nonatomic, copy) RCTDirectEventBlock onEndReached;
@property (nonatomic, copy) RCTDirectEventBlock onStartReached;
@property (nonatomic, copy) RCTDirectEventBlock onRefreshEvent;
@property (nonatomic, copy) RCTDirectEventBlock onRenderRequest;
@property (nonatomic, copy) RCTDirectEventBlock onViewableItemsChanged;

// Pending React Native child views
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, UIView *> *pendingChildren;

// Imperative methods
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated viewPosition:(CGFloat)viewPosition viewOffset:(CGFloat)viewOffset;
- (void)scrollToOffset:(CGFloat)offset animated:(BOOL)animated;
- (void)scrollToEnd:(BOOL)animated;
- (void)scrollToTop:(BOOL)animated;
- (void)flashScrollIndicators;

// Child management
- (void)addReactChildView:(UIView *)child atIndex:(NSInteger)index;
- (void)removeReactChildView:(UIView *)child atIndex:(NSInteger)index;

@end
