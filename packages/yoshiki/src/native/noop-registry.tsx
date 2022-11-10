//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ReactNode } from "react";
import { YoshikiRegistry } from "~/type";

class NoopRegistry implements YoshikiRegistry {
	flush(): string[] {
		return [];
	}
}

export const StyleRegistryProvider = ({
	registry,
	children,
}: {
	registry?: YoshikiRegistry;
	children: ReactNode;
}) => {
	return children;
};

export const createStyleRegistry = () => new NoopRegistry();
export const useStyleRegistry = createStyleRegistry;

