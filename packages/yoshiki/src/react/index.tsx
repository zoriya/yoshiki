//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Properties } from "csstype";
import { CSSProperties } from "react";
import { YoshikiStyle } from "../type";

export type CssObject = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
};

export type Stylable = {
	className?: string;
	style?: CSSProperties;
};

export { useYoshiki } from "./generator";
export { StyleRegistryProvider, useStyleRegistry, createStyleRegistry } from "./registry";
