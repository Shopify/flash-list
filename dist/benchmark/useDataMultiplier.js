"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataMultiplier = void 0;
var tslib_1 = require("tslib");
/**
 * Increases the data size by duplicating it, it's kept in hook format so that in future we can add auto pagination support.
 * If you're using this with FlatList then make sure you remove `keyExtractor` because this method might duplicate ids that might be in the data.
 * @param data The data to duplicate
 * @param count Final count of data to be returned from this hook
 * @returns Multiplied data.
 */
function useDataMultiplier(data, count) {
    var len = data.length;
    var arr = new Array(count);
    var isObject = false;
    if (typeof data[0] === "object") {
        isObject = true;
    }
    for (var i = 0; i < count; i++) {
        arr[i] = isObject ? tslib_1.__assign({}, data[i % len]) : data[i % len];
    }
    return [arr];
}
exports.useDataMultiplier = useDataMultiplier;
//# sourceMappingURL=useDataMultiplier.js.map