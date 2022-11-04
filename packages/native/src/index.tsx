//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle, useWindowDimensions } from "react-native";
import { breakpoints, Breakpoints, YoushikiStyle } from "@yoshiki/core";

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

export const css = (css: CssObject, leftOvers?: { style?: Properties }) => {
	const { style, ...leftOverProps } = leftOvers ?? {};

	let breakpoint: number | undefined = undefined;
	const ret: Properties = Object.fromEntries(
		Object.entries(css)
			.map(([key, value]) => {
				if (typeof value === "object") {
					if (!breakpoint) breakpoint = useBreakpoint();

					const bpKeys = Object.keys(breakpoints);
					for (let i = breakpoint; i >= 0; i--) {
						if (bpKeys[i] in value) {
							return [key, value[bpKeys[i]]];
						}
					}
					return undefined;
				}
				return [key, value];
			})
			.filter((x) => x !== undefined),
	);

	return {
		style: { ...ret, ...style },
		...leftOverProps,
	};
};
