//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints, Theme } from "./theme";

export type YoshikiStyle<Property> =
	| Property
	| ((theme: Theme) => Property)
	| Breakpoints<Property>;


export type Breakpoints<Property> = {
	[key in keyof (typeof breakpoints)]?: Property;
};

export interface YoshikiRegistry {
	/**
	* Retrieve all newly created styles not yet flushed.
	* @returns An array of css classes declarations.
	*/
	flush(): string[];
}
