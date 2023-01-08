//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { WithState, YoshikiStyle, StyleList } from "../type";
import { shorthandsFn } from "../shorthands";
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import { Theme } from "../theme";
import { forceBreakpoint } from "../utils";

// The extends any check is only used to make EnhancedStyle a distributive type.
// This means EnhancedStyle<ViewStyle | TextStyle> = EnhancedStyle<ViewStyle> | EnhancedStyle<TextStyle>
export type EnhancedStyle<Properties> = Properties extends any
	? {
			[key in keyof Properties]: YoshikiStyle<Properties[key]>;
	  } & {
			[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
	  }
	: never;

type ForcedBreakpointStyle<Properties> = Properties extends any
	? {
			[key in keyof Properties]: Properties[key] | ((theme: Theme) => Properties[key]);
	  }
	: never;

export const sm = (value: ForcedBreakpointStyle<ViewStyle | TextStyle | ImageStyle>) =>
	forceBreakpoint(value, "sm");
export const md = (value: ForcedBreakpointStyle<ViewStyle | TextStyle | ImageStyle>) =>
	forceBreakpoint(value, "md");
export const lg = (value: ForcedBreakpointStyle<ViewStyle | TextStyle | ImageStyle>) =>
	forceBreakpoint(value, "lg");
export const xl = (value: ForcedBreakpointStyle<ViewStyle | TextStyle | ImageStyle>) =>
	forceBreakpoint(value, "xl");

export type StyleFunc<Style> = (state: {
	pressed?: boolean;
	focused?: boolean;
	hovered?: boolean;
}) => Style;

type AddLO<T, LO> = [LO] extends [never] ? T : Omit<LO, "style"> & T;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ViewStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<ViewStyle> | null },
): AddLO<{ style?: ViewStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ViewStyle> & Partial<WithState<EnhancedStyle<ViewStyle>>>>,
	leftOvers?: Leftover & { style?: StyleProp<ViewStyle> | StyleFunc<StyleProp<ViewStyle>> | null },
): AddLO<{ style?: StyleFunc<ViewStyle> }, Leftover>;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<TextStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<TextStyle> | null },
): AddLO<{ style?: TextStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<TextStyle> & Partial<WithState<EnhancedStyle<TextStyle>>>>,
	leftOvers?: Leftover & { style?: StyleProp<TextStyle> | StyleFunc<StyleProp<TextStyle>> | null },
): AddLO<{ style?: StyleFunc<TextStyle> }, Leftover>;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ImageStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<ImageStyle> | null },
): AddLO<{ style?: ImageStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ImageStyle> & Partial<WithState<EnhancedStyle<ImageStyle>>>>,
	leftOvers?: Leftover & {
		style?: StyleProp<ImageStyle> | StyleFunc<StyleProp<ImageStyle>> | null;
	},
): AddLO<{ style?: StyleFunc<ImageStyle> }, Leftover>;

export type NativeCssFunc = typeof nativeCss;
