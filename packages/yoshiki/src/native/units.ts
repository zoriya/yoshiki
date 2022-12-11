//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Dimensions, PixelRatio, Platform } from "react-native";

export const px = (value: number) => value;
export const percent = (value: number) => `${value}%`;
// prettier-ignore
export const em = Platform.OS === "web"
	? (value: number): number => `${value}em` as unknown as number
	: (value: number): number => PixelRatio.getFontScale() * 16 * value;
// prettier-ignore
export const rem = Platform.OS === "web"
	? (value: number): number => `${value}rem` as unknown as number
	: em;
// prettier-ignore
export const vw = Platform.OS === "web"
	? (value: number): number => `${value}vw` as unknown as number
	: (value: number): number => value * Dimensions.get("window").width / 100;
// prettier-ignore
export const vh = Platform.OS === "web"
	? (value: number): number => `${value}vh` as unknown as number
	: (value: number): number => value * Dimensions.get("window").height / 100;
