//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { splitRender } from "yoshiki";
import { View } from "react-native";
import { ReactNode } from "react";

export const Div = splitRender<HTMLDivElement, View, { children: ReactNode }>(
	function _DivWeb(props, ref) {
		console.log(props);
		return <div ref={ref} {...props}></div>;
	},
	function _DivNat(props, ref) {
		console.log(props)
		return <View ref={ref} {...props}></View>;
	},
);
