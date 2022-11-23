//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createElement, CSSProperties, ReactNode } from "react";
import type { PlatformT } from "../type";
import { type Theme, ThemeContext } from "../theme";

export const Platform: PlatformT = "web";

export type YsWeb<Props extends Record<string, unknown>> = Omit<Props, "style"> & {
	style?: CSSProperties;
};

export type Stylable = {
	className?: string;
	style?: CSSProperties;
};

export type StylableHoverable = Stylable;

export { useYoshiki } from "./generator";
export { StyleRegistryProvider, useStyleRegistry, createStyleRegistry } from "./registry";
export { Pressable, useMobileHover } from "./hover";
export * from "./units";
export type { Theme };
export { breakpoints, useTheme } from "../theme";
export { splitRender } from "./split-render";

export const ThemeProvider = ({ theme, children }: { theme: Theme; children?: ReactNode }) =>
	createElement(ThemeContext.Provider, { value: theme }, [children]);
