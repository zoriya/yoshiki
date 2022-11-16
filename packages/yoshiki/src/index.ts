//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import {
	useYoshiki as useWebYoshiki,
	type Stylable as WebStylable,
	type StylableHoverable as WebStylableHoverable,
} from "./web";
import type {
	Stylable as NativeStylable,
	StylableHoverable as NativeStylableHoverable,
} from "./native";

import { YsStyleProps } from "./native/generator";
import { Theme } from "./theme";
import { WithState, EnhancedStyle } from "./type";
import type { ViewStyle, ImageStyle, TextStyle } from "react-native";

export const useYoshiki = (): {
	css: <
		Style extends ViewStyle | TextStyle | ImageStyle,
		State extends Partial<WithState<EnhancedStyle<Style>>> | Record<string, never>,
	>(
		style: EnhancedStyle<Style> & State,
		leftOvers?: { style?: Style } | WebStylable,
	) => YsStyleProps<Style, State> | WebStylable;
	theme: Theme;
} => {
	// This index.ts will be used on the web wherase react-native will use the ./native import.
	// We need to unsure that this functions works on the web but have types that merge the two here.
	// @ts-ignore See comment above.
	return useWebYoshiki();
};

export type Stylable = WebStylable | NativeStylable;
export type StylableHoverable = WebStylableHoverable | NativeStylableHoverable;

export { breakpoints, type Theme, ThemeProvider, useTheme } from "./theme";
