//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Dimensions, PixelRatio, Platform } from "react-native";

export const px =
	Platform.OS === "web"
		? (value: number): number => `${value}px` as unknown as number
		: (value: number): number => value;

export const percent = (value: number) => `${value}%` as const;

export const em =
	Platform.OS === "web"
		? (value: number): number => `${value}em` as unknown as number
		: (value: number): number => PixelRatio.getFontScale() * 16 * value;

export const rem =
	Platform.OS === "web" ? (value: number): number => `${value}rem` as unknown as number : em;

export const vw =
	Platform.OS === "web"
		? (value: number): number => `${value}vw` as unknown as number
		: (value: number): number => (value * Dimensions.get("window").width) / 100;

export const vh =
	Platform.OS === "web"
		? (value: number): number => `${value}vh` as unknown as number
		: (value: number): number => (value * Dimensions.get("window").height) / 100;

export const min =
	Platform.OS === "web"
		? (...values: number[]): number => `min(${values.join(", ")})` as unknown as number
		: (...values: number[]): number => Math.min(...values);

export const max =
	Platform.OS === "web"
		? (...values: number[]): number => `max(${values.join(", ")})` as unknown as number
		: (...values: number[]): number => Math.max(...values);

export const calc =
	Platform.OS === "web"
		? (first: number, operator: "+" | "-" | "*" | "/", second: number): number =>
				`calc(${first} ${operator} ${second})` as unknown as number
		: (first: number, operator: "+" | "-" | "*" | "/", second: number): number => {
				switch (operator) {
					case "+":
						return first + second;
					case "-":
						return first - second;
					case "*":
						return first * second;
					case "/":
						return first / second;
				}
		  };
