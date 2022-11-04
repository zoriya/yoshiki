//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

export type Theme = {
	// TODO: remove this, just for test purpose
	spacing: string;
};

export type YoushikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property)
	| Breakpoints<Property>;

export type Breakpoints<Property> = {
	sm?: Property;
	md?: Property;
	lg?: Property;
	xl?: Property;
};
