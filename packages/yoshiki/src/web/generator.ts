//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useId, useInsertionEffect } from "react";
import { prefix } from "inline-style-prefixer";
import { Properties as CssProperties } from "csstype";
import { Theme, breakpoints, useTheme } from "../theme";
import { WithState, YoshikiStyle, StyleList, processStyleListWithoutChild } from "../type";
import { forceBreakpoint, isBreakpoints } from "../utils";
import { StyleRegistry, useStyleRegistry } from "./registry";
import { shorthandsFn } from "../shorthands";

type _CssObject = {
	[key in keyof CssProperties]: YoshikiStyle<CssProperties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};

export type CssObject = Partial<WithState<_CssObject>> & _CssObject;

type ForcedBreakpointStyle = {
	[key in keyof CssProperties]: CssProperties[key] | ((theme: Theme) => CssProperties[key]);
};

export const sm = (value: ForcedBreakpointStyle) => forceBreakpoint(value, "sm");
export const md = (value: ForcedBreakpointStyle) => forceBreakpoint(value, "md");
export const lg = (value: ForcedBreakpointStyle) => forceBreakpoint(value, "lg");
export const xl = (value: ForcedBreakpointStyle) => forceBreakpoint(value, "xl");

const stateMapper: {
	[key in keyof (WithState<undefined> & { normal: undefined })]: (cn: string) => string;
} = {
	normal: (cn) => `.${cn}`,
	press: (cn) => `.${cn}:active`,
	// :focus-visible is a pseudo-selector that only enables the focus ring when using the keyboard.
	focus: (cn) => `.${cn}:focus-visible`,
	// The body.noHover will be set when the users uses a touch screen instead of a mouse. This is used to only enable hover with the mouse.
	// The where is used to decrease the rule specificity (make it the same as juste .cn:hover)
	hover: (cn) => `:where(body:not(.noHover)) .${cn}:hover`,
};

const sanitize = (className: unknown) => {
	const name = typeof className === "string" ? className : JSON.stringify(className);
	if (name === undefined) return "undefined";
	// Keep - as a _ for minus symbols.
	return name.replaceAll("-", "_").replaceAll(/[^\w\d_]/g, "");
};

type PreprocessBlockFunction = (block: { [key: string]: unknown }) => { [key: string]: unknown };

const generateAtomicName = (context: string, key: string, value: unknown) =>
	`ys-${context}${key}-${sanitize(value)}`;

const generateClassBlock = (
	style: Record<string, unknown>,
	preprocessBlock?: PreprocessBlockFunction,
): string | undefined => {
	preprocessBlock ??= (id) => id;
	const block = Object.entries(prefix(preprocessBlock(style)))
		.filter(([_, value]) => value !== undefined)
		.flatMap(([nKey, nValue]) => {
			const cssKey = nKey.replace(/[A-Z]/g, "-$&").toLowerCase();
			return Array.isArray(nValue)
				? nValue.map((x) => `${cssKey}: ${x};`)
				: [`${cssKey}: ${nValue};`];
		})
		.join(" ");
	if (!block.length) return undefined;
	return `{ ${block} }`;
};

const generateAtomicCss = (
	key: string,
	value: YoshikiStyle<unknown>,
	state: keyof WithState<undefined> | "normal",
	{
		theme,
		preprocessBlock,
	}: {
		theme: Theme;
		preprocessBlock?: PreprocessBlockFunction;
	},
): [string, string][] => {
	if (key in shorthandsFn) {
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value as any);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => generateAtomicCss(eKey, eValue, state, { theme, preprocessBlock }))
			.flat();
	}
	if (typeof value === "function") {
		value = value(theme);
	}

	const statePrefix = state !== "normal" ? state + "_" : "";
	if (isBreakpoints(value)) {
		return Object.entries(value).map(([bp, bpValue]) => {
			const bpWidth = breakpoints[bp as keyof typeof breakpoints];
			const className = generateAtomicName(`${statePrefix}${bp}_`, key, bpValue);
			const block = generateClassBlock(
				{ [key]: typeof bpValue === "function" ? bpValue(theme) : bpValue },
				preprocessBlock,
			);
			return [
				className,
				`@media (min-width: ${bpWidth}px) { ${stateMapper[state](className)} ${block} }`,
			];
		});
	}

	const className = generateAtomicName(statePrefix, key, value);
	const block = generateClassBlock({ [key]: value }, preprocessBlock);
	return [[className, `${stateMapper[state](className)} ${block}`]];
};

