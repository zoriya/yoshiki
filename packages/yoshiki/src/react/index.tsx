//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { CSSProperties } from "react";

export type Stylable = {
	className?: string;
	style?: CSSProperties;
};

export { useYoshiki } from "./generator";
export { StyleRegistryProvider, useStyleRegistry, createStyleRegistry } from "./registry";
