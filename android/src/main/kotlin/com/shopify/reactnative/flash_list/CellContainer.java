package com.shopify.reactnative.flash_list;

public interface CellContainer {
    void setIndex(int value);
    int getIndex();
    void setStableId(String value);
    String getStableId();
    void setLeft(int value);
    int getLeft();
    void setTop(int value);
    int getTop();
    void setRight(int value);
    int getRight();
    void setBottom(int value);
    int getBottom();
    int getHeight();
    int getWidth();
}
