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

  it("uses event timestamps to preserve sub-frame velocity", () => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    const tracker = new VelocityTracker();
    const velocities: number[] = [];
    const callback = ({ y }: { x: number; y: number }) => velocities.push(y);

    tracker.computeVelocity(100, 0, false, callback, 0);
    tracker.computeVelocity(200, 100, false, callback, 8);

    expect(velocities).toEqual([6.25, 12.5]);
    tracker.cleanUp();
  });

  it("uses the conservative minimum when event timestamps repeat", () => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    const tracker = new VelocityTracker();
    const velocities: number[] = [];
    const callback = ({ y }: { x: number; y: number }) => velocities.push(y);

    tracker.computeVelocity(100, 0, false, callback, 12);
    tracker.computeVelocity(200, 100, false, callback, 12);

    expect(velocities).toEqual([6.25, 6.25]);
    tracker.cleanUp();
  });
});
