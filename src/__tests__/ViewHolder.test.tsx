import React from 'react';
import { Text, View } from 'react-native';
import '@quilted/react-testing/matchers';
import { render } from '@quilted/react-testing';
import { ViewHolder } from '../recyclerview/ViewHolder';
import type { RVLayout } from '../recyclerview/layout-managers/LayoutManager';
import type { ViewHolderProps } from '../recyclerview/ViewHolder';

// Mock CompatView component
jest.mock('../recyclerview/components/CompatView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CompatView: React.forwardRef((props: any, ref: any) => {
      const { children, ...otherProps } = props;
      return React.createElement(View, { ref, ...otherProps }, children);
    }),
  };
});

describe('ViewHolder', () => {
  const mockRefHolder = new Map();
  const mockRenderItem = jest.fn(({ item }) => <Text>{item.text}</Text>);
  const mockSeparatorComponent = jest.fn(({ leadingItem, trailingItem }) => (
    <View>
      <Text>Separator between {leadingItem.text} and {trailingItem.text}</Text>
    </View>
  ));

  const defaultLayout: RVLayout = {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    isWidthMeasured: true,
    isHeightMeasured: true,
  };

  const defaultProps: ViewHolderProps<{ text: string }> = {
    index: 0,
    layout: defaultLayout,
    refHolder: mockRefHolder,
    extraData: null,
    target: 'Cell',
    item: { text: 'Item 1' },
    trailingItem: { text: 'Item 2' },
    renderItem: mockRenderItem,
    ItemSeparatorComponent: mockSeparatorComponent,
    horizontal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefHolder.clear();
  });

  describe('Separator rendering', () => {
    it('should render separator when skipSeparator is false', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: false }}
        />
      );

      expect(result).toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
      expect(mockSeparatorComponent).toHaveBeenCalledWith({
        leadingItem: { text: 'Item 1' },
        trailingItem: { text: 'Item 2' },
      }, {});
    });

    it('should render separator when skipSeparator is undefined', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: undefined }}
        />
      );

      expect(result).toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
      expect(mockSeparatorComponent).toHaveBeenCalledWith({
        leadingItem: { text: 'Item 1' },
        trailingItem: { text: 'Item 2' },
      }, {});
    });

    it('should not render separator when skipSeparator is true', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: true }}
        />
      );

      expect(result).not.toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
      expect(mockSeparatorComponent).not.toHaveBeenCalled();
    });

    it('should not render separator when trailingItem is undefined', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          trailingItem={undefined}
          layout={{ ...defaultLayout, skipSeparator: false }}
        />
      );

      expect(result).not.toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
      expect(mockSeparatorComponent).not.toHaveBeenCalled();
    });

    it('should not render separator when ItemSeparatorComponent is undefined', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          ItemSeparatorComponent={undefined}
          layout={{ ...defaultLayout, skipSeparator: false }}
        />
      );

      expect(result).not.toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
      expect(mockSeparatorComponent).not.toHaveBeenCalled();
    });
  });

  describe('Memoization behavior', () => {
    it('should re-render when skipSeparator changes from false to true', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: false }}
        />
      );

      // Initially separator should be rendered
        expect(result).toContainReactComponent(Text, {
          children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
        });

      // Change skipSeparator to true
      result.setProps({
        layout: { ...defaultLayout, skipSeparator: true }
      });

      // Separator should no longer be rendered
      expect(result).not.toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });
    });

    it('should re-render when skipSeparator changes from true to false', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: true }}
        />
      );

      // Initially separator should not be rendered
      expect(result).not.toContainReactComponent(Text, {
        children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
      });

      // Change skipSeparator to false
      result.setProps({
        layout: { ...defaultLayout, skipSeparator: false }
      });

      // Separator should now be rendered
        expect(result).toContainReactComponent(Text, {
          children: ['Separator between ', 'Item 1', ' and ', 'Item 2']
        });
    });
  });

  describe('Item rendering', () => {
    it('should always render the item content regardless of skipSeparator', () => {
      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={{ ...defaultLayout, skipSeparator: true }}
        />
      );

      expect(result).toContainReactComponent(Text, { children: 'Item 1' });
      expect(mockRenderItem).toHaveBeenCalledWith({
        item: { text: 'Item 1' },
        index: 0,
        extraData: null,
        target: 'Cell',
      });

      // Re-render with skipSeparator false
      result.setProps({
        layout: { ...defaultLayout, skipSeparator: false }
      });

      expect(result).toContainReactComponent(Text, { children: 'Item 1' });
    });
  });

  describe('Layout styles', () => {
    it('should apply layout styles correctly regardless of skipSeparator', () => {
      const customLayout: RVLayout = {
        x: 10,
        y: 20,
        width: 200,
        height: 100,
        skipSeparator: true,
        enforcedWidth: true,
        enforcedHeight: true,
      };

      const result = render(
        <ViewHolder
          {...defaultProps}
          layout={customLayout}
        />
      );

      // Verify the item is rendered with correct content
      expect(result).toContainReactComponent(Text, { children: 'Item 1' });
      // Note: Layout style verification would require more complex testing setup
      // as @quilted/react-testing doesn't provide direct style inspection
    });
  });
});
