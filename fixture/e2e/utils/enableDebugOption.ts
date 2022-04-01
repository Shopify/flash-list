import { DebugOption } from "src/Debug/DebugOptions";

import goBack from "./goBack";

const enableDebugOption = async (option: DebugOption) => {
  await element(by.id("debug-button")).tap();
  await element(by.id(option)).longPress();
  await goBack();
};

export default enableDebugOption;
