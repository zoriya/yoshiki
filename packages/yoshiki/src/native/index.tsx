//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ReactNode } from "react";
import { Platform as RNPlatform } from "react-native";
import { PlatformT } from "../type";
import { type Theme, ThemeContext } from "../theme";

export const Platform: PlatformT = RNPlatform.OS;

export type { Theme };
export { breakpoints, useTheme } from "../theme";

export { useYoshiki, type Stylable, type StylableHoverable, type YsNative } from "./generator";

export { Pressable } from "./hover";

export * from "./units";

export { splitRender } from "./split-render";

export const ThemeProvider = ({ theme, children }: { theme: Theme; children?: ReactNode }) => {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
