//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ComponentType, forwardRef } from "react";
import {
	ActivityIndicator as RNActivityIndicator,
	Image as RNImage,
	ImageBackground as RNImageBackground,
	Modal as RNModal,
	ScrollView as RNScrollView,
	Switch as RNSwitch,
	Text as RNText,
	TextInput as RNTextInput,
	TouchableOpacity as RNTouchableOpacity,
	TouchableHighlight as RNTouchableHighlight,
	TouchableWithoutFeedback as RNTouchableWithoutFeedback,
	Pressable as RNPressable,
	View as RNView,
	ViewProps,
	TextProps,
	ImageProps,
	StyleProp,
	ActivityIndicatorProps,
	TouchableHighlightProps,
	TouchableOpacityProps,
	TextInputProps,
	SwitchProps,
	ScrollViewProps,
	ModalProps,
	ImageBackgroundProps,
	TouchableWithoutFeedbackProps,
	PressableProps,
} from "react-native-web";
import { Stylable as WebStylable } from "../web";

export * from "react-native-web";

declare module "react-native-web" {
	interface ViewStyle {
		$$css?: true;
		yoshiki?: string;
	}

	interface PressableStateCallbackType {
		readonly hovered: boolean;
		readonly focused: boolean;
	}
}

export const patchElementRNW = <Element, Props extends { style?: StyleProp<unknown> }>(
	Component: ComponentType<Omit<Props, "className">>,
) => {
	const ret = forwardRef<Element, Props & WebStylable>(function _YoshikiPatch(
		{ className, ...props },
		ref,
	) {
		return (
			<Component ref={ref} {...props} style={[props.style, className && { $$css: true, yoshiki: className }]} />
		);
	});
	ret.displayName = Component.displayName;
	return ret;
};

export const ActivityIndicator = patchElementRNW<RNActivityIndicator, ActivityIndicatorProps>(
	RNActivityIndicator,
);
export const Image = patchElementRNW<RNImage, ImageProps>(RNImage);
export const ImageBackground = patchElementRNW<RNImageBackground, ImageBackgroundProps>(
	RNImageBackground,
);
export const Modal = patchElementRNW<RNModal, ModalProps>(RNModal);
export const ScrollView = patchElementRNW<RNScrollView, ScrollViewProps>(RNScrollView);
export const Switch = patchElementRNW<RNSwitch, SwitchProps>(RNSwitch);
export const Text = patchElementRNW<RNText, TextProps>(RNText);
export const TextInput = patchElementRNW<RNTextInput, TextInputProps>(RNTextInput);
export const TouchableOpacity = patchElementRNW<RNTouchableOpacity, TouchableOpacityProps>(
	RNTouchableOpacity,
);
export const TouchableHighlight = patchElementRNW<RNTouchableHighlight, TouchableHighlightProps>(
	RNTouchableHighlight,
);
export const TouchableWithoutFeedback = patchElementRNW<
	RNTouchableWithoutFeedback,
	TouchableWithoutFeedbackProps
>(RNTouchableWithoutFeedback);
export const View = patchElementRNW<RNView, ViewProps>(RNView);
export const Pressable = patchElementRNW<RNView, PressableProps>(RNPressable);
