/**
 * NativeFlashListView - UICollectionView-backed implementation.
 *
 * This is the iOS counterpart to the Android RecyclerView-backed NativeFlashListView.
 * It wraps a UICollectionView and manages React Native child views as collection view cells.
 *
 * Architecture:
 * - UICollectionView handles scrolling, cell recycling, and layout
 * - React Native views are attached to UICollectionViewCells
 * - Custom UICollectionViewLayout subclasses handle linear, grid, and masonry layouts
 * - Scroll events are forwarded to JS via RCTDirectEventBlock
 * - Native commands handle imperative scroll operations
 */

#import "NativeFlashListView.h"
#import "FlashListMasonryLayout.h"
#import <React/RCTUtils.h>

static NSString *const kCellReuseIdentifier = @"FlashListCell";

#pragma mark - FlashListCell

@interface FlashListCell : UICollectionViewCell
@property (nonatomic, strong) UIView *contentChildView;
@property (nonatomic, assign) NSInteger boundIndex;
@end

@implementation FlashListCell

- (void)attachView:(UIView *)view {
    if (_contentChildView) {
        [_contentChildView removeFromSuperview];
    }
    _contentChildView = view;
    if (view) {
        view.frame = self.contentView.bounds;
        view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        [self.contentView addSubview:view];
    }
}

- (void)prepareForReuse {
    [super prepareForReuse];
    if (_contentChildView) {
        [_contentChildView removeFromSuperview];
        _contentChildView = nil;
    }
    _boundIndex = -1;
}

@end

#pragma mark - NativeFlashListView

@interface NativeFlashListView ()
@property (nonatomic, assign) BOOL hasTriggeredEndReached;
@property (nonatomic, assign) BOOL hasTriggeredStartReached;
@property (nonatomic, assign) CGFloat lastScrollOffset;
@property (nonatomic, assign) NSTimeInterval lastScrollTime;
@property (nonatomic, strong) NSSet<NSNumber *> *lastViewableIndices;
@end

@implementation NativeFlashListView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self setupDefaults];
        [self setupCollectionView];
    }
    return self;
}

- (void)setupDefaults {
    _horizontal = NO;
    _inverted = NO;
    _numColumns = 1;
    _masonry = NO;
    _itemCount = 0;
    _drawDistance = 250.0;
    _scrollEnabled = YES;
    _showsVerticalScrollIndicator = YES;
    _showsHorizontalScrollIndicator = YES;
    _bounces = YES;
    _pagingEnabled = NO;
    _snapToInterval = 0;
    _snapToAlignment = @"start";
    _decelerationRate = UIScrollViewDecelerationRateNormal;
    _nestedScrollEnabled = YES;
    _keyboardDismissMode = @"none";
    _onEndReachedThreshold = 0.5;
    _onStartReachedThreshold = 0.2;
    _scrollEventThrottle = 16;
    _pendingChildren = [NSMutableDictionary new];
    _lastViewableIndices = [NSSet set];
}

- (void)setupCollectionView {
    UICollectionViewFlowLayout *layout = [self createLayout];

    _collectionView = [[UICollectionView alloc] initWithFrame:self.bounds collectionViewLayout:layout];
    _collectionView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _collectionView.backgroundColor = [UIColor clearColor];
    _collectionView.dataSource = self;
    _collectionView.delegate = self;
    _collectionView.clipsToBounds = YES;
    _collectionView.scrollEnabled = _scrollEnabled;
    _collectionView.showsVerticalScrollIndicator = _showsVerticalScrollIndicator;
    _collectionView.showsHorizontalScrollIndicator = _showsHorizontalScrollIndicator;
    _collectionView.bounces = _bounces;
    _collectionView.pagingEnabled = _pagingEnabled;
    _collectionView.prefetchingEnabled = YES;

    [_collectionView registerClass:[FlashListCell class] forCellWithReuseIdentifier:kCellReuseIdentifier];

    [self addSubview:_collectionView];
}

- (UICollectionViewFlowLayout *)createLayout {
    if (_masonry) {
        FlashListMasonryLayout *masonryLayout = [[FlashListMasonryLayout alloc] init];
        masonryLayout.numberOfColumns = MAX(_numColumns, 2);
        return (UICollectionViewFlowLayout *)masonryLayout;
    }

    UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
    layout.scrollDirection = _horizontal ? UICollectionViewScrollDirectionHorizontal : UICollectionViewScrollDirectionVertical;
    layout.minimumLineSpacing = 0;
    layout.minimumInteritemSpacing = 0;
    return layout;
}

