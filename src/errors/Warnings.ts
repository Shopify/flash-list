const WarningList = {
  styleUnsupported:
    "You have passed a style to RecyclerFlatList. This list doesn't support styling, use contentContainerStyle or wrap the list in a parent and apply style to it instead.",
  styleContentContainerUnsupported:
    "RecyclerFlatList only supports padding related props and backgroundColor in contentContainerStyle." +
    " Please remove other values as they're not used. In case of vertical lists horizontal padding is ignored, if you need it apply padding to your items instead.",
};
export default WarningList;
