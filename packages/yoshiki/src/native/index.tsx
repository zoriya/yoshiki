//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ReactNode } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { type Theme, ThemeContext } from "../theme";

type Properties<Type extends "image" | "text" | "other" = "other"> = Type extends "text"
	? TextStyle
	: Type extends "image"
	? ImageStyle
	: ViewStyle;

export type Stylable<Type extends "image" | "text" | "other" = "other"> = {
	style?: Properties<Type>;
};
export type StylableHoverable<Type extends "image" | "text" | "other" = "other"> = {
	style:
		| ((state: { hovered: boolean; focused: boolean; pressed: boolean }) => Properties<Type>)
		| Properties<Type>;
};

export type { Theme };
export { breakpoints, useTheme } from "../theme";
export { useYoshiki } from "./generator";
export { Pressable } from "./hover";
export * from "./units";
export { sm, md, lg, xl } from "./type";

export const ThemeProvider = ({ theme, children }: { theme: Theme; children?: ReactNode }) => {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export * from "../type";
export * from "../utils";