#pragma mark - Layout

- (void)layoutSubviews {
    [super layoutSubviews];
    _collectionView.frame = self.bounds;
}

#pragma mark - Property Setters

- (void)setItemCount:(NSInteger)itemCount {
    if (_itemCount != itemCount) {
        _itemCount = itemCount;
        [_collectionView reloadData];
    }
}

- (void)setHorizontal:(BOOL)horizontal {
    if (_horizontal != horizontal) {
        _horizontal = horizontal;
        [self updateLayout];
    }
}

- (void)setNumColumns:(NSInteger)numColumns {
    if (_numColumns != numColumns) {
        _numColumns = numColumns;
        [self updateLayout];
    }
}

- (void)setMasonry:(BOOL)masonry {
    if (_masonry != masonry) {
        _masonry = masonry;
        [self updateLayout];
    }
}

- (void)setInverted:(BOOL)inverted {
    if (_inverted != inverted) {
        _inverted = inverted;
        if (inverted) {
            _collectionView.transform = CGAffineTransformMakeScale(1, -1);
        } else {
            _collectionView.transform = CGAffineTransformIdentity;
        }
    }
}

- (void)setScrollEnabled:(BOOL)scrollEnabled {
    _scrollEnabled = scrollEnabled;
    _collectionView.scrollEnabled = scrollEnabled;
}

- (void)setBounces:(BOOL)bounces {
    _bounces = bounces;
    _collectionView.bounces = bounces;
}

- (void)setPagingEnabled:(BOOL)pagingEnabled {
    _pagingEnabled = pagingEnabled;
    _collectionView.pagingEnabled = pagingEnabled;
}

- (void)setShowsVerticalScrollIndicator:(BOOL)show {
    _showsVerticalScrollIndicator = show;
    _collectionView.showsVerticalScrollIndicator = show;
}

- (void)setShowsHorizontalScrollIndicator:(BOOL)show {
    _showsHorizontalScrollIndicator = show;
    _collectionView.showsHorizontalScrollIndicator = show;
}

- (void)setRefreshing:(BOOL)refreshing {
    _refreshing = refreshing;
    if (refreshing) {
        [_refreshControl beginRefreshing];
    } else {
        [_refreshControl endRefreshing];
    }
}

- (void)setOnRefreshEnabled:(BOOL)enabled {
    _onRefreshEnabled = enabled;
    if (enabled && !_refreshControl) {
        _refreshControl = [[UIRefreshControl alloc] init];
        [_refreshControl addTarget:self action:@selector(handleRefresh) forControlEvents:UIControlEventValueChanged];
        _collectionView.refreshControl = _refreshControl;
    } else if (!enabled && _refreshControl) {
        _collectionView.refreshControl = nil;
        _refreshControl = nil;
    }
}

- (void)setKeyboardDismissMode:(NSString *)mode {
    _keyboardDismissMode = mode;
    if ([mode isEqualToString:@"on-drag"]) {
        _collectionView.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag;
    } else if ([mode isEqualToString:@"interactive"]) {
        _collectionView.keyboardDismissMode = UIScrollViewKeyboardDismissModeInteractive;
    } else {
        _collectionView.keyboardDismissMode = UIScrollViewKeyboardDismissModeNone;
    }
}

- (void)updateLayout {
    UICollectionViewFlowLayout *layout = [self createLayout];
    [_collectionView setCollectionViewLayout:layout animated:NO];
}

#pragma mark - UICollectionViewDataSource

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return _itemCount;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    FlashListCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellReuseIdentifier forIndexPath:indexPath];
    cell.boundIndex = indexPath.item;

    // Invert cell transform if list is inverted
    if (_inverted) {
        cell.contentView.transform = CGAffineTransformMakeScale(1, -1);
    } else {
        cell.contentView.transform = CGAffineTransformIdentity;
    }

    // Attach pending React Native view if available
    UIView *pendingView = _pendingChildren[@(indexPath.item)];
    if (pendingView) {
        [cell attachView:pendingView];
    } else {
        // Request JS to render this item
        if (_onRenderRequest) {
            _onRenderRequest(@{
                @"indices": @[@(indexPath.item)],
                @"sync": @NO
            });
        }
    }

    return cell;
}

