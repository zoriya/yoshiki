//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useStyleRegistry } from "./registry";
import { sanitize } from "./generator";

type Child = string | number | { [key: string]: Child };
type ToChild<T> = { [key in keyof T]: T[key] extends object ? ToChild<T[key]> : string };

const traverseEntries = <T extends Record<string, Child>, Ret>(
	first: T,
	second: T,
	mapper: (name: string, first: Child, second: Child) => Ret,
): Ret[] => {
	return Object.entries(first).map(([name, f]) => mapper(name, f, second[name]));
};

export const useAutomaticTheme = <T extends Record<string, Child>>(
	key: string,
	theme: {
		light: T;
		dark: T;
	},
): ToChild<T> => {
	const registry = useStyleRegistry();
	const cssVariables: { name: string; light: string | number; dark: string | number }[] = [];

	key = sanitize(key);

	const toAuto = (
		name: string,
		light: Child,
		dark: Child,
		parent?: string,
	): [string, string | Record<string, Child>] => {
		if (typeof light === "object" && typeof dark === "object") {
			return [
				name,
				Object.fromEntries(
					traverseEntries(light, dark, (n, lv, dv) =>
						toAuto(n, lv, dv, [parent, name].filter((x) => x).join("-")),
					),
				),
			];
		}
		const cssVar = ["-", key, parent, name].filter((x) => x).join("-");
		cssVariables.push({ name: cssVar, light: light.toString(), dark: dark.toString() });
		return [name, `var(${cssVar})`];
	};

	const auto = Object.fromEntries(traverseEntries(theme.light, theme.dark, toAuto)) as ToChild<T>;
	const ruleLight = `body { ${cssVariables.map((x) => `${x.name}: ${x.light}`).join(";")} }`;
	const ruleDark = `@media (prefers-color-scheme: dark) { body { ${cssVariables
		.map((x) => `${x.name}: ${x.dark}`)
		.join(";")} } }`;
	registry.addRule(
		{ type: "user", key: key + "-light", state: "normal", breakpoint: "default" },
		ruleLight,
	);
	registry.addRule(
		{ type: "user", key: key + "-dark", state: "normal", breakpoint: "default" },
		ruleDark,
	);
	return auto;
};
