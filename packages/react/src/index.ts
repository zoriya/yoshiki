//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Properties } from "csstype";
import { Theme, YoshikiStyle, Breakpoints } from "@yoshiki/core";
import { useInsertionEffect } from "react";

// TODO: shorthands
export type CssObject = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
};

const useTheme = () => {
	return {} as Theme;
};

const generateAtomicCss = <Key extends keyof CssObject, Value extends CssObject[Key]>(
	key: Key,
	value: Value,
	{ theme }: { theme: Theme },
): string => {
	const cssKey = "toto";

	return `.ys-${key}-${value}: {
		${cssKey}: ${value};
	}`;
};

const dedupProperties = (...classes: string[]) => {
	return classes.join(" ");
};

export const useYoshiki = () => {
	const theme = useTheme();
	const classes: string[] = [];
	useInsertionEffect(() => {
		document.head.insertAdjacentHTML("beforeend", `<style>${classes.join("\n")}</style>`);
	}, [classes]);

	return {
		css: (
			css: CssObject /*  | CssObject[] */,
			{ className, style, ...leftOver }: { className: string; style: Properties },
		) => {
			const localStyle = Object.entries(css).map(([key, value]) =>
				generateAtomicCss(key as keyof CssObject, value, { theme }),
			);
			classes.concat(localStyle);
			return {
				className: dedupProperties(...localStyle, className),
				style: style,
				...leftOver,
			};
		},
		theme,
	};
};
