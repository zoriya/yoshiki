//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Platform as RNPlatform } from "react-native";
import { PlatformT } from "../type";

export const Platform: PlatformT = RNPlatform.OS;

export { type Theme, breakpoints, useTheme, ThemeProvider } from "../theme";

export { useYoshiki, type Stylable, type StylableHoverable, type YsNative } from "./generator";

export { Pressable } from "./hover";

export * from "./units";

export { splitRender } from "./split-render";

