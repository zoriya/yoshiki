//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import { useInsertionEffect } from "react";
import { ImageStyle, RegisteredStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { processStyleList, StyleList, WithState } from "../type";
import { EnhancedStyle } from "./type";
import createReactDOMStyle from "react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle";
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

	return {
		css: <
			Style extends ViewStyle | TextStyle | ImageStyle,
			State extends Partial<WithState<EnhancedStyle<Style>>> | Record<string, never>,
			Leftover,
		>(
			cssList: StyleList<EnhancedStyle<Style> & State>,
			leftOvers?: { style?: StyleProp<Style> } & Leftover,
		): { style: Style } & Omit<Leftover, "style"> => {
			const css = processStyleList(cssList);
			const inline = processStyleList<Style | RegisteredStyle<Style>>(leftOvers?.style);
			const overrides = "$$css" in inline && inline.$$css ? inline.yoshiki : undefined;
			const classNames = yoshikiCssToClassNames(css, overrides?.split(" "), {
				registry,
				theme,
				preprocessBlock: rnwPreprocess,
			});
			return {
				...leftOvers,
				style: [inline, { $$css: true, yoshiki: classNames } as Style],
			} as any;
		},
		theme,
	};
};
