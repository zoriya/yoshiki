//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createElement, ReactNode } from "react";
import { type Theme, ThemeContext } from "../theme";

export type YsWeb<Props extends Record<string, unknown>> = Omit<Props, "style"> & {
	className?: string;
};

export type Stylable = {
	className?: string;
};

export type StylableHoverable = Stylable;

export { useYoshiki, sm, md, lg, xl } from "./generator";
export { StyleRegistryProvider, useStyleRegistry, createStyleRegistry } from "./registry";
export { useMobileHover } from "./hover";
export type { Theme };
export { breakpoints, useTheme } from "../theme";
export { useAutomaticTheme } from "./automatic-theme";

export const ThemeProvider = ({ theme, children }: { theme: Theme; children?: ReactNode }) =>
	createElement(ThemeContext.Provider, { value: theme }, [children]);
