/**
 * @format
 */

import { AppRegistry, I18nManager } from "react-native";

import App from "./src/App";
import { name as appName } from "./app.json";

I18nManager.forceRTL(false);

AppRegistry.registerComponent(appName, () => App);
