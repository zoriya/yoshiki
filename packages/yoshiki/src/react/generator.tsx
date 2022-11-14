//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Theme, breakpoints, useTheme } from "../theme";
import { YoshikiStyle } from "../type";
import { isBreakpoints } from "../utils";
import { CSSProperties, useInsertionEffect } from "react";
import { useStyleRegistry } from "./registry";
import { Properties } from "csstype";
import { shorthandsFn } from "./shorthands";

type CssObject = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};

const generateAtomicCss = <Property extends number | boolean | string | undefined>(
	key: string,
	value: YoshikiStyle<Property>,
	{ theme }: { theme: Theme },
): [string, string][] => {
	if (key in shorthandsFn) {
		// @ts-ignore `key` is not narrowed to `keyof typeof shorthandsFn` and value is not type safe.
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => generateAtomicCss(eKey, eValue, { theme }))
			.flat();
	}

	const cssKey = key.replace(/[A-Z]/g, "-$&").toLowerCase();

	if (typeof value === "function") {
		value = value(theme);
	}
	if (isBreakpoints<Property>(value)) {
		return Object.entries(value).map(([bp, bpValue]) => {
			const className = `ys-${bp}_${key}-${bpValue}`;
			const bpWidth = breakpoints[bp as keyof typeof breakpoints];
			return [
				className,
				`@media (min-width: ${bpWidth}px) { .${className} { ${cssKey}: ${bpValue}; } }`,
			];
		});
	}

	const className = `ys-${key}-${value}`;
	return [[className, `.${className} { ${cssKey}: ${value}; }`]];
};

const dedupProperties = (...classes: (string | undefined)[]) => {
	const propMap = new Map<string, string>();
	for (const name of classes) {
		if (!name) continue;
		// example ys-background-blue or ys-sm_background-red
		const key = name.substring(3, name.lastIndexOf("-"));
		propMap.set(key, name);
	}
	return Array.from(propMap.values()).join(" ");
};

export const useYoshiki = () => {
	const theme = useTheme();
	const registry = useStyleRegistry();

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	return {
		css: (css: CssObject, leftOverProps?: { className?: string; style?: CSSProperties }) => {
			const { className, style, ...leftOver } = leftOverProps ?? {};

			// I'm sad that traverse is not a thing in JS.
			const [localClassNames, localStyle] = Object.entries(css).reduce<[string[], string[]]>(
				(acc, [key, value]) => {
					const n = generateAtomicCss(key, value, { theme });
					acc[0].push(...n.map((x) => x[0]));
					acc[1].push(...n.map((x) => x[1]));
					return acc;
				},
				[[], []],
			);
			registry.addRules(localClassNames, localStyle);
			return {
				className: dedupProperties(...localClassNames, className),
				style: style,
				...leftOver,
			};
		},
		theme,
	};
};
