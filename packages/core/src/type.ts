//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

export type Theme = {
	// TODO: remove this, just for test purpose
	spacing: string;
};

export const breakpoints = {
	xs: 0,
	sm: 600,
	md: 900,
	lg: 1200,
	xl: 1600,
}

export type YoshikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property)
	| Breakpoints<Property>;


export type Breakpoints<Property> = {
	[key in keyof (typeof breakpoints)]?: Property;
};
