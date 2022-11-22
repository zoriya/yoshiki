//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { forwardRef } from "react";
import { YsWeb } from "yoshiki";
import { PProps } from "./text";

export const P = forwardRef<HTMLParagraphElement, YsWeb<PProps>>(function _P(
	{ children, ...props },
	ref,
) {
	return (
		<p ref={ref} {...props}>
			{children}
		</p>
	);
});
