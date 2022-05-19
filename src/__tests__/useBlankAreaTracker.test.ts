import { mountFlashList } from "./helpers/mountFlashList";

describe("useBlankAreaTracker Hook", () => {
  const TargetList = () => {
    return;
  };
  it("ignores blank events if content is not enough to fill the list", () => {
    const flashList = mountFlashList();
  });
});
