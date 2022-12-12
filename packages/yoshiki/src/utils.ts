//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { breakpoints } from "./theme";
import { Breakpoints } from "./type";

export const isBreakpoints = <T>(value: unknown): value is Breakpoints<T> => {
	if (typeof value !== "object" || !value) return false;
	for (const v of Object.keys(value)) {
		if (!(v in breakpoints)) {
			return false;
		}
	}
	return true;
};

export type WithBreakpoints<T> = T extends any ? { [key in keyof T]: Breakpoints<T[key]> } : never;

export const forceBreakpoint = <T extends Record<string, unknown>>(
	value: T,
	breakpoint: keyof typeof breakpoints,
): WithBreakpoints<T> => {
	return Object.fromEntries(
		Object.entries(value).map(([key, value]) => [key, { [breakpoint]: value }]),
	) as any;
};
