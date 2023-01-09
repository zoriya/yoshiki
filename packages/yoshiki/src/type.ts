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
	hover: { self?: Style; [key: string]: Style | undefined };
	focus: { self?: Style; [key: string]: Style | undefined };
	press: { self?: Style; [key: string]: Style | undefined };
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
export const processStyleListWithChild = <Style>(
	los: StyleList<Style | string>,
	parent: Record<string, Style>,
): Partial<Style> => {
	if (isReadonlyArray(los))
		return los.reduce((acc, x) => ({ ...acc, ...processStyleListWithChild(x, parent) }), {});
	if (!los) return {};
	return typeof los === "string" ? parent[los] ?? {} : los;
};

export const assignChilds = <Style>(
	target: Record<string, Style | undefined>,
	style?: Record<string, Style | undefined>,
) => {
	if (!style) return target;
	for (const entry in style) {
		if (entry === "self") continue;
		if (!target[entry]) target[entry] = style[entry];
		else target[entry] = { ...target[entry], ...style[entry] } as any;
	}
	return target;
};
