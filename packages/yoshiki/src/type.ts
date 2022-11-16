//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints, Theme } from "./theme";
import { Properties as CssProperties } from "csstype";
import type { ViewStyle, ImageStyle, TextStyle } from "react-native";

export type YoshikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property | Breakpoints<Property>)
	| Breakpoints<Property>;

export type Breakpoints<Property> = {
	[key in keyof typeof breakpoints]?: Property;
};

export type WithState<Style> = {
	hover: Style;
	focus: Style;
	press: Style;
};
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export const hasState = <Style>(obj: unknown): obj is WithState<Style> => {
	if (!obj || typeof obj !== "object") return false;
	return "hover" in obj || "focus" in obj || "press" in obj;
};

export type OmitNever<T> = {
	[key in keyof T as T[key] extends never ? never : key]: T[key];
};
export type Combine<A, B> = OmitNever<Pick<A & B, keyof A & keyof B>>;

export type CommonCss<Style extends ViewStyle | ImageStyle | TextStyle> = Combine<
	CssProperties,
	Style
>;

export type EnhancedStyle<Style extends ViewStyle | ImageStyle | TextStyle> = {
	[key in keyof CommonCss<Style>]: YoshikiStyle<CommonCss<Style>[key]>;
};
