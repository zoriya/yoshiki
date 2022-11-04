//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { YoushikiStyle } from "@yoshiki/core";

// TODO: shorhands
type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoushikiStyle<Properties[key]>;
};
export type CssObject = EnhancedStyle<ViewStyle> | EnhancedStyle<TextStyle> | EnhancedStyle<ImageStyle>;
type Properties = ViewStyle | TextStyle | ImageStyle;

export const css = (css: CssObject, leftOvers?: { style?: Properties }) => {
	const { style, ...leftOverProps } = leftOvers ?? {};

	return {
		style: { ...css, ...style } as Properties,
		...leftOverProps,
	};
};
