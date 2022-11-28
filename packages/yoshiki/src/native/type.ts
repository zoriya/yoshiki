//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { FilterOr, WithState, YoshikiStyle, Length, StyleList } from "../type";
import { shorthandsFn } from "../shorthands";
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";

// The extends any check is only used to make EnhancedStyle a distributive type.
// This means EnhancedStyle<ViewStyle | TextStyle> = EnhancedStyle<ViewStyle> | EnhancedStyle<TextStyle>
export type EnhancedStyle<Properties> = Properties extends any
	? {
			[key in keyof Properties]: YoshikiStyle<Properties[key]>;
	  } & {
			[key in keyof typeof shorthandsFn]?: FilterOr<
				Parameters<typeof shorthandsFn[key]>[0],
				Length,
				YoshikiStyle<number>
			>;
	  }
	: never;

export type StyleFunc<Style> = (state: {
	pressed?: boolean;
	focused?: boolean;
	hovered?: boolean;
}) => Style;

type AddLO<T, LO> = [LO] extends [never] ? T : Omit<LO, "style"> & T;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ViewStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<ViewStyle> },
): AddLO<{ style?: ViewStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ViewStyle> & Partial<WithState<EnhancedStyle<ViewStyle>>>>,
	leftOvers?: Leftover & { style?: StyleProp<ViewStyle> | StyleFunc<StyleProp<ViewStyle>> },
): AddLO<{ style?: StyleFunc<ViewStyle> }, Leftover>;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<TextStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<TextStyle> },
): AddLO<{ style?: TextStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<TextStyle> & Partial<WithState<EnhancedStyle<TextStyle>>>>,
	leftOvers?: Leftover & { style?: StyleProp<TextStyle> | StyleFunc<StyleProp<TextStyle>> },
): AddLO<{ style?: StyleFunc<TextStyle> }, Leftover>;

declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ImageStyle>>,
	leftOvers?: Leftover & { style?: StyleProp<ImageStyle> },
): AddLO<{ style?: ImageStyle }, Leftover>;
declare function nativeCss<Leftover = never>(
	cssList: StyleList<EnhancedStyle<ImageStyle> & Partial<WithState<EnhancedStyle<ImageStyle>>>>,
	leftOvers?: Leftover & { style?: StyleProp<ImageStyle> | StyleFunc<StyleProp<ImageStyle>> },
): AddLO<{ style?: StyleFunc<ImageStyle> }, Leftover>;

export type NativeCssFunc = typeof nativeCss;
