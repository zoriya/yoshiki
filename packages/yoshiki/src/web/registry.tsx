//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createContext, ReactNode, useContext } from "react";
import { breakpoints } from "../theme";
import { WithState } from "../type";

const typeMapper: Record<"a" | "g" | "u", StyleKey["type"]> = {
	a: "atomic",
	g: "general",
	u: "user",
};
type StyleKey = {
	type: "atomic" | "general" | "user";
	key: string;
	breakpoint: keyof typeof breakpoints | "default";
	state: keyof WithState<unknown> | "normal";
};
type StyleRule = { key: StyleKey; css: string };

export class StyleRegistry {
	private rules: StyleRule[] = [];
	private styleElement: HTMLStyleElement | null = null;
	private cssOutput: Record<
		StyleKey["state"],
		Record<StyleKey["breakpoint"], Record<StyleKey["type"], Record<string, string>>>
	> = Object.fromEntries(
		["normal", "fover", "hover", "focus", "press"].map((x) => [
			x,
			Object.fromEntries(
				Object.keys({ default: 0, ...breakpoints }).map((bp) => [
					bp,
					Object.fromEntries(["atomic", "general", "user"].map((x) => [x, {}])),
				]),
			),
		]),
	) as any;

	constructor(isDefault?: true) {
		if (isDefault) {
			console.warn(
				"Warning: Yoshiki was used without a top level StyleRegistry. SSR won't be supported.",
			);
		}
	}

	addRule(key: StyleKey, rule: string) {
		if (this.rules.find(({ key: eKey }) => Object.is(key, eKey))) return;
		this.rules.push({ key, css: rule });
	}

	flushToBrowser() {
		if (!this.styleElement) {
			this.hydrate();
		}

		const [css] = this.flushToStyleString();

		if (!this.styleElement) {
			document.head.insertAdjacentHTML("beforeend", `<style data-yoshiki="">${css}</style>`);
		} else {
			this.styleElement.textContent = css;
		}
	}

	flushToComponent() {
		const [css, keys] = this.flushToStyleString();
		return <style data-yoshiki={keys}>{css}</style>;
	}

	flushToStyleString(): [string, string] {
		for (const { key, css } of this.rules) {
			this.cssOutput[key.state][key.breakpoint][key.type][key.key] = css;
		}
		this.rules = [];

		const keys: string[] = [];
		const css = Object.entries(this.cssOutput)
			.flatMap(([state, bp]) =>
				Object.entries(bp).flatMap(([breakpoint, tp]) =>
					Object.entries(tp).flatMap(([type, css]) => {
						const cssEntries = Object.entries(css);
						keys.push(...cssEntries.map((x) => x[0]));
						return cssEntries.length
							? ["", `/* ${type[0]}-${state}-${breakpoint} */`, ...cssEntries.map((x) => x[1])]
							: [];
					}),
				),
			)
			.join("\n");
		return [css, keys.join(" ")];
	}

	hydrate() {
		const styles = document.querySelectorAll<HTMLStyleElement>("style[data-yoshiki]");
		for (const style of styles) {
			if (style.textContent && style.dataset.yoshiki)
				this.hydrateStyle(style.textContent, style.dataset.yoshiki);
			if (!this.styleElement) {
				this.styleElement = style;
				style.dataset.yoshiki = "";
			} else {
				style.remove();
			}
		}
	}

	hydrateStyle(css: string, keysString: string) {
		const comReg = new RegExp("/\\* (\\w)-(\\w+)-(\\w+) \\*/");
		const keys = keysString.split(" ");

		let type: StyleKey["type"] = "atomic";
		let state: StyleKey["state"] = "normal";
		let bp: StyleKey["breakpoint"] = "default";
		let index = 0;

		for (const line of css.split("\n")) {
			const match = line.match(comReg);
			if (match) {
				// Not really safe but will break only if the user modifies the css manually.
				type = typeMapper[match[1] as "a" | "g" | "u"];
				state = match[2] as StyleKey["state"];
				bp = match[3] as StyleKey["breakpoint"];
				continue;
			}

			if (!line.length) continue;
			if (keys.length <= index) {
				console.error("Yoshiki: Hydratation mistake. There are more css rules than css keys.");
				return;
			}
			this.cssOutput[state][bp][type][keys[index]] = line;
			index++;
		}
	}
}

const defaultRegistry = typeof window !== "undefined" ? new StyleRegistry() : null;
const RegistryContext = createContext<StyleRegistry | null>(defaultRegistry);

export const StyleRegistryProvider = ({
	registry,
	children,
}: {
	registry: StyleRegistry;
	children: ReactNode;
}) => <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;

export const useStyleRegistry = () => useContext(RegistryContext) || new StyleRegistry(true);

export const createStyleRegistry = () => new StyleRegistry();
