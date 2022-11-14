//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, useWindowDimensions } from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import { Breakpoints, YoshikiStyle } from "../type";
import { isBreakpoints } from "../utils";
import { shorthandsFn } from "./shorthands";

type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};
type Properties = ViewStyle | TextStyle | ImageStyle;

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

export const useYoshiki = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();

	return {
		css: <Style extends ViewStyle | TextStyle | ImageStyle>(
			css: EnhancedStyle<Style>,
			leftOvers?: { style?: Style },
		): { style: Style } => {
			const { style, ...leftOverProps } = leftOvers ?? {};

			// @ts-ignore propertyMapper always returns key that are valid for the current Style
			const inline: Style = Object.fromEntries(
				Object.entries(css).flatMap(([key, value]) =>
					propertyMapper(key, value, { breakpoint, theme }),
				),
			);

			return {
				style: { ...inline, ...style },
				...leftOverProps,
			};
		},
		theme: theme,
	};
};

export type Stylable = {
	style: Properties;
};
