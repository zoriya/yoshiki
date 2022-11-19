//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints, Theme } from "./theme";
import { Properties as _CssProperties } from "csstype";
import { shorthandsFn } from "./shorthands";

export type YoshikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property | Breakpoints<Property>)
	| Breakpoints<Property>;

export type Breakpoints<Property> = {
	[key in keyof typeof breakpoints]?: Property;
};

export type WithState<Style> = {
	hover: Style;
	focus: Style;
	press: Style;
};
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export const hasState = <Style>(obj: unknown): obj is WithState<Style> => {
	if (!obj || typeof obj !== "object") return false;
	return "hover" in obj || "focus" in obj || "press" in obj;
};

// dummy type only used for the API.
export type Length = { a: 1 };
export type CssProperties = _CssProperties<0 | Length>;

type FilterOrNever<T, Filter> = T extends Filter ? Filter : never;
type FilterOr<T, Filter> = [FilterOrNever<T, Filter>] extends [never] ? T : Filter;

type CombineWithLength<A, B> = {
	[key in keyof A & keyof B]?: FilterOr<(A & B)[key], Length>;
};
export type CommonCss<Style> = CombineWithLength<CssProperties, Style>;

export type CommonStyle<Style> = {
	[key in keyof CommonCss<Style>]: YoshikiStyle<CommonCss<Style>[key]>;
};

export type EnhancedStyle<Style> = CommonStyle<Style> & {
	[key in keyof typeof shorthandsFn]?: Parameters<typeof shorthandsFn[key]>[0];
};

export type PlatformT = "web" | "ios" | "android" | "windows" | "macos";
