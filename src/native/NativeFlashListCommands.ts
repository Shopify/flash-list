import codegenNativeCommands from "react-native/Libraries/Utilities/codegenNativeCommands";
import type NativeFlashListView from "./NativeFlashListViewNativeComponent";

interface NativeFlashListCommands {
  scrollToOffset: (
    viewRef: React.ElementRef<typeof NativeFlashListView>,
    offset: number,
    animated: boolean
  ) => void;
  scrollToIndex: (
    viewRef: React.ElementRef<typeof NativeFlashListView>,
    index: number,
    animated: boolean,
    viewPosition: number,
    viewOffset: number
  ) => void;
  scrollToEnd: (
    viewRef: React.ElementRef<typeof NativeFlashListView>,
    animated: boolean
  ) => void;
  flashScrollIndicators: (
    viewRef: React.ElementRef<typeof NativeFlashListView>
  ) => void;
}

export const Commands = codegenNativeCommands<NativeFlashListCommands>({
  supportedCommands: [
    "scrollToOffset",
    "scrollToIndex",
    "scrollToEnd",
    "flashScrollIndicators",
  ],
});
