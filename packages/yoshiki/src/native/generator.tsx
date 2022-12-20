//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useWindowDimensions } from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import { Breakpoints, YoshikiStyle, hasState, processStyleList } from "../type";
import { isBreakpoints } from "../utils";
import { shorthandsFn } from "../shorthands";
import { StyleFunc, NativeCssFunc } from "./type";

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
				const bpValOrF = value[bpKeys[i]];
				const bpVal = typeof bpValOrF === "function" ? bpValOrF(theme) : bpValOrF;
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

	const css: NativeCssFunc = (cssList, leftOvers) => {
		const css = processStyleList(cssList);

		const processStyle = (styleList: Record<string, YoshikiStyle<unknown>>) => {
			const ret = Object.fromEntries(
				Object.entries(styleList).flatMap(([key, value]) =>
					propertyMapper(key, value, { breakpoint, theme }),
				),
			);
			return ret;
		};

		if (hasState<Record<string, unknown>>(css)) {
			const { hover, focus, press, ...inline } = css;
			const ret: StyleFunc<unknown> = ({ hovered, focused, pressed }) => ({
				...processStyle(inline),
				...(hovered ? processStyle(hover ?? {}) : {}),
				...(focused ? processStyle(focus ?? {}) : {}),
				...(pressed ? processStyle(press ?? {}) : {}),
				...(leftOvers?.style
					? typeof leftOvers?.style === "function"
						? processStyleList(leftOvers?.style({ hovered, focused, pressed }))
						: processStyleList(leftOvers?.style)
					: {}),
			});

			return {
				...leftOvers,
				style: ret,
			};
		} else {
			const loStyles =
				leftOvers?.style && typeof leftOvers?.style !== "function"
					? processStyleList(leftOvers.style)
					: {};
			const ret = {
				...leftOvers,
				style: { ...processStyle(css), ...loStyles },
			};

			return ret as any;
		}
	};

	return {
		css,
		theme: theme,
	};
};
