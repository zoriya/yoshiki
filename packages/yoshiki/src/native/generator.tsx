//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import {
	ImageStyle,
	PressableProps,
	TextStyle,
	useWindowDimensions,
	ViewStyle,
} from "react-native";
import { breakpoints, Theme, useTheme } from "../theme";
import {
	Breakpoints,
	YoshikiStyle,
	hasState,
	processStyleList,
	processStyleListWithChild,
	assignChilds,
} from "../type";
import { isBreakpoints } from "../utils";
import { shorthandsFn } from "../shorthands";
import { StyleFunc, NativeCssFunc, EnhancedStyle } from "./type";
import { useReducer, useRef } from "react";

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

const useForceRerender = () => {
	return useReducer((x) => x + 1, 0)[1];
};

type State = EnhancedStyle<ViewStyle | TextStyle | ImageStyle> | undefined;

export const useYoshiki = () => {
	const breakpoint = useBreakpoint();
	const theme = useTheme();
	const forceRerender = useForceRerender();
	const childStyles = useRef<Record<string, State>>({});
	const ephemeralChildStyles: Record<string, State> = {};

	const rerender = () => {
		childStyles.current = ephemeralChildStyles;
		forceRerender();
	};

	const css: NativeCssFunc = (cssList, leftOvers) => {
		// The as any is because we can't be sure the style type is right one.
		const { child, ...css } = processStyleListWithChild(cssList, childStyles.current as any);

		const processStyle = (styleList: Record<string, YoshikiStyle<unknown>>) => {
			const ret = Object.fromEntries(
				Object.entries(styleList).flatMap(([key, value]) =>
					propertyMapper(key, value, { breakpoint, theme }),
				),
			);
			return ret;
		};

		// Directly mutate the current to use it on childs (since there is no state change to cause a rerender).
		assignChilds(childStyles.current, child);

		if (hasState<State>(css)) {
			const { hover, focus, press, ...inline } = css;
			const { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur } =
				leftOvers as PressableProps;
			const ret: StyleFunc<unknown> = ({ hovered, focused, pressed }) => {
				if (hovered) assignChilds(ephemeralChildStyles, hover);
				if (focused) assignChilds(ephemeralChildStyles, focus);
				if (pressed) assignChilds(ephemeralChildStyles, press);

				return [
					processStyle(inline),
					processStyle(child?.self ?? {}),
					hovered && processStyle(hover?.self ?? {}),
					focused && processStyle(focus?.self ?? {}),
					pressed && processStyle(press?.self ?? {}),
					leftOvers?.style &&
						(typeof leftOvers?.style === "function"
							? processStyleList(leftOvers?.style({ hovered, focused, pressed }))
							: leftOvers?.style),
				];
			};

			return {
				...leftOvers,
				style: ret as StyleFunc<ViewStyle>,
				// We must use a setTimeout since the child styles are computed inside the style function (called after onIn/onOut)
				// NOTE: The props onIn/onOut are overriden here and the user can't use them. Might want to find a way arround that.
				onPressIn: (e) => {
					onPressIn?.call(null, e);
					setTimeout(rerender);
				},
				onPressOut: (e) => {
					onPressOut?.call(null, e);
					setTimeout(rerender);
				},
				onHoverIn: (e) => {
					onHoverIn?.call(null, e);
					setTimeout(rerender);
				},
				onHoverOut: (e) => {
					onHoverOut?.call(null, e);
					setTimeout(rerender);
				},
				onFocus: (e) => {
					onFocus?.call(null, e);
					setTimeout(rerender);
				},
				onBlur: (e) => {
					onBlur?.call(null, e);
					setTimeout(rerender);
				},
			} satisfies PressableProps;
		} else {
			return {
				...leftOvers,
				style: [processStyle(css), processStyle(child?.self ?? {}), leftOvers?.style],
			} as any;
		}
	};

	return {
		css,
		theme: theme,
	};
};
