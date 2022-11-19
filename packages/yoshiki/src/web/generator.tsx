//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Theme, breakpoints, useTheme } from "../theme";
import { WithState, YoshikiStyle, CssProperties } from "../type";
import { isBreakpoints } from "../utils";
import { CSSProperties, useInsertionEffect } from "react";
import { useStyleRegistry } from "./registry";
import { shorthandsFn } from "../shorthands";

type _CssObject = {
	[key in keyof CssProperties]: YoshikiStyle<CssProperties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};

export type CssObject = Partial<WithState<_CssObject>> & _CssObject;

const stateMapper: { [key in keyof (WithState<undefined> & { normal: undefined })]: (cn: string) => string } = {
	normal: (cn) => `.${cn}`,
	press: (cn) => `.${cn}:active`,
	// :focus-visible is a pseudo-selector that only enables the focus ring when using the keyboard.
	focus: (cn) => `.${cn}:focus-visible`,
	// The body.noHover will be set when the users uses a touch screen instead of a mouse. This is used to only enable hover with the mouse.
	hover: (cn) => `:where(body:not(.noHover)) .${cn}:hover`,
	/* ["hover", ":hover"], */
};

const generateAtomicCss = <Property extends number | boolean | string | undefined>(
	key: string,
	value: YoshikiStyle<Property>,
	state: keyof WithState<undefined> | "normal",
	{ theme }: { theme: Theme },
): [string, string][] => {
	if (key in shorthandsFn) {
		// @ts-ignore `key` is not narrowed to `keyof typeof shorthandsFn` and value is not type safe.
		const expanded = shorthandsFn[key as keyof typeof shorthandsFn](value);
		return Object.entries(expanded)
			.map(([eKey, eValue]) => generateAtomicCss(eKey, eValue, state, { theme }))
			.flat();
	}

	const cssKey = key.replace(/[A-Z]/g, "-$&").toLowerCase();
	const statePrefix = state !== "normal" ? state + "_" : "";

	if (typeof value === "function") {
		value = value(theme);
	}
	if (isBreakpoints<Property>(value)) {
		return Object.entries(value).map(([bp, bpValue]) => {
			const className = `ys-${statePrefix}${bp}_${key}-${bpValue}`;
			const bpWidth = breakpoints[bp as keyof typeof breakpoints];
			return [
				className,
				`@media (min-width: ${bpWidth}px) { ${stateMapper[state](className)} { ${cssKey}: ${bpValue}; } }`,
			];
		});
	}

	const className = `ys-${statePrefix}${key}-${value}`;
	return [[className, `${stateMapper[state](className)} { ${cssKey}: ${value}; }`]];
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

export const useYoshiki = () => {
	const theme = useTheme();
	const registry = useStyleRegistry();

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	return {
		css: (css: CssObject, leftOverProps?: { className?: string; style?: CSSProperties }) => {
			const { hover, focus, press, ...inline } = css;
			const { className, style, ...leftOver } = leftOverProps ?? {};

			const processStyles = (
				inlineStyle?: _CssObject,
				state?: keyof WithState<undefined>,
			): string[] => {
				if (!inlineStyle) return [];

				// I'm sad that traverse is not a thing in JS.
				const [localClassNames, localStyle] = Object.entries(inlineStyle).reduce<
					[string[], string[]]
				>(
					(acc, [key, value]) => {
						const n = generateAtomicCss(key, value, state ?? "normal", { theme });
						acc[0].push(...n.map((x) => x[0]));
						acc[1].push(...n.map((x) => x[1]));
						return acc;
					},
					[[], []],
				);
				registry.addRules(localClassNames, localStyle);
				return localClassNames;
			};

			return {
				className: dedupProperties(
					processStyles(inline),
					processStyles(hover, "hover"),
					processStyles(focus, "focus"),
					processStyles(press, "press"),
					className?.split(" "),
				),
				style: style,
				...leftOver,
			};
		},
		theme,
	};
};
