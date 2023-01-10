//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createContext, createElement, ReactNode, useContext } from "react";
import { breakpoints } from "../theme";
import { WithState } from "../type";

type StyleKey = {
	type: "atomic" | "general" | "user";
	key: string;
	breakpoint: keyof typeof breakpoints | "default";
	state: keyof WithState<unknown> | "normal";
};
const keyToStr = ({ type, key, breakpoint, state }: StyleKey) => {
	return `${type[0]}-${key}-${breakpoint}-${state}`;
};
type StyleRule = { key: StyleKey; strKey: string; css: string };

export class StyleRegistry {
	private completed: string[] = [];
	private rules: [StyleKey, string][] = [];
	private styleElement: HTMLStyleElement | null = null;
	private cssOutput: Record<StyleKey["state"], Record<StyleKey["breakpoint"], string[]>> =
		Object.fromEntries(
			["normal", "hover", "focus", "press"].map((x) => [
				x,
				Object.fromEntries(Object.keys({ default: 0, ...breakpoints }).map((bp) => [bp, []])),
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
		if (this.rules.find(([eKey]) => Object.is(key, eKey))) return;
		this.rules.push([key, rule]);
	}

	addRules(keys: StyleKey[], rules: string[]) {
		// I'm sad that sequence is not a thing...
		for (let i = 0; i < keys.length; i++) {
			this.addRule(keys[i], rules[i]);
		}
	}

	flush(): StyleRule[] {
		const toFlush = this.rules
			.map(([key, css]) => ({ key, strKey: keyToStr(key), css: css }))
			.filter(({ strKey }) => !this.completed.includes(strKey));
		this.rules = [];
		this.completed.push(...toFlush.map(({ strKey }) => strKey));
		return toFlush;
	}

	flushToBrowser() {
		if (!this.styleElement) {
			this.hydrate();
		}

		const toFlush = this.flush();
		if (!toFlush.length) return;

		if (!this.styleElement) {
			document.head.insertAdjacentHTML(
				"beforeend",
				`<style data-yoshiki="">${this.toStyleString(toFlush)}</style>`,
			);
		} else {
			this.styleElement.textContent = this.toStyleString(toFlush);
		}
	}

	flushToComponent() {
		const toFlush = this.flush();
		if (!toFlush.length) return null;
		// JSX can't be used since the compiler is set to react-native mode.
		return createElement("style", {
			"data-yoshiki": this.completed.join(" "),
			children: this.toStyleString(toFlush),
		});
	}

	toStyleString(rules: StyleRule[]): string {
		for (const { key, css } of rules) {
			this.cssOutput[key.state][key.breakpoint].push(css);
		}
		return Object.entries(this.cssOutput)
			.flatMap(([state, bp]) =>
				Object.entries(bp).flatMap(([breakpoint, css]) =>
					css.length ? ["", `/* ${state}-${breakpoint} */`, ...css] : [],
				),
			)
			.join("\n");
	}

	hydrate() {
		const styles = document.querySelectorAll<HTMLStyleElement>("style[data-yoshiki]");
		for (const style of styles) {
			this.completed.push(...(style.dataset.yoshiki ?? "").split(" "));
			if (style.textContent) this.hydrateStyle(style.textContent);
			if (!this.styleElement) {
				this.styleElement = style;
				style.dataset.yoshiki = "";
			} else {
				style.remove();
			}
		}
	}

	hydrateStyle(css: string) {
		const comReg = new RegExp("/\\* (\\w+)-(\\w+) \\*/");
		let state: StyleKey["state"] = "normal";
		let bp: StyleKey["breakpoint"] = "default";

		for (const line of css.split("\n")) {
			const match = line.match(comReg);
			if (match) {
				// Not really safe but will break only if the user modifies the css manually.
				state = match[1] as StyleKey["state"];
				bp = match[2] as StyleKey["breakpoint"];
				continue;
			}

			if (line.length)
				this.cssOutput[state][bp].push(line);
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
}) => createElement(RegistryContext.Provider, { value: registry }, [children]);

export const useStyleRegistry = () => useContext(RegistryContext) || new StyleRegistry(true);

export const createStyleRegistry = () => new StyleRegistry();
