//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import React, { createContext, ReactNode, useContext } from "react";
import { YoshikiRegistry } from "~/type";

class StyleRegistry implements YoshikiRegistry {
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
		this.rules.push([key, rule]);
	}

	addRules(keys: string[], rules: string[]) {
		// I'm sad that sequence is not a thing...
		for (let i = 0; i < keys.length; i++) {
			this.rules.push([keys[i], rules[i]]);
		}
	}

	flush(): string[] {
		const ret = this.rules.filter(([key]) => !this.completed.includes(key));
		console.log(ret);
		this.rules = [];
		this.completed.push(...ret.map(([key]) => key));
		return ret.map(([, value]) => value);
	}

	flushToBrowser() {
		if (!this.styleElement) {
			const styles = document.querySelectorAll<HTMLStyleElement>("style[data-yoshiki]");
			for (const style of styles) {
				this.completed.push(...(style.dataset.yoshiki ?? " ").split(" "));
				if (!this.styleElement) {
					this.styleElement = style;
					style.dataset.yoshiki = "";
				} else {
					this.styleElement.textContent = [this.styleElement.textContent, style.textContent].join(
						"\n",
					);
					style.remove();
				}
			}
		}

		const toFlush = this.flush();
		if (!toFlush.length) return;

		if (!this.styleElement) {
			document.head.insertAdjacentHTML(
				"beforeend",
				`<style data-yoshiki="">${toFlush.join("\n")}</style>`,
			);
		} else {
			this.styleElement.textContent = [this.styleElement.textContent, ...toFlush].join("\n");
		}
	}

	flushToComponent() {
		const toFlush = this.flush();
		if (!toFlush.length) return null;
		return <style data-yoshiki={this.completed.join(" ")}>{toFlush.join("\n")}</style>;
	}
}

const RegistryContext = createContext<StyleRegistry | null>(null);

export const StyleRegistryProvider = ({
	registry,
	children,
}: {
	registry?: StyleRegistry;
	children: ReactNode;
}) => {
	if (!registry && typeof window === "undefined") return children;
	return (
		<RegistryContext.Provider value={registry ?? createStyleRegistry()}>
			{children}
		</RegistryContext.Provider>
	);
};

export const useStyleRegistry = () => useContext(RegistryContext) || new StyleRegistry(true);

export const createStyleRegistry = () => new StyleRegistry();
