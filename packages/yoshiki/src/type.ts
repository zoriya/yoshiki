//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints, Theme } from "./theme";

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
