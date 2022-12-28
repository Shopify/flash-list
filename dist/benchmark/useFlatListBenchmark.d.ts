/// <reference types="react" />
import { FlatList } from "react-native";
import { BenchmarkParams, BenchmarkResult } from "./useBenchmark";
export interface FlatListBenchmarkParams extends BenchmarkParams {
    targetOffset: number;
}
/**
 * Runs the benchmark on FlatList and calls the callback method with the result.
 * Target offset is mandatory in params.
 * It's recommended to remove pagination while running the benchmark. Removing the onEndReached callback is the easiest way to do that.
 */
export declare function useFlatListBenchmark(flatListRef: React.RefObject<FlatList<any>>, callback: (benchmarkResult: BenchmarkResult) => void, params: FlatListBenchmarkParams): never[];
//# sourceMappingURL=useFlatListBenchmark.d.ts.map