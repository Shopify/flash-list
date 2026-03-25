/**
 * FlashListMasonryLayout - Custom UICollectionViewLayout for masonry/waterfall grids.
 *
 * Places items in the shortest column, creating a Pinterest-style layout
 * where items of different heights create a natural waterfall effect.
 */

#import <UIKit/UIKit.h>

@interface FlashListMasonryLayout : UICollectionViewLayout

@property (nonatomic, assign) NSInteger numberOfColumns;
@property (nonatomic, assign) CGFloat minimumColumnSpacing;
@property (nonatomic, assign) CGFloat minimumInteritemSpacing;
@property (nonatomic, assign) UIEdgeInsets sectionInset;

@end
