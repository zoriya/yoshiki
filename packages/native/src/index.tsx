//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, useWindowDimensions } from "react-native";
import { breakpoints, Breakpoints, Theme, YoushikiStyle } from "@yoshiki/core";

// TODO: shorhands
type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoushikiStyle<Properties[key]>;
};
export type CssObject =
	| EnhancedStyle<ViewStyle>
	| EnhancedStyle<TextStyle>
	| EnhancedStyle<ImageStyle>;
type Properties = ViewStyle | TextStyle | ImageStyle;

const useBreakpoint = (): number => {
	const { width } = useWindowDimensions();
	const idx = Object.values(breakpoints).findIndex((x) => width <= x);
	if (idx === -1) return 0;
	return idx - 1;
};

export const useTheme = () => {
	return {} as Theme;
};

const isBreakpoints = <T,>(value: unknown): value is Breakpoints<T> => {
	if (typeof value !== "object" || !value) return false;
	for (const v of Object.keys(value)) {
		if (!(v in breakpoints)) {
			return false;
		}
	}
	return true;
};

const propertyMapper = <
	Property extends number | string | boolean | undefined | Property[] | object,
>(
	value: Property | Breakpoints<Property> | ((theme: Theme) => Property),
	{ breakpoint, theme }: { breakpoint: number; theme: Theme },
): Property | undefined => {
	if (isBreakpoints<Property>(value)) {
		const bpKeys = Object.keys(breakpoints) as Array<keyof Breakpoints<Property>>;
		for (let i = breakpoint; i >= 0; i--) {
			if (bpKeys[i] in value) {
				return value[bpKeys[i]];
			}
		}
		return undefined;
	}
	if (typeof value === "function") {
		return value(theme);
	}
	return value;
};

// TODO: do not use a hook and use a global window width.
export const useCss = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();

	return (css: CssObject, leftOvers?: { style?: Properties }) => {
		const { style, ...leftOverProps } = leftOvers ?? {};

		const ret: Properties = Object.fromEntries(
			Object.entries(css)
				.map(([key, value]) => [key, propertyMapper(value, { breakpoint, theme })])
				.filter(([, value]) => value !== undefined),
		);

		return {
			style: { ...ret, ...style },
			...leftOverProps,
		};
	};
};
