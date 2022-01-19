export const NavigationKeys = {
  EXAMPLES: "Examples" as const,
  LIST: "List" as const,
};

type ValueOf<T> = T[keyof T];

export type RootStackParamList = {
  [key in ValueOf<typeof NavigationKeys>]: undefined;
};
