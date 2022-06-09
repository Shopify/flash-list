import React from "react";
/**
 * On web we use a view instead of cell container till we build native web implementations
 */
const CellContainer = React.forwardRef((props: any, ref) => {
  return <div ref={ref} {...props} />;
});
CellContainer.displayName = "CellContainer";
export default CellContainer;
