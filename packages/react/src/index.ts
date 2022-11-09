//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Properties } from "csstype";
import { Theme, YoshikiStyle, useTheme, breakpoints, isBreakpoints } from "@yoshiki/core";
import { useInsertionEffect } from "react";

// TODO: shorthands
export type CssObject = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
};

const generateAtomicCss = <Property extends number | boolean | string | undefined>(
	key: string,
	value: YoshikiStyle<Property>,
	{ theme }: { theme: Theme },
): [string, string][] => {
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
	return classes.filter((x) => x).join(" ");
};

export const useYoshiki = () => {
	const theme = useTheme();
	let classes: string[] = [];
	useInsertionEffect(() => {
		console.log(classes);
		document.head.insertAdjacentHTML("beforeend", `<style>${classes.join("\n")}</style>`);
	}, [classes]);

	return {
		css: (
			css: CssObject /*  | CssObject[] */,
			leftOverProps?: { className?: string; style?: Properties },
		) => {
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
			classes = classes.concat(localStyle);
			return {
				className: dedupProperties(...localClassNames, className),
				style: style,
				...leftOver,
			};
		},
		theme,
	};
};
