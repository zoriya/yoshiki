//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

declare module "react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle" {
	const createReactDOMStyle: (
		style: Record<string, unknown>,
		isInline?: boolean,
	) => Record<string, unknown>;
	export default createReactDOMStyle;
}
