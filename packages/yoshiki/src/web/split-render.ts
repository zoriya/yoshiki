//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Ref, ReactElement, ExoticComponent, forwardRef } from "react";
import type { Stylable } from "../";
import type { Stylable as WebStylable } from "./index";
import type { Stylable as NativeStylable } from "../native";

/**
 * @warning You should not import this function directly since it will always
 * return the web version. You may want to import the splitRender from
 * "yoshiki" directly instead of fron "yoshiki/web".
 */
export const splitRender = <
	WebElement,
	NativeElement,
	Props,
	StyleType extends "text" | "image" | "other" = "other",
>(
	web: (props: Props & WebStylable, ref: Ref<WebElement>) => ReactElement,
	native: (props: Props & NativeStylable<StyleType>, ref: Ref<NativeElement>) => ReactElement,
): ExoticComponent<Props & Stylable> => {
	// @ts-ignore Ignore the Web Stylable that are not assignable. (When native style props are given, the native splitRender function will be called.)
	return forwardRef<WebElement, Props & WebStylable>(web);
};
