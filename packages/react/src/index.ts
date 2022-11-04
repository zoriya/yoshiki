//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Properties } from "csstype";
import { YoushikiStyle } from "@yoshiki/core";

// TODO: shorthands
export type CssObject = {
	[key in keyof Properties]: YoushikiStyle<Properties[key]>;
};

export const css = (css: CssObject) => {
	return {
		styled: {},
	};
};
