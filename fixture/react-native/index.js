/**
 * @format
 */

import { AppRegistry, I18nManager } from "react-native";
import { enableNewCore } from "@shopify/flash-list/dist/enableNewCore";

import App from "./src/App";
import { name as appName } from "./app.json";

enableNewCore(true);

I18nManager.forceRTL(false);

AppRegistry.registerComponent(appName, () => App);
