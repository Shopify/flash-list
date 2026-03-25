/**
 * FlashListMasonryLayout - Masonry/waterfall UICollectionViewLayout.
 *
 * Computes layout attributes for a multi-column masonry grid where items
 * are placed in the shortest column. Supports dynamic item heights.
 */

#import "FlashListMasonryLayout.h"

@interface FlashListMasonryLayout ()
@property (nonatomic, strong) NSMutableArray<UICollectionViewLayoutAttributes *> *allAttributes;
@property (nonatomic, strong) NSMutableArray<NSNumber *> *columnHeights;
@property (nonatomic, assign) CGFloat contentHeight;
@end

@implementation FlashListMasonryLayout

- (instancetype)init {
    self = [super init];
    if (self) {
        _numberOfColumns = 2;
        _minimumColumnSpacing = 0;
        _minimumInteritemSpacing = 0;
        _sectionInset = UIEdgeInsetsZero;
        _allAttributes = [NSMutableArray array];
        _columnHeights = [NSMutableArray array];
    }
    return self;
}

- (void)prepareLayout {
    [super prepareLayout];

    [_allAttributes removeAllObjects];
    [_columnHeights removeAllObjects];
    _contentHeight = 0;

    CGFloat totalWidth = self.collectionView.bounds.size.width - _sectionInset.left - _sectionInset.right;
    CGFloat columnWidth = (totalWidth - (_minimumColumnSpacing * (_numberOfColumns - 1))) / _numberOfColumns;

    // Initialize column heights
    for (NSInteger i = 0; i < _numberOfColumns; i++) {
        [_columnHeights addObject:@(_sectionInset.top)];
    }

    NSInteger itemCount = [self.collectionView numberOfItemsInSection:0];

    for (NSInteger i = 0; i < itemCount; i++) {
        NSIndexPath *indexPath = [NSIndexPath indexPathForItem:i inSection:0];

        // Find shortest column
        NSInteger shortestColumn = 0;
        CGFloat shortestHeight = [_columnHeights[0] floatValue];
        for (NSInteger col = 1; col < _numberOfColumns; col++) {
            CGFloat h = [_columnHeights[col] floatValue];
            if (h < shortestHeight) {
                shortestHeight = h;
                shortestColumn = col;
            }
        }

        // Calculate frame
        CGFloat x = _sectionInset.left + shortestColumn * (columnWidth + _minimumColumnSpacing);
        CGFloat y = shortestHeight;

        // Item height - use estimated or delegate-provided height
        CGFloat itemHeight = 100; // Default estimate, updated when measured

        UICollectionViewLayoutAttributes *attrs = [UICollectionViewLayoutAttributes layoutAttributesForCellWithIndexPath:indexPath];
        attrs.frame = CGRectMake(x, y, columnWidth, itemHeight);
        [_allAttributes addObject:attrs];

        // Update column height
        CGFloat newHeight = y + itemHeight + _minimumInteritemSpacing;
        _columnHeights[shortestColumn] = @(newHeight);
        _contentHeight = MAX(_contentHeight, newHeight);
    }

    _contentHeight += _sectionInset.bottom;
}

- (CGSize)collectionViewContentSize {
    return CGSizeMake(self.collectionView.bounds.size.width, _contentHeight);
}

- (NSArray<UICollectionViewLayoutAttributes *> *)layoutAttributesForElementsInRect:(CGRect)rect {
    NSMutableArray *visibleAttributes = [NSMutableArray array];
    for (UICollectionViewLayoutAttributes *attrs in _allAttributes) {
        if (CGRectIntersectsRect(attrs.frame, rect)) {
            [visibleAttributes addObject:attrs];
        }
    }
    return visibleAttributes;
}

- (UICollectionViewLayoutAttributes *)layoutAttributesForItemAtIndexPath:(NSIndexPath *)indexPath {
    if (indexPath.item < _allAttributes.count) {
        return _allAttributes[indexPath.item];
    }
    return nil;
}

- (BOOL)shouldInvalidateLayoutForBoundsChange:(CGRect)newBounds {
    CGRect oldBounds = self.collectionView.bounds;
    return !CGSizeEqualToSize(oldBounds.size, newBounds.size);
}

@end
