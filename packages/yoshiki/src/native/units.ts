//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { PixelRatio, Platform } from "react-native";

export const px = (value: number) => value;
export const percent = (value: number) => `${value}%`;
export const em = (value: number) =>
	Platform.OS === "web" ? `${value}em` : PixelRatio.getFontScale() * 16 * value;
export const rem = Platform.OS === "web" ? (value: number) => `${value}rem` : em;
