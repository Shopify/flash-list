import { Exception } from "./CustomError";

const ExceptionList: { [key: string]: Exception } = {
  estimatedItemSizeMissing: {
    message:
      "`estimatedItemSize` is a required prop in RecyclerFlatList. Please provide a value that is greater than 0.",
    type: "InvalidPropException",
  },
  refreshBooleanMissing: {
    message:
      "`refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `undefined`",
    type: "InvariantViolation",
  },
};
export default ExceptionList;
