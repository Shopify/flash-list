import {
  applyContentContainerInsetForLayoutManager,
  getContentContainerPadding,
  hasUnsupportedKeysInContentContainerStyle,
  updateContentStyle,
} from "../utils/ContentContainerUtils";

describe("ContentContainerUtils", () => {
  it("detects unsupported keys in style", () => {
    expect(hasUnsupportedKeysInContentContainerStyle({ flex: 1 })).toBe(true);
    expect(hasUnsupportedKeysInContentContainerStyle({ paddingTop: 0 })).toBe(
      false
    );
    expect(
      hasUnsupportedKeysInContentContainerStyle({
        paddingTop: 1,
        paddingVertical: 1,
      })
    ).toBe(false);
    expect(
      hasUnsupportedKeysInContentContainerStyle({
        paddingTop: 1,
        paddingVertical: 1,
        padding: 1,
        paddingLeft: 1,
        paddingRight: 1,
        paddingBottom: 1,
        backgroundColor: "red",
        paddingHorizontal: 1,
      })
    ).toBe(false);
    expect(hasUnsupportedKeysInContentContainerStyle({ margin: 1 })).toBe(true);
    expect(hasUnsupportedKeysInContentContainerStyle({ padding: 1 })).toBe(
      false
    );
    expect(
      hasUnsupportedKeysInContentContainerStyle({ backgroundColor: "red" })
    ).toBe(false);
  });
  it("updated content style to have all supported styles defined", () => {
    expect(
      updateContentStyle({}, { padding: 1, backgroundColor: "red" })
    ).toEqual({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 1,
      paddingRight: 1,
      backgroundColor: "red",
    });
    expect(updateContentStyle({}, { paddingHorizontal: 1 })).toEqual({
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 1,
      paddingRight: 1,
    });
    expect(updateContentStyle({}, { paddingVertical: 1 })).toEqual({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingRight: 0,
    });
    expect(
      updateContentStyle({}, { paddingLeft: 1, paddingVertical: 1 })
    ).toEqual({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 1,
      paddingRight: 0,
    });
  });
  it("computes correct layout manager insets", () => {
    expect(
      applyContentContainerInsetForLayoutManager(
        { height: 0, width: 0 },
        { padding: 1 },
        false
      )
    ).toEqual({ height: 0, width: -2 });
    expect(
      applyContentContainerInsetForLayoutManager(
        { height: 0, width: 0 },
        { padding: 1 },
        true
      )
    ).toEqual({ height: -2, width: 0 });
    expect(
      applyContentContainerInsetForLayoutManager(
        { height: 0, width: 0 },
        { paddingVertical: 1 },
        true
      )
    ).toEqual({ height: -2, width: 0 });
  });
  it("calculated correct padding for scrollview content", () => {
    expect(
      getContentContainerPadding(
        {
          paddingLeft: 1,
          paddingTop: 1,
          paddingBottom: 1,
          paddingRight: 1,
          backgroundColor: "red",
        },
        true
      )
    ).toEqual({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: undefined,
      paddingRight: undefined,
    });
    expect(
      getContentContainerPadding(
        {
          paddingLeft: 1,
          paddingTop: 1,
          paddingBottom: 1,
          paddingRight: 1,
          backgroundColor: "red",
        },
        false
      )
    ).toEqual({
      paddingTop: undefined,
      paddingBottom: undefined,
      paddingLeft: 1,
      paddingRight: 1,
    });
  });
});
