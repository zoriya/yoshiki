//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, useWindowDimensions } from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import {
	AtLeastOne,
	Breakpoints,
	FilterOr,
	WithState,
	YoshikiStyle,
	hasState,
	Length,
} from "../type";
import { isBreakpoints } from "../utils";
import { shorthandsFn } from "../shorthands";

export type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: FilterOr<
		Parameters<typeof shorthandsFn[key]>[0],
		Length,
		YoshikiStyle<number>
	>;
};

const useBreakpoint = (): number => {
	const { width } = useWindowDimensions();
	const idx = Object.values(breakpoints).findIndex((x) => width <= x);
	if (idx === -1) return 0;
	return idx - 1;
};

const propertyMapper = <
	Property extends number | string | boolean | undefined | Property[] | object,
>(
	key: string,
	value: YoshikiStyle<Property>,
	{ breakpoint, theme }: { breakpoint: number; theme: Theme },
): [string, number | string | boolean | undefined | object][] => {
	if (key in shorthandsFn) {
		// @ts-ignore `key` is not narrowed to `keyof typeof shorthandsFn` and value is not type safe.
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => propertyMapper(eKey, eValue, { breakpoint, theme }))
			.flat();
	}

	if (typeof value === "function") {
		value = value(theme);
	}
	if (isBreakpoints<Property>(value)) {
		const bpKeys = Object.keys(breakpoints) as Array<keyof Breakpoints<Property>>;
		for (let i = breakpoint; i >= 0; i--) {
			if (bpKeys[i] in value) {
				const bpVal = value[bpKeys[i]];
				return bpVal ? [[key, bpVal]] : [];
			}
		}
		return [];
	}
	return [[key, value]];
};

export type YsStyleProps<Style, State> = State extends AtLeastOne<WithState<Style>>
	? { style: (state: { pressed?: boolean; focused?: boolean; hovered?: boolean }) => Style }
	: { style: Style };

export const useYoshiki = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();

	return {
		css: <
			Style extends ViewStyle | TextStyle | ImageStyle,
			State extends Partial<WithState<EnhancedStyle<Style>>> | Record<string, never>,
		>(
			css: EnhancedStyle<Style> & State,
			leftOvers?: { style?: Style },
		): YsStyleProps<Style, State> => {
			const { style, ...leftOverProps } = leftOvers ?? {};

			const processStyle = (styleList: EnhancedStyle<Style>): Style => {
				// @ts-ignore propertyMapper always returns key that are valid for the current Style
				return Object.fromEntries(
					Object.entries(styleList).flatMap(([key, value]) =>
						propertyMapper(key, value, { breakpoint, theme }),
					),
				);
			};

			if (hasState<Style>(css)) {
				const { hover, focus, press, ...inline } = css;
				const ret: {
					style: (state: { hovered: boolean; focused: boolean; pressed: boolean }) => Style;
				} = {
					style: ({ hovered, focused, pressed }) => ({
						// @ts-ignore EnhancedStyle<Style> is not assignable to EnhancedStyle<Style>...
						...processStyle(inline),
						...(hovered ? processStyle(hover) : {}),
						...(focused ? processStyle(focus) : {}),
						...(pressed ? processStyle(press) : {}),
						...style,
					}),
					...leftOverProps,
				};

				// @ts-ignore Ts is not able to identify the type of the return type (the condition throws him off).
				return ret;
			} else {
				const ret: { style: Style } = {
					style: { ...processStyle(css), ...style },
					...leftOverProps,
				};

				// @ts-ignore Ts is not able to identify the type of the return type (the condition throws him off).
				return ret;
			}
		},
		theme: theme,
	};
};

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
