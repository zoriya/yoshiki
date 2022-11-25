//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, StyleProp, useWindowDimensions } from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import {
	Breakpoints,
	WithState,
	YoshikiStyle,
	hasState,
	StyleList,
	processStyleList,
} from "../type";
import { isBreakpoints } from "../utils";
import { shorthandsFn } from "../shorthands";
import { EnhancedStyle, YsStyleProps } from "./type";

const useBreakpoint = (): number => {
	const { width } = useWindowDimensions();
	const idx = Object.values(breakpoints).findIndex((x) => width <= x);
	if (idx === -1) return 0;
	return idx - 1;
};

const propertyMapper = (
	key: string,
	value: YoshikiStyle<unknown>,
	{ breakpoint, theme }: { breakpoint: number; theme: Theme },
): [string, unknown][] => {
	if (key in shorthandsFn) {
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value as any);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => propertyMapper(eKey, eValue, { breakpoint, theme }))
			.flat();
	}

	if (typeof value === "function") {
		value = value(theme);
	}
	if (isBreakpoints(value)) {
		const bpKeys = Object.keys(breakpoints) as Array<keyof Breakpoints<unknown>>;
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

export const useYoshiki = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();

	return {
		css: <
			Style extends ViewStyle | TextStyle | ImageStyle,
			State extends Partial<WithState<EnhancedStyle<Style>>> | Record<string, never>,
			Leftover,
		>(
			cssList: StyleList<EnhancedStyle<Style> & State>,
			leftOvers?: { style?: StyleProp<Style> } & Leftover,
		): YsStyleProps<Style, State> & Omit<Leftover, "style"> => {
			const css = processStyleList(cssList);
			const { style, ...leftOverProps } = leftOvers ?? {};

			const processStyle = (styleList: Record<string, YoshikiStyle<unknown>>): Style => {
				const ret = Object.fromEntries(
					Object.entries(styleList).flatMap(([key, value]) =>
						propertyMapper(key, value, { breakpoint, theme }),
					),
				);
				return ret as unknown as Style;
			};

			if (hasState<Style>(css)) {
				const { hover, focus, press, ...inline } = css;
				const ret: {
					style: (state: { hovered: boolean; focused: boolean; pressed: boolean }) => Style;
				} = {
					style: ({ hovered, focused, pressed }) => ({
						...processStyle(inline),
						...(hovered ? processStyle(hover) : {}),
						...(focused ? processStyle(focus) : {}),
						...(pressed ? processStyle(press) : {}),
						...processStyleList(style),
					}),
					...leftOverProps,
				};

				return ret as any;
			} else {
				const ret: { style: Style } = {
					style: { ...processStyle(css), ...processStyleList(style) },
					...leftOverProps,
				};

				return ret as YsStyleProps<Style, State> & Leftover;
			}
		},
		theme: theme,
	};
};