const dedupProperties = (...classList: (string[] | undefined)[]) => {
	const propMap = new Map<string, string>();
	for (const classes of classList) {
		if (!classes) continue;

		for (const name of classes) {
			if (!name) continue;
			// example ys-background-blue or ys-sm_background-red
			const key = name.substring(3, name.lastIndexOf("-"));
			propMap.set(key, name);
		}
	}
	return Array.from(propMap.values()).join(" ");
};

export const yoshikiCssToClassNames = (
	css: Record<string, unknown> & Partial<WithState<Record<string, unknown>>>,
	classNames: string[] | undefined,
	{
		registry,
		theme,
		preprocess,
		preprocessBlock,
	}: {
		registry: StyleRegistry;
		theme: Theme;
		preprocess?: (style: Record<string, unknown>) => Record<string, unknown>;
		preprocessBlock?: PreprocessBlockFunction;
	},
) => {
	const { hover, focus, press, ...inline } = css;

	const processStyles = (
		inlineStyle?: Record<string, unknown>,
		state?: keyof WithState<undefined>,
	): string[] => {
		if (!inlineStyle) return [];
		if (preprocess) inlineStyle = preprocess(inlineStyle);

		// I'm sad that traverse is not a thing in JS.
		const [localClassNames, localStyle] = Object.entries(inlineStyle).reduce<[string[], string[]]>(
			(acc, [key, value]) => {
				const n = generateAtomicCss(key, value, state ?? "normal", {
					theme,
					preprocessBlock,
				});
				acc[0].push(...n.map((x) => x[0]));
				acc[1].push(...n.map((x) => x[1]));
				return acc;
			},
			[[], []],
		);
		registry.addRules(localClassNames, localStyle);
		return localClassNames;
	};

	return dedupProperties(
		processStyles(inline),
		processStyles(hover?.self, "hover"),
		processStyles(focus?.self, "focus"),
		processStyles(press?.self, "press"),
		classNames,
	);
};

export const useYoshiki = () => {
	const theme = useTheme();
	const registry = useStyleRegistry();
	const childPrefix = useClassId();

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	return {
		css: <Leftover>(
			cssList: StyleList<CssObject | string>,
			leftOverProps?: Leftover & { className?: string },
		): { className: string } & Omit<Leftover, "className"> => {
			const [css, parentKeys] = processStyleListWithoutChild(cssList);
			const { className, ...leftOver } = leftOverProps ?? {};

			generateChildCss(css, { childPrefix, registry, theme });
			return {
				className: yoshikiCssToClassNames(
					css,
					[...parentKeys.map((x) => `${childPrefix}${x}`), ...(className?.split(" ") ?? [])],
					{ registry, theme },
				),
				...leftOver,
			} as any;
		},
		theme,
	};
};

export const useClassId = () => {
	return "ysc" + useId().replaceAll(":", "-");
};

export const generateChildCss = (
	{ hover, focus, press }: Partial<WithState<Record<string, unknown>>>,
	{
		childPrefix,
		registry,
		theme,
		preprocess,
		preprocessBlock,
	}: {
		childPrefix: string;
		registry: StyleRegistry;
		theme: Theme;
		preprocess?: (style: Record<string, unknown>) => Record<string, unknown>;
		preprocessBlock?: PreprocessBlockFunction;
	},
) => {
	preprocessBlock ??= (id) => id;

	const processStyles = (
		list: Record<string, Record<string, unknown> | undefined> | undefined,
		state: keyof WithState<unknown> | "normal",
	) => {
		if (!list) return;
		for (let [name, style] of Object.entries(list)) {
			if (!style || name === "self") continue;
			if (preprocess) style = preprocess(style);
			const className = `${childPrefix}${name}`;

			// TODO process styles breakpoints & theme

			const block = generateClassBlock(style, preprocessBlock);
			const cssClass = `${stateMapper[state](className)} ${block}`;
			registry.addRule(`${className}-${state}`, cssClass);
		}
	};

	processStyles(hover, "hover");
	processStyles(focus, "focus");
	processStyles(press, "press");
};
