//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { px, useYoshiki } from "yoshiki";
import { P } from "./components/text/text";
import { Div } from "./components/div";

export const Card = () => {
	const { css } = useYoshiki();

	return (
		<Div {...css({ backgroundColor: { xs: "green", md: "blue" } })}>
			<P
				{...css({
					backgroundColor: "black",
					m: px(12),
					color: "white",
				})}
			>
				Test
			</P>
		</Div>
	);
};
