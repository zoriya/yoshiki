//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Theme, breakpoints, useTheme } from "../theme";
import { WithState, YoshikiStyle, CssProperties } from "../type";
import { isBreakpoints } from "../utils";
import { useInsertionEffect } from "react";
import { StyleRegistry, useStyleRegistry } from "./registry";
import { shorthandsFn } from "../shorthands";

type _CssObject = {
	[key in keyof CssProperties]: YoshikiStyle<CssProperties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};

export type CssObject = Partial<WithState<_CssObject>> & _CssObject;

const stateMapper: {
	[key in keyof (WithState<undefined> & { normal: undefined })]: (cn: string) => string;
} = {
	normal: (cn) => `.${cn}`,
	press: (cn) => `.${cn}:active`,
	// :focus-visible is a pseudo-selector that only enables the focus ring when using the keyboard.
	focus: (cn) => `.${cn}:focus-visible`,
	// The body.noHover will be set when the users uses a touch screen instead of a mouse. This is used to only enable hover with the mouse.
	hover: (cn) => `:where(body:not(.noHover)) .${cn}:hover`,
	/* ["hover", ":hover"], */
};

const sanitize = (className: unknown) => {
	const name = typeof className === "string" ? className : JSON.stringify(className);
	return name.replaceAll(/[^\w-_]/g, "");
};

type PreprocessFunction = (key: string, value: unknown) => [key: string, value: unknown][];

const generateClass = (
	key: string,
	value: unknown,
	context: string,
	addCssContext: (className: string, block: string) => string,
	preprocess?: PreprocessFunction,
): [string, string][] => {
	if (preprocess) {
		return preprocess(key, value).flatMap(([nKey, nValue]) =>
			generateClass(nKey, nValue, context, addCssContext),
		);
	}

	const className = `ys-${context}${key}-${sanitize(value)}`;
	const cssKey = key.replace(/[A-Z]/g, "-$&").toLowerCase();
	return [[className, addCssContext(className, `{ ${cssKey}: ${value}; }`)]];
};

const generateAtomicCss = (
	key: string,
	value: YoshikiStyle<unknown>,
	state: keyof WithState<undefined> | "normal",
	{
		theme,
		preprocess,
	}: {
		theme: Theme;
		preprocess?: PreprocessFunction;
	},
): [string, string][] => {
	if (key in shorthandsFn) {
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value as any);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => generateAtomicCss(eKey, eValue, state, { theme, preprocess }))
			.flat();
	}
	if (typeof value === "function") {
		value = value(theme);
	}

	const statePrefix = state !== "normal" ? state + "_" : "";
	if (isBreakpoints(value)) {
		return Object.entries(value).flatMap(([bp, bpValue]) => {
			return generateClass(
				key,
				bpValue,
				`${statePrefix}${bp}_`,
				(className, block) => {
					const bpWidth = breakpoints[bp as keyof typeof breakpoints];
					return `@media (min-width: ${bpWidth}px) { ${stateMapper[state](className)} ${block} }`;
				},
				preprocess,
			);
		});
	}

	return generateClass(
		key,
		value,
		statePrefix,
		(className, block) => `${stateMapper[state](className)} ${block}`,
		preprocess,
	);
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
	css: Record<string, unknown>,
	classNames: string[] | undefined,
	{
		registry,
		theme,
		preprocess,
	}: { registry: StyleRegistry; theme: Theme; preprocess?: PreprocessFunction },
) => {
	const { hover, focus, press, ...inline } = css;

	const processStyles = (inlineStyle?: unknown, state?: keyof WithState<undefined>): string[] => {
		if (!inlineStyle) return [];

		// I'm sad that traverse is not a thing in JS.
		const [localClassNames, localStyle] = Object.entries(inlineStyle).reduce<[string[], string[]]>(
			(acc, [key, value]) => {
				const n = generateAtomicCss(key, value, state ?? "normal", { theme, preprocess });
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
		processStyles(hover, "hover"),
		processStyles(focus, "focus"),
		processStyles(press, "press"),
		classNames,
	);
};

export const useYoshiki = () => {
	const theme = useTheme();
	const registry = useStyleRegistry();

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	return {
		css: (css: CssObject, leftOverProps?: { className?: string }) => {
			const { className, ...leftOver } = leftOverProps ?? {};
			return {
				className: yoshikiCssToClassNames(css, className?.split(" "), { registry, theme }),
				...leftOver,
			};
		},
		theme,
	};
};