#pragma mark - UICollectionViewDelegateFlowLayout

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    CGFloat width = collectionView.bounds.size.width;
    CGFloat height = collectionView.bounds.size.height;

    if (_horizontal) {
        // For horizontal lists, items take full height, estimated width
        return CGSizeMake(200, height); // Will be updated by actual measurement
    }

    if (_numColumns > 1 && !_masonry) {
        // Grid layout
        NSInteger span = 1;
        NSString *key = [NSString stringWithFormat:@"%ld", (long)indexPath.item];
        NSNumber *spanNumber = _spanSizes[key];
        if (spanNumber) {
            span = spanNumber.integerValue;
        }
        CGFloat itemWidth = (width / _numColumns) * span;
        return CGSizeMake(itemWidth, 100); // Height will be updated
    }

    // Linear layout - full width
    return CGSizeMake(width, 100); // Height will be updated by actual measurement
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970] * 1000;
    if (now - _lastScrollTime < _scrollEventThrottle) {
        return;
    }
    _lastScrollTime = now;

    [self emitScrollEvent:@"onScroll"];
    [self checkBounds];
    [self updateViewability];
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    [self emitScrollEvent:@"onScrollBeginDrag"];
    _hasTriggeredEndReached = NO;
    _hasTriggeredStartReached = NO;
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    [self emitScrollEvent:@"onMomentumScrollEnd"];
    [self checkBounds];
    [self updateViewability];
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    [self emitScrollEvent:@"onMomentumScrollBegin"];
}

#pragma mark - Scroll Event Emission

- (void)emitScrollEvent:(NSString *)eventName {
    CGFloat offset = _horizontal ? _collectionView.contentOffset.x : _collectionView.contentOffset.y;
    CGFloat contentSize = _horizontal ? _collectionView.contentSize.width : _collectionView.contentSize.height;
    CGFloat viewportSize = _horizontal ? _collectionView.bounds.size.width : _collectionView.bounds.size.height;

    NSDictionary *data = @{
        @"contentOffset": @(offset),
        @"contentSize": @(contentSize),
        @"viewportSize": @(viewportSize),
        @"horizontal": @(_horizontal)
    };

    if ([eventName isEqualToString:@"onScroll"] && _onScroll) {
        _onScroll(data);
    } else if ([eventName isEqualToString:@"onScrollBeginDrag"] && _onScrollBeginDrag) {
        _onScrollBeginDrag(data);
    } else if ([eventName isEqualToString:@"onMomentumScrollBegin"] && _onMomentumScrollBegin) {
        _onMomentumScrollBegin(data);
    } else if ([eventName isEqualToString:@"onMomentumScrollEnd"] && _onMomentumScrollEnd) {
        _onMomentumScrollEnd(data);
    }
}

#pragma mark - Bounds Detection

- (void)checkBounds {
    CGFloat offset = _horizontal ? _collectionView.contentOffset.x : _collectionView.contentOffset.y;
    CGFloat contentSize = _horizontal ? _collectionView.contentSize.width : _collectionView.contentSize.height;
    CGFloat viewportSize = _horizontal ? _collectionView.bounds.size.width : _collectionView.bounds.size.height;
    CGFloat maxOffset = contentSize - viewportSize;

    if (maxOffset <= 0) return;

    // End reached
    CGFloat distanceFromEnd = maxOffset - offset;
    CGFloat endThreshold = viewportSize * _onEndReachedThreshold;
    if (distanceFromEnd <= endThreshold && !_hasTriggeredEndReached) {
        _hasTriggeredEndReached = YES;
        if (_onEndReached) {
            _onEndReached(@{});
        }
    } else if (distanceFromEnd > endThreshold) {
        _hasTriggeredEndReached = NO;
    }

    // Start reached
    CGFloat startThreshold = viewportSize * _onStartReachedThreshold;
    if (offset <= startThreshold && !_hasTriggeredStartReached) {
        _hasTriggeredStartReached = YES;
        if (_onStartReached) {
            _onStartReached(@{});
        }
    } else if (offset > startThreshold) {
        _hasTriggeredStartReached = NO;
    }
}

#pragma mark - Viewability

