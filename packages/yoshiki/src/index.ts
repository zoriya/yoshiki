//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import {
	useYoshiki as useWebYoshiki,
	Platform,
	type Stylable as WebStylable,
	type StylableHoverable as WebStylableHoverable,
	type YsWeb,
} from "./web";
import type {
	Stylable as NativeStylable,
	StylableHoverable as NativeStylableHoverable,
	YsNative,
} from "./native";

import type { YsStyleProps } from "./native/generator";
import type { Theme } from "./theme";
import type { WithState, EnhancedStyle, Length } from "./type";
import type { ViewStyle, ImageStyle, TextStyle } from "react-native";

export const useYoshiki = (): {
	css: <
		Style extends ViewStyle | TextStyle | ImageStyle,
		State extends Partial<WithState<EnhancedStyle<Style>>> | Record<string, never>,
	>(
		css: EnhancedStyle<Style> & State,
		leftOvers?: { style?: Style } | WebStylable,
	) => YsStyleProps<Style, State> | WebStylable;
	theme: Theme;
} => {
	// This index.ts will be used on the web wherase react-native will use the ./native import.
	// We need to unsure that this functions works on the web but have types that merge the two here.
	// @ts-ignore See comment above.
	return useWebYoshiki();
};

export type Stylable<Type extends "image" | "text" | "other" = "other"> =
	| WebStylable
	| NativeStylable<Type>;
export type StylableHoverable<Type extends "image" | "text" | "other" = "other"> =
	| WebStylableHoverable
	| NativeStylableHoverable<Type>;
export type { YsWeb, YsNative };

import * as Web from "./web/units";
export const px = (value: number): Length => Web.px(value) as unknown as Length;
export const percent = (value: number): Length => Web.percent(value) as unknown as Length;
export const em = (value: number): Length => Web.em(value) as unknown as Length;
export const rem = (value: number): Length => Web.rem(value) as unknown as Length;

export { Platform };
export { breakpoints, type Theme, ThemeProvider, useTheme } from "./theme";
