//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, useWindowDimensions } from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import { Breakpoints, YoshikiStyle } from "../type";
import { isBreakpoints } from "../utils";

// TODO: shorhands
type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
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

export const useYoshiki = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();

	return {
		css: <Style extends ViewStyle | TextStyle | ImageStyle>(
			css: EnhancedStyle<Style>,
			leftOvers?: { style?: Style },
		): { style: Style } => {
			const { style, ...leftOverProps } = leftOvers ?? {};

			const inline: Style = Object.fromEntries(
				Object.entries(css)
					.map(([key, value]) => [key, propertyMapper(value, { breakpoint, theme })])
					.filter(([, value]) => value !== undefined),
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
