//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { forwardRef, useState } from "react";
import {
	Pressable as RPressable,
	PressableProps,
	StyleProp,
	View,
	ViewStyle,
} from "react-native";

export const Pressable = forwardRef<
	View,
	Omit<PressableProps, "style"> & {
		style?:
			| StyleProp<ViewStyle>
			| ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => StyleProp<ViewStyle>);
	}
>(function _Pressable({ children, onHoverIn, onHoverOut, onFocus, onBlur, style, ...props }, ref) {
	const [hovered, setHover] = useState(false);
	const [focused, setFocus] = useState(false);

	return (
		<RPressable
			ref={ref}
			onHoverIn={(e) => {
				onHoverIn?.call(null, e);
				setHover(true);
			}}
			onHoverOut={(e) => {
				onHoverOut?.call(null, e);
				setHover(false);
			}}
			onFocus={(e) => {
				onFocus?.call(null, e);
				setFocus(true);
			}}
			onBlur={(e) => {
				onBlur?.call(null, e);
				setFocus(false);
			}}
			style={
				typeof style === "function" ? ({ pressed }) => style({ pressed, hovered, focused }) : style
			}
			{...props}
		>
			{children}
		</RPressable>
	);
});
