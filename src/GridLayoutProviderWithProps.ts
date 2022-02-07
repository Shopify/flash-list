import {
  Dimension,
  GridLayoutProvider,
  Layout,
  LayoutManager,
} from "recyclerlistview";

export default class GridLayoutProviderWithProps<T> extends GridLayoutProvider {
  private props: T;
  private layoutObject = { span: undefined, size: undefined };

  constructor(
    maxSpan: number,
    getLayoutType: (
      index: number,
      props: T,
      mutableLayout: { span?: number; size?: number }
    ) => string | number,
    getSpan: (
      index: number,
      props: T,
      mutableLayout: { span?: number; size?: number }
    ) => number,
    getHeightOrWidth: (
      index: number,
      props: T,
      mutableLayout: { span?: number; size?: number }
    ) => number,
    props: T,
    acceptableRelayoutDelta?: number
  ) {
    super(
      maxSpan,
      (i) => {
        return getLayoutType(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return getSpan(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return getHeightOrWidth(i, this.props, this.getCleanLayoutObj());
      },
      acceptableRelayoutDelta
    );
    this.props = props;
  }

  public updateProps(props: T) {
    this.props = props;
  }

  public newLayoutManager(
    renderWindowSize: Dimension,
    isHorizontal?: boolean,
    cachedLayouts?: Layout[]
  ): LayoutManager {
    return super.newLayoutManager(renderWindowSize, isHorizontal);
  }

  private getCleanLayoutObj() {
    this.layoutObject.size = undefined;
    this.layoutObject.span = undefined;
    return this.layoutObject;
  }
}
