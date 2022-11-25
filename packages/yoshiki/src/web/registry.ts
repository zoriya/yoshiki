//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createContext, createElement, ReactNode, useContext } from "react";
import { breakpoints } from "../theme";

function findLastIndex<T>(
	array: readonly T[],
	predicate: (element: T, index: number) => boolean,
	startIndex?: number,
): number {
	for (let i = startIndex ?? array.length - 1; i >= 0; i--) {
		if (predicate(array[i], i)) {
			return i;
		}
	}
	return -1;
}

export class StyleRegistry {
	private completed: string[] = [];
	private rules: [string, string][] = [];
	private styleElement: HTMLStyleElement | null = null;

	constructor(isDefault?: true) {
		if (isDefault) {
			console.warn(
				"Warning: Yoshiki was used without a top level StyleRegistry. SSR won't be supported.",
			);
		}
	}

	addRule(key: string, rule: string) {
		if (this.rules.find(([eKey]) => key === eKey)) return;
		this.rules.push([key, rule]);
	}

	addRules(keys: string[], rules: string[]) {
		// I'm sad that sequence is not a thing...
		for (let i = 0; i < keys.length; i++) {
			this.addRule(keys[i], rules[i]);
		}
	}

	flush(): string[] {
		const ret = this.rules.filter(([key]) => !this.completed.includes(key));
		this.rules = [];
		this.completed.push(...ret.map(([key]) => key));
		return ret.map(([, value]) => value);
	}

	flushToBrowser() {
		const toMerge: string[] = [];

		if (!this.styleElement) {
			const styles = document.querySelectorAll<HTMLStyleElement>("style[data-yoshiki]");
			for (const style of styles) {
				this.completed.push(...(style.dataset.yoshiki ?? " ").split(" "));
				if (!this.styleElement) {
					this.styleElement = style;
					style.dataset.yoshiki = "";
				} else {
					if (style.textContent) toMerge.push(...style.textContent.split("\n"));
					style.remove();
				}
			}
		}

		// If we have something to merge, do it before a flush.
		const toFlush = toMerge.length ? toMerge : this.flush();
		if (!toFlush.length) return;

		if (!this.styleElement) {
			document.head.insertAdjacentHTML(
				"beforeend",
				`<style data-yoshiki="">${this.toStyleString(toFlush)}</style>`,
			);
		} else {
			this.styleElement.textContent = this.toStyleString(toFlush, this.styleElement.textContent);
		}

		// Since we did not flush earlier to merge, we do it now.
		if (toMerge.length) this.flushToBrowser();
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

	toStyleString(classes: string[], existingStyle?: string | null) {
		const newChunks = this.splitInChunks(classes);
		if (!existingStyle) {
			return newChunks
				.map((x, i) => (x.length ? x.join("\n") + `\n/*${i}*/` : null))
				.filter((x) => x)
				.join("\n");
		}

		const lines = existingStyle.split("\n");
		const comReg = new RegExp("/*(\\d+)*/");

		for (const [i, chunk] of newChunks.entries()) {
			if (!chunk.length) continue;
			const pos = findLastIndex(lines, (x) => {
				const match = comReg.exec(x);
				if (!match) return false;
				return parseInt(match[1]) <= i;
			});

			if (pos === -1) {
				// No section with a same or lower priority exists, create one.
				lines.splice(0, 0, ...chunk, `/*${i}*/`);
			} else if (!lines[pos].includes(i.toString())) {
				// Our session does not exist, create one at the right place.
				lines.splice(pos + 1, 0, ...chunk, `/*${i}*/`);
			} else {
				// Append in our section.
				lines.splice(pos, 0, ...chunk);
			}
		}

		return existingStyle;
	}

	splitInChunks(classes: string[]): string[][] {
		const chunks: string[][][] = [...Array(4 /* Normal, Hover, Focus and Active*/)].map(() =>
			[...Array(1 + Object.keys(breakpoints).length)].map(() => []),
		);

		for (const cl of classes) {
			const start = cl.indexOf(".ys-");
			const cn = cl.substring(start, cl.indexOf("-", start + 4));
			const modifier = cn.includes("_") ? cn.substring(4, cn.lastIndexOf("_")) : null;

			if (!modifier) {
				chunks[0][0].push(cl);
				continue;
			}

			const type = ["hover", "focus", "press"].findIndex((x) => modifier.includes(x)) + 1;
			const bp = Object.keys(breakpoints).findIndex((x) => modifier.includes(x)) + 1;

			chunks[type][bp].push(cl);
		}

		return chunks.flat();
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
