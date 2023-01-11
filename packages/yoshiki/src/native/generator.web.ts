//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import { useInsertionEffect } from "react";
import { RegisteredStyle } from "react-native";
import { useTheme } from "../theme";
import { hasState, processStyleList, processStyleListWithoutChild, StyleList } from "../type";
import { NativeCssFunc } from "./type";
import createReactDOMStyle from "react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle";
import preprocess from "react-native-web/dist/exports/StyleSheet/preprocess";
import { useClassId, generateChildCss, yoshikiCssToClassNames } from "../web/generator";
import { useStyleRegistry } from "../web";

const rnwPreprocess = (block: Record<string, unknown>) => {
	return createReactDOMStyle(block);
};

export const useYoshiki = (prefixKey?: string) => {
	const registry = useStyleRegistry();
	const theme = useTheme();
	const [parentPrefix, childPrefix] = useClassId(prefixKey);

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	const css: NativeCssFunc = (cssList, leftOvers) => {
		const [css, parentKeys] = processStyleListWithoutChild(cssList);

		const getStyle = (
			inlineList: StyleList<{ $$css?: true; yoshiki?: string } | RegisteredStyle<unknown>>,
		) => {
			const inline = processStyleList(inlineList);
			const overrides = "$$css" in inline && inline.$$css ? inline.yoshiki : undefined;
			const classNames = yoshikiCssToClassNames(
				css,
				[...parentKeys.map((x) => `${childPrefix}${x}`), ...(overrides?.split(" ") ?? [])],
				{
					parentPrefix,
					registry,
					theme,
					preprocessBlock: rnwPreprocess,
					preprocess,
				},
			);
			// We use the inlineList and not the inline we have locally since $$css and inlines are not mergable.
			return [inlineList, { $$css: true, yoshiki: classNames }];
		};

		if (hasState(css)) {
			generateChildCss(css, {
				parentPrefix,
				childPrefix,
				registry,
				theme,
				preprocess,
				preprocessBlock: rnwPreprocess,
			});
		}

		const loStyle = leftOvers?.style;
		const style =
			typeof loStyle === "function"
				? (state: { hovered?: boolean; focused?: boolean; pressed?: boolean }) =>
						getStyle(loStyle(state))
				: getStyle(loStyle);

		return {
			...leftOvers,
			style,
		};
	};
	return {
		css,
		theme,
	};
};
