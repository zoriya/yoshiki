//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { px, useYoshiki } from "yoshiki";
import { P } from "./components/text";

export const Card = () => {
	const { css } = useYoshiki();

	return (
		<P
			{...css({
				backgroundColor: "black",
				p: px(12),
				/* color: "white", */
			})}
		>
			Test
		</P>
	);
};
