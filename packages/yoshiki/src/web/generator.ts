//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useId, useInsertionEffect } from "react";
import { prefix } from "inline-style-prefixer";
import { Properties as CssProperties } from "csstype";
import { Theme, breakpoints, useTheme } from "../theme";
import {
	WithState,
	YoshikiStyle,
	StyleList,
	processStyleListWithoutChild,
	WithChild,
} from "../type";
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

type BreakpointKey = keyof typeof breakpoints | "default";
const addBreakpointBlock = (bp: BreakpointKey, block: string) => {
	if (bp === "default") return block;
	const bpWidth = breakpoints[bp];
	return `@media (min-width: ${bpWidth}px) { ${block} }`;
};

const generateAtomicCss = (
	key: string,
	value: YoshikiStyle<unknown>,
	state: keyof WithState<undefined> | "normal",
	{
		theme,
		preprocessBlock,
		registry,
	}: {
		theme: Theme;
		preprocessBlock?: PreprocessBlockFunction;
		registry: StyleRegistry;
	},
): string[] => {
	if (key in shorthandsFn) {
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value as any);
		return Object.entries(expanded)
			.map(([eKey, eValue]) =>
				generateAtomicCss(eKey, eValue, state, { theme, preprocessBlock, registry }),
			)
			.flat();
	}
	if (typeof value === "function") {
		value = value(theme);
	}

	const statePrefix = state !== "normal" ? state + "_" : "";
	if (isBreakpoints(value)) {
		return Object.entries(value).flatMap(([bp, bpValue]) => {
			const className = generateAtomicName(`${statePrefix}${bp}_`, key, bpValue);
			const block = generateClassBlock(
				{ [key]: typeof bpValue === "function" ? bpValue(theme) : bpValue },
				preprocessBlock,
			);
			if (!block) return [];
			registry.addRule(
				{ type: "atomic", key: `${key}:${bpValue}`, state, breakpoint: bp as BreakpointKey },
				`${stateMapper[state](className)} ${block}`,
			);
			return className;
		});
	}

	const className = generateAtomicName(statePrefix, key, value);
	const block = generateClassBlock({ [key]: value }, preprocessBlock);
	if (!block) return [];
	registry.addRule(
		{ type: "atomic", key: `${key}:${value}`, state, breakpoint: "default" },
		`${stateMapper[state](className)} ${block}`,
	);
	return [className];
};

const dedupProperties = (...classList: (string[] | undefined)[]) => {
	const atomicMap = new Map<string, string>();
	const rest: string[] = [];
	for (const classes of classList) {
		if (!classes) continue;

		for (const name of classes) {
			if (!name) continue;
			if (!name.startsWith("ys-")) {
				rest.push(name);
				continue;
			}
			// example ys-background-blue or ys-sm_background-red
			const key = name.substring(3, name.lastIndexOf("-"));
			atomicMap.set(key, name);
		}
	}
	rest.push(...atomicMap.values());
	return rest.join(" ");
};

export const yoshikiCssToClassNames = (
	css: Record<string, unknown> &
		Partial<WithState<Record<string, unknown>> & WithChild<Record<string, unknown>>>,
	classNames: string[] | undefined,
	{
		registry,
		theme,
		parentPrefix,
		preprocess,
		preprocessBlock,
	}: {
		registry: StyleRegistry;
		theme: Theme;
		parentPrefix: string;
		preprocess?: (style: Record<string, unknown>) => Record<string, unknown>;
		preprocessBlock?: PreprocessBlockFunction;
	},
) => {
	const { child, hover, focus, press, ...inline } = css;

	const processStyles = (
		inlineStyle?: Record<string, unknown>,
		state?: keyof WithState<undefined>,
	): string[] => {
		if (!inlineStyle) return [];
		if (preprocess) inlineStyle = preprocess(inlineStyle);

		return Object.entries(inlineStyle).flatMap(([key, value]) =>
			generateAtomicCss(key, value, state ?? "normal", {
				theme,
				preprocessBlock,
				registry,
			}),
		);
	};

	return dedupProperties(
		processStyles(inline),
		processStyles(child?.self),
		processStyles(hover?.self, "hover"),
		processStyles(focus?.self, "focus"),
		processStyles(press?.self, "press"),
		Object.keys({ ...hover, ...focus, ...press })
			.filter((x) => x !== "self")
			.map((x) => parentPrefix + x),
		classNames,
	);
};

// TODO: This is extremly hacky and an ID should be unique to a component, not an instance.
export const useClassId = (prefixKey?: string) => {
	const id = prefixKey ?? useId().replaceAll(":", "-");
	return ["ysp" + id, "ysc" + id] as const;
};

export const generateChildCss = (
	{
		hover,
		focus,
		press,
		child,
	}: Partial<WithState<Record<string, unknown>> & WithChild<Record<string, unknown>>>,
	{
		parentPrefix,
		childPrefix,
		registry,
		theme,
		preprocess,
		preprocessBlock,
	}: {
		parentPrefix: string;
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
			const parentName = parentPrefix + name;
			const className = childPrefix + name;

			const splitStyle = Object.entries(style)
				.flatMap((entry) => {
					if (entry[0] in shorthandsFn) {
						const expanded = shorthandsFn[entry[0] as keyof typeof shorthandsFn](entry[1] as any);
						return Object.entries(expanded);
					}
					return [entry];
				})
				.reduce(
					(acc, [key, value]) => {
						if (typeof value === "function") {
							value = value(theme);
						}
						if (isBreakpoints(value)) {
							for (const [bp, bpValue] of Object.entries(value)) {
								acc[bp] ??= {};
								acc[bp][key] = typeof bpValue === "function" ? bpValue(theme) : bpValue;
							}
						} else {
							acc["default"][key] = value;
						}
						return acc;
					},
					{ default: {} } as Record<string, Record<string, unknown>>,
				);
			// TODO: update the registry to sort classes on the right category

			for (const [breakpoint, breakedStyle] of Object.entries(splitStyle)) {
				const block = generateClassBlock(breakedStyle, preprocessBlock);
				if (!block) continue;
				const cssClass = `${stateMapper[state](parentName)} .${className} ${block}`;
				registry.addRule(
					{ type: "general", key: className, breakpoint: breakpoint as BreakpointKey, state },
					addBreakpointBlock(breakpoint as BreakpointKey, cssClass),
				);
			}
		}
	};

	processStyles(child, "normal");
	processStyles(hover, "hover");
	processStyles(focus, "focus");
	processStyles(press, "press");
};

export const useYoshiki = (prefixKey?: string) => {
	const theme = useTheme();
	const registry = useStyleRegistry();
	const [parentPrefix, childPrefix] = useClassId(prefixKey);

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	return {
		css: <Leftover>(
			cssList: StyleList<CssObject | string> & Partial<WithState<CssObject>> & WithChild<CssObject>,
			leftOverProps?: Leftover & { className?: string },
		): { className: string } & Omit<Leftover, "className"> => {
			const [css, parentKeys] = processStyleListWithoutChild(cssList);
			const { className, ...leftOver } = leftOverProps ?? {};

			generateChildCss(css, { parentPrefix, childPrefix, registry, theme });
			return {
				className: yoshikiCssToClassNames(
					css,
					[...parentKeys.map((x) => `${childPrefix}${x}`), ...(className?.split(" ") ?? [])],
					{ registry, theme, parentPrefix },
				),
				...leftOver,
			} as any;
		},
		theme,
	};
};
