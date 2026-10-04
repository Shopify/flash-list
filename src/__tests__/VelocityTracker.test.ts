import { VelocityTracker } from "../recyclerview/helpers/VelocityTracker";

describe("VelocityTracker", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("avoids overestimating velocity when updates arrive in the same millisecond", () => {
    jest.useFakeTimers();
    const tracker = new VelocityTracker();
    const velocities: number[] = [];

    tracker.computeVelocity(100, 0, false, ({ y }) => velocities.push(y));
    tracker.computeVelocity(200, 100, false, ({ y }) => velocities.push(y));

    expect(velocities).toEqual([6.25, 6.25]);
    tracker.cleanUp();
  });
});
