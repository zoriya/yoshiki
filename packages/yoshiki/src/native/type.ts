//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { WithState, YoshikiStyle, StyleList } from "../type";
import { shorthandsFn } from "../shorthands";
import { ImageStyle, PressableProps, StyleProp, TextStyle, ViewStyle } from "react-native";
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

export type NativeStyle = ViewStyle | TextStyle | ImageStyle;

declare function nativeCss<Style extends NativeStyle, Leftover = never>(
	cssList: StyleList<EnhancedStyle<Style> | string>,
	leftOvers?: Leftover & { style?: StyleProp<Style> | null },
): AddLO<{ style?: Style }, Leftover>;

declare function nativeCss<Style extends NativeStyle, Leftover = never>(
	cssList: StyleList<
		(EnhancedStyle<Style> & Partial<WithState<EnhancedStyle<NativeStyle>>>) | string
	>,
	leftOvers?: Leftover & { style?: StyleProp<Style> | StyleFunc<StyleProp<Style>> | null },
): AddLO<PressableProps, Leftover>;

export type NativeCssFunc = typeof nativeCss;
