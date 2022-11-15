//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useState } from "react";
import { Pressable as RPressable, PressableProps, StyleProp, ViewStyle } from "react-native";

export const Pressable = ({
	children,
	onHoverIn,
	onHoverOut,
	onFocus,
	onBlur,
	style,
	...props
}: {
	style:
		| PressableProps["style"]
		| ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => StyleProp<ViewStyle>);
} & PressableProps) => {
	const [hovered, setHover] = useState(false);
	const [focused, setFocus] = useState(false);

	return (
		<RPressable
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
};
