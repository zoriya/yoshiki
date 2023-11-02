//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints } from "./theme";
import { Breakpoints, processStyleList, StyleList, YoshikiStyle } from "./type";

export const isBreakpoints = <T>(value: unknown): value is Breakpoints<T> => {
	if (typeof value !== "object" || !value) return false;
	for (const v of Object.keys(value)) {
		if (!(v in breakpoints)) {
			return false;
		}
	}
	return true;
};

export type WithBreakpoints<T> = T extends any ? { [key in keyof T]: Breakpoints<T[key]> } : never;

export const forceBreakpoint = <T extends Record<string, unknown>>(
	value: T,
	breakpoint: keyof typeof breakpoints,
): WithBreakpoints<T> => {
	return Object.fromEntries(
		Object.entries(value).map(([key, value]) => [key, { [breakpoint]: value }]),
	) as any;
};

export const ysMap = <Property, Mapped>(
	value: YoshikiStyle<Property>,
	f: (p: Property) => Mapped,
): YoshikiStyle<Mapped> => {
	if (typeof value === "function") {
		// @ts-ignore too hard to type right
		return (theme) => ysMap(value(theme), f);
	}
	if (isBreakpoints(value)) {
		return Object.fromEntries(
			Object.entries(value).map(([bp, bpValue]) => [bp, ysMap(bpValue, f)]),
		);
	}
	return f(value);
};

/**
 * Extract css classes from a "yoshiki/native"'s css function and return it as a vanila css props
 * that can be used directly in a <div>' props.
 *
 * This allows things like
 *
 * @example
 *
 * ```typescript
 * const First = () => {
 * 	const { css } = useYoshiki();
 * 	return (
 * 		<View {...css({ pX: px(12) })}>
 * 			<p {...css({})}>Test</p>
 * 		</View>
 * 	);
 * };
 *
 * const Second = (props) => {
 * 	return <p {...nativeStyleToCss(props)}>Test</p>;
 * };
 * ```
 */
export const nativeStyleToCss = <Style>({
	style,
	...props
}: {
	style?: StyleList<{ $$css?: true; yoshiki?: string } | Style>;
}) => {
	const inline = processStyleList(style);
	const className = "$$css" in inline && inline.$$css ? inline.yoshiki : undefined;
	return { ...props, className };
};
