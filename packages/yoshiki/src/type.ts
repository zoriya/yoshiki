//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints, Theme } from "./theme";

export type YoshikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property | Breakpoints<Property>)
	| Breakpoints<Property | ((theme: Theme) => Property)>;

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

const isReadonlyArray = (array: unknown): array is ReadonlyArray<unknown> => Array.isArray(array);

export type StyleList<T> = T | undefined | null | false | ReadonlyArray<StyleList<T>>;
export const processStyleList = <Style>(los: StyleList<Style>): Partial<Style> => {
	if (isReadonlyArray(los)) return los.reduce((acc, x) => ({ ...acc, ...processStyleList(x) }), {});
	return los ? los : {};
};
