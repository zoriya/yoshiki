//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import { useInsertionEffect } from "react";
import { RegisteredStyle } from "react-native";
import { useTheme } from "../theme";
import { processStyleList, StyleList } from "../type";
import { NativeCssFunc } from "./type";
import createReactDOMStyle from "react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle";
import preprocess from "react-native-web/dist/exports/StyleSheet/preprocess";
import { yoshikiCssToClassNames } from "../web/generator";
import { useStyleRegistry } from "../web";

const rnwPreprocess = (block: Record<string, unknown>) => {
	return createReactDOMStyle(block);
};

export const useYoshiki = () => {
	const registry = useStyleRegistry();
	const theme = useTheme();

	useInsertionEffect(() => {
		registry.flushToBrowser();
	}, [registry]);

	const css: NativeCssFunc = (cssList, leftOvers) => {
		const css = processStyleList(cssList);

		const getStyle = (
			inlineList: StyleList<{ $$css?: true; yoshiki?: string } | RegisteredStyle<unknown>>,
		) => {
			const inline = processStyleList(inlineList);
			const overrides = "$$css" in inline && inline.$$css ? inline.yoshiki : undefined;
			const classNames = yoshikiCssToClassNames(css, overrides?.split(" "), {
				registry,
				theme,
				preprocessBlock: rnwPreprocess,
				preprocess
			});
			return [inline, { $$css: true, yoshiki: classNames }];
		};

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
