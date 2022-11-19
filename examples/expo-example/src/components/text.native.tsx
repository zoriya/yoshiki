//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { forwardRef } from "react";
import { Text } from "react-native";
import { YsNative } from "yoshiki";
import { PProps } from "./text";

export const P = forwardRef<Text, YsNative<PProps>>(function _P({ children, ...props }, ref) {
	return (
		<Text ref={ref} {...props}>
			{children}
		</Text>
	);
});