- (void)updateViewability {
    NSArray<NSIndexPath *> *visiblePaths = [_collectionView indexPathsForVisibleItems];
    NSMutableSet<NSNumber *> *currentViewable = [NSMutableSet set];

    for (NSIndexPath *path in visiblePaths) {
        [currentViewable addObject:@(path.item)];
    }

    if ([currentViewable isEqualToSet:_lastViewableIndices]) return;

    NSMutableSet<NSNumber *> *changed = [NSMutableSet setWithSet:currentViewable];
    [changed unionSet:_lastViewableIndices];
    // changed = symmetric difference
    NSMutableSet<NSNumber *> *intersection = [NSMutableSet setWithSet:currentViewable];
    [intersection intersectSet:_lastViewableIndices];
    [changed minusSet:intersection];

    _lastViewableIndices = [currentViewable copy];

    if (_onViewableItemsChanged) {
        NSMutableArray *viewableItems = [NSMutableArray array];
        for (NSNumber *idx in currentViewable) {
            NSString *key = _itemKeys[[idx stringValue]] ?: [idx stringValue];
            [viewableItems addObject:@{
                @"index": idx,
                @"isViewable": @YES,
                @"key": key
            }];
        }

        NSMutableArray *changedItems = [NSMutableArray array];
        for (NSNumber *idx in changed) {
            BOOL isViewable = [currentViewable containsObject:idx];
            NSString *key = _itemKeys[[idx stringValue]] ?: [idx stringValue];
            [changedItems addObject:@{
                @"index": idx,
                @"isViewable": @(isViewable),
                @"key": key
            }];
        }

        _onViewableItemsChanged(@{
            @"viewableItems": viewableItems,
            @"changed": changedItems
        });
    }
}

#pragma mark - Refresh Control

- (void)handleRefresh {
    if (_onRefreshEvent) {
        _onRefreshEvent(@{});
    }
}

#pragma mark - Imperative Methods

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated viewPosition:(CGFloat)viewPosition viewOffset:(CGFloat)viewOffset {
    if (index < 0 || index >= _itemCount) return;

    NSIndexPath *indexPath = [NSIndexPath indexPathForItem:index inSection:0];
    UICollectionViewScrollPosition position;

    if (_horizontal) {
        if (viewPosition <= 0.25) {
            position = UICollectionViewScrollPositionLeft;
        } else if (viewPosition >= 0.75) {
            position = UICollectionViewScrollPositionRight;
        } else {
            position = UICollectionViewScrollPositionCenteredHorizontally;
        }
    } else {
        if (viewPosition <= 0.25) {
            position = UICollectionViewScrollPositionTop;
        } else if (viewPosition >= 0.75) {
            position = UICollectionViewScrollPositionBottom;
        } else {
            position = UICollectionViewScrollPositionCenteredVertically;
        }
    }

    [_collectionView scrollToItemAtIndexPath:indexPath atScrollPosition:position animated:animated];
}

- (void)scrollToOffset:(CGFloat)offset animated:(BOOL)animated {
    CGPoint point;
    if (_horizontal) {
        point = CGPointMake(offset, _collectionView.contentOffset.y);
    } else {
        point = CGPointMake(_collectionView.contentOffset.x, offset);
    }
    [_collectionView setContentOffset:point animated:animated];
}

- (void)scrollToEnd:(BOOL)animated {
    if (_itemCount <= 0) return;
    NSIndexPath *lastPath = [NSIndexPath indexPathForItem:_itemCount - 1 inSection:0];
    UICollectionViewScrollPosition position = _horizontal ?
        UICollectionViewScrollPositionRight : UICollectionViewScrollPositionBottom;
    [_collectionView scrollToItemAtIndexPath:lastPath atScrollPosition:position animated:animated];
}

- (void)scrollToTop:(BOOL)animated {
    [_collectionView setContentOffset:CGPointZero animated:animated];
}

- (void)flashScrollIndicators {
    [_collectionView flashScrollIndicators];
}

#pragma mark - Child Management

- (void)addReactChildView:(UIView *)child atIndex:(NSInteger)index {
    _pendingChildren[@(index)] = child;

    // Find existing cell and attach
    NSIndexPath *indexPath = [NSIndexPath indexPathForItem:index inSection:0];
    FlashListCell *cell = (FlashListCell *)[_collectionView cellForItemAtIndexPath:indexPath];
    if (cell && cell.boundIndex == index) {
        [cell attachView:child];
    }
}

- (void)removeReactChildView:(UIView *)child atIndex:(NSInteger)index {
    [_pendingChildren removeObjectForKey:@(index)];
}

@end
